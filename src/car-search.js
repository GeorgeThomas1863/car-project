import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SERVICE_TIER_MAP = {
  priority: "auto",
  default: "standard_only",
  flex: "standard_only",
};

const SYSTEM_PROMPT = `You are a professional car shopping assistant. Your job is to search the web for real, currently-listed vehicles that match the user's criteria. Use the web_search tool to search major platforms including AutoTrader, Cars.com, CarGurus, CarMax, and local dealer sites.

CRITICAL OUTPUT RULE: You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON. Do not use markdown code fences. Do not explain your findings in prose. Your entire response must be parseable by JSON.parse().

Return JSON matching this exact schema:
{
  "summary": "Brief description of what you searched for and how many results you found",
  "listings": [
    {
      "url": "https://direct-listing-url",
      "year": 2022,
      "make": "Toyota",
      "model": "Camry",
      "trim": "XSE V6",
      "price": 28500,
      "mileage": 12000,
      "condition": "used",
      "source": "AutoTrader",
      "seller": "ABC Toyota",
      "location": "Beverly Hills, CA",
      "missing_criteria": []
    }
  ],
  "alternatives": [
    {
      "url": "https://...",
      "year": 2021,
      "make": "Toyota",
      "model": "Camry",
      "trim": "SE",
      "price": 24000,
      "mileage": 28000,
      "condition": "used",
      "source": "Cars.com",
      "seller": "XYZ Motors",
      "location": "Santa Monica, CA",
      "missing_criteria": ["color: white (found: silver)", "mileage above requested range"]
    }
  ],
  "notes": "Any additional notes or caveats about the search results"
}

Rules:
- "listings" are EXACT matches to ALL criteria. missing_criteria must be [].
- "alternatives" are near-matches. missing_criteria must list every deviation as a plain English string.
- Return only INDIVIDUAL listing URLs (direct car pages), NOT search result pages.
- If fewer than 3 exact matches found, include closest alternatives.
- price: integer (no currency symbols). mileage: integer. year: integer.
- If a field is unknown/unavailable, use null.`;

const buildUserMessage = (params) => {
  const priceMin = parseInt(params.priceMin, 10);
  const priceMax = parseInt(params.priceMax, 10);
  const priceMinLabel = priceMin <= 0 ? "Any" : "$" + Number(priceMin).toLocaleString("en-US");
  const priceMaxLabel = priceMax >= 100000 ? "$100,000+" : "$" + Number(priceMax).toLocaleString("en-US");

  const radiusLabel = params.searchRadius === "any" ? "nationwide (any radius)" : `${params.searchRadius} miles`;
  const modelLabel = !params.model || params.model === "any" ? "any model" : params.model;
  const makeLabel = !params.make || params.make === "any" ? "any make" : params.make;
  const colorLabel = !params.color || params.color === "any" ? "any color" : params.color;
  const conditionLabel =
    params.condition === "new" ? "new only" :
    params.condition === "used" ? "used only" :
    "new or used";

  const extraFilters = [];
  if (params.engineType && params.engineType !== "any") extraFilters.push(`Engine type: ${params.engineType}`);
  if (params.leatherSeats === true || params.leatherSeats === "true") extraFilters.push("Leather seats required");
  if (params.sunroof === true || params.sunroof === "true") extraFilters.push("Sunroof required");
  if (params.awd === true || params.awd === "true") extraFilters.push("AWD/4WD required");
  if (params.heatedSeats === true || params.heatedSeats === "true") extraFilters.push("Heated seats required");
  if (params.carPlay === true || params.carPlay === "true") extraFilters.push("Apple CarPlay/Android Auto required");

  const extraFiltersBlock = extraFilters.length > 0
    ? `\n  <extra_features>${extraFilters.map(f => `\n    <feature>${f}</feature>`).join("")}\n  </extra_features>`
    : "";

  const detailsBlock = params.details && params.details.trim()
    ? `\n\n<additional_details>\n${params.details.trim()}\n</additional_details>`
    : "";

  return `<criteria>
  <condition>${conditionLabel}</condition>
  <zip_code>${params.zipCode || "not specified"}</zip_code>
  <search_radius>${radiusLabel}</search_radius>
  <make>${makeLabel}</make>
  <model>${modelLabel}</model>
  <color>${colorLabel}</color>
  <price_range>${priceMinLabel} – ${priceMaxLabel}</price_range>${extraFiltersBlock}
</criteria>${detailsBlock}

Search for vehicles matching these criteria. Return ONLY valid JSON per the schema in your instructions.`;
};

const extractJSON = (text) => {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try to extract JSON object from within surrounding text
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        // fall through
      }
    }
    console.error("[car-search] Failed to parse JSON response. Raw text (first 500 chars):", trimmed.slice(0, 500));
    return null;
  }
};

export const carSearchAI = async (params) => {
  if (!params) return null;

  const apiTier = SERVICE_TIER_MAP[params.serviceTier] ?? "auto";
  const extendedThinking = params.extendedThinking === true || params.extendedThinking === "true";
  const maxTokens = Math.max(extendedThinking ? 2048 : 1000, parseInt(params.maxTokens, 10) || 50000);

  const thinkingConfig = extendedThinking
    ? { type: "enabled", budget_tokens: Math.min(Math.max(1024, Math.floor(maxTokens * 0.8)), maxTokens - 1) }
    : undefined;

  const apiParams = {
    model: params.modelType || "claude-sonnet-4-6",
    max_tokens: maxTokens,
    temperature: 1,
    system: SYSTEM_PROMPT,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{ role: "user", content: buildUserMessage(params) }],
    service_tier: apiTier,
    ...(thinkingConfig ? { thinking: thinkingConfig } : {}),
  };

  try {
    const response = await client.messages.create(apiParams);

    const textBlocks = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    if (!textBlocks) {
      console.error("[car-search] No text blocks in response");
      return null;
    }

    return extractJSON(textBlocks);
  } catch (err) {
    console.error("[car-search] API error:", err.message, "status:", err.status);
    return null;
  }
};

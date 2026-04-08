import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";
import dotenv from "dotenv";
import DbModel from "../models/db-model.js";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CAR_CACHE_COLLECTION = "car-search-cache";
const CAR_HISTORY_COLLECTION = "car-search-history";

const SERVICE_TIER_MAP = {
  priority: "auto",
  default: "standard_only",
  flex: "standard_only",
};

const QUERY_BUILDER_SYSTEM = `You are a Marketcheck API query parameter translator. Convert car search form inputs into Marketcheck API query parameters as a JSON object.

OUTPUT RULE: Respond with ONLY valid JSON. No markdown, no code fences, no text before or after the JSON object. Never invent values not present in the input.

Parameter mapping:
- zip: user's zip code as a string. If searchRadius is "any", OMIT zip entirely. If searchRadius is set and zip is not specified, assume the zip code is 22030.  
- radius: search radius as an integer. If searchRadius is "any", OMIT entirely (omitting both zip and radius means nationwide). If searchRadius is a number, include it.
- car_type: "new" if condition=new, "used" if condition=used. Omit if condition is "any".
- make: lowercase make string. Omit if "any", unspecified, or if make is "chinese".
- model: lowercase model string. Omit if "any" or blank.
- price_range: Apply this logic:
    - priceMin<=0 AND priceMax>=100000 → omit price_range entirely
    - priceMin>0 AND priceMax>=100000 → "{priceMin}:9999999"
    - priceMin<=0 AND priceMax<100000 → "0:{priceMax}"
    - priceMin>0 AND priceMax<100000 → "{priceMin}:{priceMax}"
- exterior_color: the color value as a string. Omit if "any".
- fuel_type: "gas" for gas/ICE, "electric" for electric, "hybrid" for hybrid. Omit if "any".
- hvf: comma-separated high value features string. Include ONLY checked features:
    - leatherSeats=true → "Leather Seats"
    - sunroof=true → "Panoramic Roof"
    - awd=true → "All Wheel Drive"
    - heatedSeats=true → "Heated Front Seat(s)"
    - carPlay=true → "Apple CarPlay"
    Omit hvf entirely if none are checked.
- rows: always set to 25

Details field instructions: Read the details field for additional concrete criteria and extract ALL of the following:
- Year range (e.g. "2020 or newer") → add year_min and/or year_max as integers
- Mileage limit (e.g. "under 50k miles") → add mileage_range as "0:50000"
- Specific make/model mentions → add or override make/model fields accordingly
- Color mentions (e.g. "black car", "I want white", "prefer silver") → set or override exterior_color
- Fuel type mentions (e.g. "electric only", "hybrid", "gas") → set or override fuel_type
- Condition mentions (e.g. "only new", "used is fine") → set or override car_type
- Feature mentions → add to hvf (deduplicate — never list the same feature twice):
    - sunroof / panoramic roof / moonroof → "Panoramic Roof"
    - leather seats / leather interior → "Leather Seats"
    - awd / all wheel drive / 4wd / four wheel drive → "All Wheel Drive"
    - heated seats / heated front seats → "Heated Front Seat(s)"
    - carplay / apple carplay → "Apple CarPlay"
- Price constraints from text (e.g. "under $30k", "budget $25,000") → inform price_range
- If the details text clearly states a value that conflicts with a form field selection, the text wins.
- Ignore subjective preferences ("sporty", "nice looking", "comfortable").

Example output:
{
  "zip": "90210",
  "radius": 50,
  "car_type": "used",
  "make": "toyota",
  "model": "camry",
  "price_range": "10000:30000",
  "exterior_color": "white",
  "fuel_type": "gas",
  "hvf": "Leather Seats,All Wheel Drive",
  "year_min": 2020,
  "mileage_range": "0:60000",
  "rows": 25
}`;

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

function buildQueryHash(marketcheckParams) {
  const stable = JSON.stringify(Object.fromEntries(Object.entries(marketcheckParams).sort()));
  return crypto.createHash("sha256").update(stable).digest("hex").slice(0, 32);
}

function buildQueryBuilderMessage(params) {
  const boolVal = (val) => (val === true || val === "true" ? "true" : "false");

  return `zip_code: ${params.zipCode || "not specified"}
radius: ${params.searchRadius || "any"}
condition: ${params.condition || "any"}
make: ${params.make || "any"}
model: ${params.model || "any"}
color: ${params.color || "any"}
price_min: ${params.priceMin ?? 0}
price_max: ${params.priceMax ?? 100000}
engine_type: ${params.engineType || "any"}
leather_seats: ${boolVal(params.leatherSeats)}
sunroof: ${boolVal(params.sunroof)}
awd: ${boolVal(params.awd)}
heated_seats: ${boolVal(params.heatedSeats)}
carplay: ${boolVal(params.carPlay)}
details: ${params.details || ""}`;
}

async function buildMarketcheckParams(params) {
  const apiTier = SERVICE_TIER_MAP[params.serviceTier] ?? "auto";
  const messages = [{ role: "user", content: buildQueryBuilderMessage(params) }];

  const response = await client.messages.create({
    model: params.modelType || "claude-sonnet-4-6",
    max_tokens: 512,
    temperature: 0,
    system: QUERY_BUILDER_SYSTEM,
    messages,
    service_tier: apiTier,
  });
  const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
  const parsed = extractJSON(text);
  if (parsed !== null) return parsed;

  // Claude returned prose — retry with an explicit correction message
  console.warn("[car-search] First response was not JSON — retrying with correction prompt.");
  messages.push({ role: "assistant", content: text });
  messages.push({ role: "user", content: "Your previous response was not valid JSON. Output ONLY the JSON object with no explanation, no markdown, no code fences — just the raw JSON." });

  const retry = await client.messages.create({
    model: params.modelType || "claude-sonnet-4-6",
    max_tokens: 512,
    temperature: 0,
    system: QUERY_BUILDER_SYSTEM,
    messages,
    service_tier: apiTier,
  });
  const retryText = retry.content.filter(b => b.type === "text").map(b => b.text).join("");
  const retryParsed = extractJSON(retryText);
  if (retryParsed !== null) return retryParsed;

  console.error("[car-search] Both JSON parse attempts failed. Last raw response:", retryText.slice(0, 300));
  throw Object.assign(new Error("query_build_failed"), { queryBuildFailed: true });
}

async function fetchMarketcheckListings(marketcheckParams) {
  const url = new URL("https://mc-api.marketcheck.com/v2/search/car/active");
  url.searchParams.set("api_key", process.env.MARKETCHECK_API_KEY);

  for (const [key, value] of Object.entries(marketcheckParams)) {
    if (value === null || value === undefined || value === "") continue;
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Marketcheck API error ${response.status}: ${body.slice(0, 200)}`);
  }

  return response.json();
}

function transformMarketcheckResponse(data) {
  const SOURCE_MAP = {
    "autotrader.com": "AutoTrader",
    "cars.com": "Cars.com",
    "cargurus.com": "CarGurus",
    "carmax.com": "CarMax",
    "vroom.com": "Vroom",
  };

  return (data.listings || []).map((item) => {
    let source = "Marketcheck";
    if (item.vdp_url) {
      try {
        const hostname = new URL(item.vdp_url).hostname.replace(/^www\./, "");
        source = SOURCE_MAP[hostname] || hostname;
      } catch {
        source = "Marketcheck";
      }
    }

    let condition = "used";
    if (item.car_type) {
      condition = item.car_type;
    } else if (item.miles === 0) {
      condition = "new";
    }

    const city = item.dealer?.city || null;
    const state = item.dealer?.state || null;
    const locationParts = [city, state].filter(Boolean);

    return {
      url: item.vdp_url || null,
      year: item.build?.year || null,
      make: item.build?.make || null,
      model: item.build?.model || null,
      trim: item.build?.trim || null,
      price: item.price || null,
      mileage: item.miles != null ? item.miles : null,
      condition,
      source,
      seller: item.dealer?.name || null,
      location: locationParts.length > 0 ? locationParts.join(", ") : null,
      availability_note: `Active listing via Marketcheck (${item.dom ?? "?"} days on market)`,
      missing_criteria: [],
    };
  });
}

function extractFormParams(params) {
  const { aiType, modelType, serviceTier, maxTokens, temperature, extendedThinking, route, ...rest } = params;
  return rest;
}

function buildZeroResultsSummary(marketcheckParams) {
  const make = marketcheckParams.make || "";
  const model = marketcheckParams.model || "";
  const label = [make, model].filter(Boolean).join(" ") || "vehicle";
  return `No ${label} listings found matching your criteria.`;
}

async function generateSummary(params, marketcheckParams, numFound, listingCount) {
  const make = marketcheckParams.make || "any make";
  const model = marketcheckParams.model || "any model";
  const condition = marketcheckParams.car_type || "new or used";
  const location = marketcheckParams.zip
    ? `near zip ${marketcheckParams.zip}` + (marketcheckParams.radius ? ` within ${marketcheckParams.radius} miles` : "")
    : "nationwide";

  const prompt = `Write a 2-sentence summary for a car search that found ${numFound} total listings (showing ${listingCount}). The search was for ${condition} ${make} ${model} vehicles ${location}.`;

  try {
    const response = await client.messages.create({
      model: params.modelType || "claude-sonnet-4-6",
      max_tokens: 200,
      temperature: parseFloat(params.temperature) || 1.0,
      messages: [{ role: "user", content: prompt }],
      service_tier: SERVICE_TIER_MAP[params.serviceTier] ?? "auto",
    });
    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    return text.trim();
  } catch (err) {
    console.error("[car-search] generateSummary error:", err.message);
    return `Found ${numFound} listings matching your criteria. Showing ${listingCount} results.`;
  }
}

async function getCachedResult(queryHash) {
  try {
    const model = new DbModel({ keyToLookup: "queryHash", itemValue: queryHash }, CAR_CACHE_COLLECTION);
    const cached = await model.getUniqueItem();
    if (!cached) return null;
    if (Date.now() - new Date(cached.cachedAt).getTime() > CACHE_TTL_MS) return null;
    return cached.data;
  } catch {
    return null;
  }
}

async function setCachedResult(queryHash, data, marketcheckParams) {
  try {
    const model = new DbModel(
      { queryHash, marketcheckParams, data, cachedAt: new Date().toISOString() },
      CAR_CACHE_COLLECTION
    );
    await model.storeAny();
  } catch (err) {
    console.error("[car-search] setCachedResult error:", err.message);
  }
}

async function saveSearchHistory({ queryHash, formParams, marketcheckParams, numFound, numListingsReturned, cacheHit }) {
  try {
    const model = new DbModel(
      { queryHash, formParams, marketcheckParams, numFound, numListingsReturned, cacheHit, searchedAt: new Date().toISOString() },
      CAR_HISTORY_COLLECTION
    );
    await model.storeAny();
  } catch (err) {
    console.error("[car-search] saveSearchHistory error:", err.message);
  }
}

export const carSearchAI = async (params) => {
  if (!params) return null;

  // console.log("INPUT PARAMS");
  // console.log(params);  

  // Step 1: Build Marketcheck params via Claude
  let marketcheckParams;
  try {
    marketcheckParams = await buildMarketcheckParams(params);
  } catch (err) {
    if (err.queryBuildFailed) {
      return {
        summary: "Something went wrong building your search query — the AI assistant returned an unexpected response. Please try again or simplify your search.",
        listings: [],
        alternatives: [],
        notes: "If this keeps happening, try removing some filters or rephrasing your details.",
        error: "query_build_failed",
      };
    }
    console.error("[car-search] buildMarketcheckParams error:", err.message);
    return null;
  }

  if (marketcheckParams === null || typeof marketcheckParams !== "object") {
    console.error("[car-search] buildMarketcheckParams returned invalid result:", marketcheckParams);
    return null;
  }

  // Step 2: Ensure rows is set and radius is within subscription cap
  marketcheckParams.rows = marketcheckParams.rows || 25;
  if (typeof marketcheckParams.radius === "number") {
    marketcheckParams.radius = Math.min(marketcheckParams.radius, 100);
  }

  // Step 3: Build query hash
  const queryHash = buildQueryHash(marketcheckParams);

  // Step 4: Check cache
  let marketcheckData = await getCachedResult(queryHash);
  const cacheHit = !!marketcheckData;

  // Step 5: Fetch from API if not cached
  if (!cacheHit) {
    try {
      marketcheckData = await fetchMarketcheckListings(marketcheckParams);
    } catch (err) {
      console.error("[car-search] fetchMarketcheckListings error:", err.message);
      return null;
    }
    void setCachedResult(queryHash, marketcheckData, marketcheckParams);
  }

  // Step 6: Save search history (fire-and-forget)
  void saveSearchHistory({
    queryHash,
    formParams: extractFormParams(params),
    marketcheckParams,
    numFound: marketcheckData.num_found || 0,
    numListingsReturned: (marketcheckData.listings || []).length,
    cacheHit,
  });

  // Step 7: Transform listings
  const listings = transformMarketcheckResponse(marketcheckData);

  // Step 8: Zero results
  if (listings.length === 0) {
    return {
      summary: buildZeroResultsSummary(marketcheckParams),
      listings: [],
      alternatives: [],
      notes: "Try expanding your search radius, adjusting your price range, or removing some filters.",
    };
  }

  // Step 9: Generate summary
  const summary = await generateSummary(
    params,
    marketcheckParams,
    marketcheckData.num_found || listings.length,
    listings.length
  );

  // Step 10: Return result
  return {
    summary,
    listings,
    alternatives: [],
    notes: `Showing ${listings.length} of ${marketcheckData.num_found || listings.length} total listings found. Data from Marketcheck.`,
  };
};

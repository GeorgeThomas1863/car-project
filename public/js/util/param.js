export const buildMainParams = async () => {
  const params = {
    route: "/main-submit",
    aiType: document.getElementById("ai-type-select").value,
    modelType: document.getElementById("model-select").value,
    serviceTier: document.getElementById("priority-select").value,
    maxTokens: document.getElementById("max-tokens-input").value,
    temperature: document.getElementById("temperature-input").value,
    extendedThinking: document.getElementById("extended-thinking-checkbox").checked,
    zipCode: document.getElementById("zip-code-input").value,
    searchRadius: document.getElementById("search-radius-select").value,
    condition: document.getElementById("condition-select").value,
    make: document.getElementById("make-select").value,
    color: document.getElementById("color-select").value,
    model: document.getElementById("car-model-select").value,
    priceMin: document.getElementById("price-min-input").value,
    priceMax: document.getElementById("price-max-input").value,
    details: document.getElementById("car-details").value,
    engineType: document.getElementById("engine-type-select").value,
    leatherSeats: document.getElementById("leather-seats-checkbox").checked,
    sunroof: document.getElementById("sunroof-checkbox").checked,
    awd: document.getElementById("awd-checkbox").checked,
    heatedSeats: document.getElementById("heated-seats-checkbox").checked,
    carPlay: document.getElementById("carplay-checkbox").checked,
  };
  return params;
};

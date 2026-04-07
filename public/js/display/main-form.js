import { buildCollapseContainer } from "./collapse.js";
import { EXPAND_OPTIONS_SVG, EXTRA_FILTERS_EXPAND_SVG } from "../util/define-things.js";

export const buildMainForm = async () => {
  const inputFormWrapper = document.createElement("div");
  inputFormWrapper.id = "input-form-wrapper";

  const inputTitleElement = document.createElement("h2");
  inputTitleElement.innerHTML = `Tool to Force Claude to Find You a Car`;
  inputTitleElement.className = "form-title";

  const inputFormElement = document.createElement("div");
  inputFormElement.id = "input-form-element";
  inputFormElement.className = "form-element";

  const selectRowListItem = await buildSelectRowListItem();
  const modelOptionsListItem = await buildModelOptionsListItem();

  const carFiltersListItem = await buildCarFiltersListItem();
  const makeColorModelListItem = await buildMakeColorModelListItem();
  const extraFiltersListItem = await buildExtraFiltersListItem();
  const priceRangeListItem = await buildPriceRangeListItem();

  const pasteJobListItem = await buildPasteJobListItem();
  const submitListItem = await buildSubmitListItem();

  // inputFormElement.append(inputTypeListItem, uploadListItem, selectRowListItem, modelOptionsListItem, pasteJobListItem, submitListItem);
  inputFormElement.append(
    selectRowListItem,
    modelOptionsListItem,
    carFiltersListItem,
    makeColorModelListItem,
    extraFiltersListItem,
    priceRangeListItem,
    pasteJobListItem,
    submitListItem
  );

  // Build collapse container
  const collapseContainer = await buildCollapseContainer({
    titleElement: inputTitleElement,
    contentElement: inputFormElement,
    isExpanded: true,
    className: "",
    dataAttribute: "",
  });

  inputFormWrapper.append(collapseContainer);

  return inputFormWrapper;
};

//----------

export const buildSelectRowListItem = async () => {
  const selectRowContainer = document.createElement("li");
  selectRowContainer.id = "select-row-container";
  selectRowContainer.className = "form-list-item form-row";

  const selectAIDiv = await buildSelectAIDiv();
  const selectModelDiv = await buildSelectModelDiv();
  const modelOptionsToggle = await buildModelOptionsToggle();

  selectRowContainer.append(selectAIDiv, selectModelDiv, modelOptionsToggle);

  return selectRowContainer;
};

export const buildSelectAIDiv = async () => {
  const selectAIDiv = document.createElement("div");
  selectAIDiv.id = "select-ai-div";
  selectAIDiv.className = "form-select-half";

  const selectAILabel = document.createElement("label");
  selectAILabel.setAttribute("for", "ai-type-select");
  selectAILabel.textContent = "Select AI";
  selectAILabel.className = "form-label";

  const aiSelectType = document.createElement("select");
  aiSelectType.id = "ai-type-select";
  aiSelectType.className = "form-select";
  // aiSelectType.setAttribute("data-label", "ai-type-select");

  const optionArray = [
    { value: "claude", text: "Claude", selected: true },
    { value: "chatgpt", text: "ChatGPT [DOES NOT WORK]" },
    { value: "local", text: "Local LLM [DOES NOT WORK]" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;

    aiSelectType.append(option);
  }

  selectAIDiv.append(selectAILabel, aiSelectType);

  return selectAIDiv;
};

export const buildSelectModelDiv = async () => {
  const selectModelDiv = document.createElement("div");
  selectModelDiv.id = "select-model-div";
  selectModelDiv.className = "form-select-half";

  const selectModelLabel = document.createElement("label");
  selectModelLabel.setAttribute("for", "model-select");
  selectModelLabel.textContent = "Select Model";
  selectModelLabel.className = "form-label";

  const modelSelect = document.createElement("select");
  modelSelect.id = "model-select";
  modelSelect.className = "form-select";
  modelSelect.setAttribute("data-label", "model-select");

  const optionArray = [
    { value: "claude-opus-4-6", text: "Claude Opus 4.6", selected: true },
    { value: "claude-sonnet-4-6", text: "Claude Sonnet 4.6" },
    { value: "claude-haiku-4-5-20251001", text: "Claude Haiku 4.5" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;

    modelSelect.append(option);
  }

  selectModelDiv.append(selectModelLabel, modelSelect);

  return selectModelDiv;
};

export const buildModelOptionsToggle = async () => {
  const modelOptionsToggle = document.createElement("div");
  modelOptionsToggle.id = "model-options-toggle";
  modelOptionsToggle.className = "form-select-half";

  const modelOptionsLabel = document.createElement("label");
  modelOptionsLabel.setAttribute("for", "model-options-select");
  modelOptionsLabel.textContent = "AI Options";
  modelOptionsLabel.className = "form-label";

  const toggleWrapper = document.createElement("div");
  toggleWrapper.className = "toggle-wrapper";
  toggleWrapper.setAttribute("data-label", "modelOptionsToggle");

  const toggleButton = document.createElement("button");
  toggleButton.id = "toggle-button";
  toggleButton.className = "model-options-toggle-btn";
  toggleButton.setAttribute("data-label", "modelOptionsToggle");
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-label", "Toggle model options");
  toggleButton.innerHTML = EXPAND_OPTIONS_SVG;

  toggleWrapper.append(toggleButton);

  modelOptionsToggle.append(modelOptionsLabel, toggleWrapper);

  return modelOptionsToggle;
};

export const buildExtraFiltersToggle = async () => {
  const extraFiltersToggle = document.createElement("div");
  extraFiltersToggle.id = "extra-filters-toggle";
  extraFiltersToggle.className = "form-select-half";

  const extraFiltersLabel = document.createElement("label");
  extraFiltersLabel.setAttribute("for", "extra-filters-toggle-btn");
  extraFiltersLabel.textContent = "More Filters";
  extraFiltersLabel.className = "form-label";

  const toggleWrapper = document.createElement("div");
  toggleWrapper.className = "toggle-wrapper";
  toggleWrapper.setAttribute("data-label", "extraFiltersToggle");

  const toggleButton = document.createElement("button");
  toggleButton.id = "extra-filters-toggle-btn";
  toggleButton.className = "model-options-toggle-btn";
  toggleButton.setAttribute("data-label", "extraFiltersToggle");
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-label", "Toggle extra filters");
  toggleButton.innerHTML = EXTRA_FILTERS_EXPAND_SVG;

  toggleWrapper.append(toggleButton);
  extraFiltersToggle.append(extraFiltersLabel, toggleWrapper);

  return extraFiltersToggle;
};

//----

export const buildModelOptionsListItem = async () => {
  const modelOptionsListItem = document.createElement("li");
  modelOptionsListItem.id = "model-options-list-item";
  modelOptionsListItem.className = "form-list-item form-row";
  modelOptionsListItem.classList.add("hidden");

  const priorityDiv = await buildPriorityDiv();
  const maxTokensDiv = await buildMaxTokensDiv();
  const temperatureDiv = await buildTemperatureDiv();
  const extendedThinkingDiv = await buildExtendedThinkingDiv();

  modelOptionsListItem.append(priorityDiv, maxTokensDiv, temperatureDiv, extendedThinkingDiv);

  return modelOptionsListItem;
};

//for service_tier
export const buildPriorityDiv = async () => {
  const priorityDiv = document.createElement("div");
  priorityDiv.id = "priority-div";
  priorityDiv.className = "form-select-half";

  const priorityLabel = document.createElement("label");
  priorityLabel.setAttribute("for", "priority-select");
  priorityLabel.textContent = "Priority";
  priorityLabel.className = "form-label";

  const prioritySelect = document.createElement("select");
  prioritySelect.id = "priority-select";
  prioritySelect.className = "form-select";
  prioritySelect.setAttribute("data-label", "priority-select");

  const optionArray = [
    { value: "priority", text: "Priority (Decent Speed)", selected: true },
    { value: "default", text: "Default (SLOW)" },
    { value: "flex", text: "Flex (cheapest / VERY SLOW)" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;

    prioritySelect.append(option);
  }

  priorityDiv.append(priorityLabel, prioritySelect);

  return priorityDiv;
};

export const buildMaxTokensDiv = async () => {
  const maxTokensDiv = document.createElement("div");
  maxTokensDiv.id = "max-tokens-div";
  maxTokensDiv.className = "form-select-half";

  const maxTokensLabel = document.createElement("label");
  maxTokensLabel.setAttribute("for", "max-tokens-input");
  maxTokensLabel.className = "form-label";
  maxTokensLabel.textContent = "Max Tokens";

  const maxTokensInput = document.createElement("input");
  maxTokensInput.type = "number";
  maxTokensInput.id = "max-tokens-input";
  maxTokensInput.className = "form-input";
  maxTokensInput.min = "1000";
  maxTokensInput.max = "1000000";
  maxTokensInput.step = "1000";
  maxTokensInput.value = "50000";
  maxTokensInput.placeholder = "50000";

  maxTokensDiv.append(maxTokensLabel, maxTokensInput);

  return maxTokensDiv;
};

export const buildTemperatureDiv = async () => {
  // Temperature option
  const temperatureDiv = document.createElement("div");
  temperatureDiv.id = "temperature-div";
  temperatureDiv.className = "form-select-half";

  const temperatureLabel = document.createElement("label");
  temperatureLabel.setAttribute("for", "temperature-input");
  temperatureLabel.className = "form-label";
  temperatureLabel.textContent = "Temp";

  const temperatureInput = document.createElement("input");
  temperatureInput.type = "number";
  temperatureInput.id = "temperature-input";
  temperatureInput.className = "form-input";
  temperatureInput.min = "0";
  temperatureInput.max = "2";
  temperatureInput.step = "0.1";
  temperatureInput.value = "1";
  temperatureInput.placeholder = "1";

  temperatureDiv.append(temperatureLabel, temperatureInput);
  return temperatureDiv;
};

export const buildExtendedThinkingDiv = async () => {
  const extThinkingDiv = document.createElement("div");
  extThinkingDiv.id = "extended-thinking-div";
  extThinkingDiv.className = "form-select-half";

  const extThinkingLabel = document.createElement("label");
  extThinkingLabel.setAttribute("for", "extended-thinking-checkbox");
  extThinkingLabel.className = "form-label";
  extThinkingLabel.textContent = "Extended Thinking";

  const checkboxWrapper = document.createElement("div");
  checkboxWrapper.className = "checkbox-wrapper";

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";

  const extThinkingCheckbox = document.createElement("input");
  extThinkingCheckbox.type = "checkbox";
  extThinkingCheckbox.id = "extended-thinking-checkbox";
  extThinkingCheckbox.className = "form-checkbox";
  extThinkingCheckbox.checked = true;

  checkboxContainer.append(extThinkingCheckbox);
  checkboxWrapper.append(checkboxContainer);
  extThinkingDiv.append(extThinkingLabel, checkboxWrapper);

  return extThinkingDiv;
};

//----------------

export const buildCarFiltersListItem = async () => {
  const carFiltersListItem = document.createElement("li");
  carFiltersListItem.id = "car-filters-list-item";
  carFiltersListItem.className = "form-list-item form-row";

  const conditionDiv = await buildConditionDiv();
  const zipCodeDiv = await buildZipCodeDiv();
  const searchRadiusDiv = await buildSearchRadiusDiv();

  carFiltersListItem.append(conditionDiv, zipCodeDiv, searchRadiusDiv);

  return carFiltersListItem;
};

export const buildConditionDiv = async () => {
  const conditionDiv = document.createElement("div");
  conditionDiv.id = "condition-div";
  conditionDiv.className = "form-select-half";

  const conditionLabel = document.createElement("label");
  conditionLabel.setAttribute("for", "condition-select");
  conditionLabel.textContent = "Car Condition";
  conditionLabel.className = "form-label";

  const conditionSelect = document.createElement("select");
  conditionSelect.id = "condition-select";
  conditionSelect.className = "form-select";

  const optionArray = [
    { value: "any", text: "New or Used", selected: true },
    { value: "new", text: "New Only" },
    { value: "used", text: "Used Only" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;
    conditionSelect.append(option);
  }

  conditionDiv.append(conditionLabel, conditionSelect);

  return conditionDiv;
};

export const buildMakeDiv = async () => {
  const makeDiv = document.createElement("div");
  makeDiv.id = "make-div";
  makeDiv.className = "form-select-half";

  const makeLabel = document.createElement("label");
  makeLabel.setAttribute("for", "make-select");
  makeLabel.textContent = "Make";
  makeLabel.className = "form-label";

  const makeSelect = document.createElement("select");
  makeSelect.id = "make-select";
  makeSelect.className = "form-select";

  const optionArray = [
    { value: "any", text: "Any", selected: true },
    { value: "toyota", text: "Toyota" },
    { value: "honda", text: "Honda" },
    { value: "subaru", text: "Subaru" },
    { value: "ford", text: "Ford" },
    { value: "chevrolet", text: "Chevrolet" },
    { value: "hyundai", text: "Hyundai" },
    { value: "dodge", text: "Dodge" },
    { value: "tesla", text: "Tesla" },
    { value: "volkswagen", text: "Volkswagen" },
    { value: "volvo", text: "Volvo" },
    { value: "chinese", text: "Chinese Garbage" },
    { value: "other", text: "Other" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;
    makeSelect.append(option);
  }

  makeDiv.append(makeLabel, makeSelect);

  return makeDiv;
};

export const buildColorDiv = async () => {
  const colorDiv = document.createElement("div");
  colorDiv.id = "color-div";
  colorDiv.className = "form-select-half";

  const colorLabel = document.createElement("label");
  colorLabel.setAttribute("for", "color-select");
  colorLabel.textContent = "Color";
  colorLabel.className = "form-label";

  const colorSelect = document.createElement("select");
  colorSelect.id = "color-select";
  colorSelect.className = "form-select";

  const optionArray = [
    { value: "any", text: "Any", selected: true },
    { value: "white", text: "White" },
    { value: "black", text: "Black" },
    { value: "silver", text: "Silver" },
    { value: "gray", text: "Gray" },
    { value: "red", text: "Red" },
    { value: "blue", text: "Blue" },
    { value: "brown", text: "Brown" },
    { value: "green", text: "Green" },
    { value: "orange", text: "Orange" },
    { value: "yellow", text: "Yellow" },
    { value: "gold", text: "Gold" },
    { value: "beige", text: "Beige" },
    { value: "purple", text: "Purple" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;
    colorSelect.append(option);
  }

  colorDiv.append(colorLabel, colorSelect);

  return colorDiv;
};

export const buildZipCodeDiv = async () => {
  const zipCodeDiv = document.createElement("div");
  zipCodeDiv.id = "zip-code-div";
  zipCodeDiv.className = "form-select-half";

  const zipCodeLabel = document.createElement("label");
  zipCodeLabel.setAttribute("for", "zip-code-input");
  zipCodeLabel.textContent = "Zip Code";
  zipCodeLabel.className = "form-label";

  const zipCodeInput = document.createElement("input");
  zipCodeInput.type = "text";
  zipCodeInput.id = "zip-code-input";
  zipCodeInput.className = "form-input";
  zipCodeInput.placeholder = "e.g. 90210";
  zipCodeInput.maxLength = "10";

  zipCodeDiv.append(zipCodeLabel, zipCodeInput);
  return zipCodeDiv;
};

export const buildSearchRadiusDiv = async () => {
  const searchRadiusDiv = document.createElement("div");
  searchRadiusDiv.id = "search-radius-div";
  searchRadiusDiv.className = "form-select-half";

  const searchRadiusLabel = document.createElement("label");
  searchRadiusLabel.setAttribute("for", "search-radius-select");
  searchRadiusLabel.textContent = "Radius";
  searchRadiusLabel.className = "form-label";

  const searchRadiusSelect = document.createElement("select");
  searchRadiusSelect.id = "search-radius-select";
  searchRadiusSelect.className = "form-select";

  const optionArray = [
    { value: "10", text: "10 mi" },
    { value: "25", text: "25 mi" },
    { value: "50", text: "50 mi", selected: true },
    { value: "100", text: "100 mi" },
    { value: "150", text: "150 mi" },
    { value: "200", text: "200 mi" },
    { value: "300", text: "300 mi" },
    { value: "500", text: "500 mi" },
    { value: "any", text: "Any" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;
    searchRadiusSelect.append(option);
  }

  searchRadiusDiv.append(searchRadiusLabel, searchRadiusSelect);
  return searchRadiusDiv;
};

export const buildMakeColorModelListItem = async () => {
  const makeColorModelListItem = document.createElement("li");
  makeColorModelListItem.id = "make-color-model-list-item";
  makeColorModelListItem.className = "form-list-item form-row";

  const colorDiv = await buildColorDiv();
  const makeDiv = await buildMakeDiv();
  const modelDiv = await buildModelDiv();
  const extraFiltersToggle = await buildExtraFiltersToggle();

  makeColorModelListItem.append(colorDiv, makeDiv, modelDiv, extraFiltersToggle);
  return makeColorModelListItem;
};

export const buildModelDiv = async () => {
  const modelDiv = document.createElement("div");
  modelDiv.id = "model-div";
  modelDiv.className = "form-select-half";
  modelDiv.style.visibility = "hidden";

  const modelLabel = document.createElement("label");
  modelLabel.setAttribute("for", "car-model-select");
  modelLabel.textContent = "Model";
  modelLabel.className = "form-label";

  const modelSelect = document.createElement("select");
  modelSelect.id = "car-model-select";
  modelSelect.className = "form-select";

  const option = document.createElement("option");
  option.value = "";
  option.textContent = "Any";
  option.selected = true;
  modelSelect.append(option);

  modelDiv.append(modelLabel, modelSelect);
  return modelDiv;
};

export const buildExtraFiltersListItem = async () => {
  const extraFiltersListItem = document.createElement("li");
  extraFiltersListItem.id = "extra-filters-list-item";
  extraFiltersListItem.className = "form-list-item form-row";
  extraFiltersListItem.classList.add("hidden");

  const engineTypeDiv = await buildEngineTypeDiv();
  const leatherSeatsDiv = await buildLeatherSeatsDiv();
  const sunroofDiv = await buildSunroofDiv();
  const awdDiv = await buildAwdDiv();
  const heatedSeatsDiv = await buildHeatedSeatsDiv();
  const carPlayDiv = await buildCarPlayDiv();

  extraFiltersListItem.append(engineTypeDiv, leatherSeatsDiv, sunroofDiv, awdDiv, heatedSeatsDiv, carPlayDiv);

  return extraFiltersListItem;
};

export const buildEngineTypeDiv = async () => {
  const engineTypeDiv = document.createElement("div");
  engineTypeDiv.id = "engine-type-div";
  engineTypeDiv.className = "form-select-half";

  const engineTypeLabel = document.createElement("label");
  engineTypeLabel.setAttribute("for", "engine-type-select");
  engineTypeLabel.textContent = "Engine Type";
  engineTypeLabel.className = "form-label";

  const engineTypeSelect = document.createElement("select");
  engineTypeSelect.id = "engine-type-select";
  engineTypeSelect.className = "form-select";

  const optionArray = [
    { value: "any", text: "Any", selected: true },
    { value: "gas", text: "Gas" },
    { value: "electric", text: "Electric" },
    { value: "hybrid", text: "Hybrid" },
  ];

  for (let i = 0; i < optionArray.length; i++) {
    const optionData = optionArray[i];
    const option = document.createElement("option");
    option.value = optionData.value;
    option.textContent = optionData.text;
    if (optionData.selected) option.selected = true;
    engineTypeSelect.append(option);
  }

  engineTypeDiv.append(engineTypeLabel, engineTypeSelect);
  return engineTypeDiv;
};

export const buildLeatherSeatsDiv = async () => {
  const leatherSeatsDiv = document.createElement("div");
  leatherSeatsDiv.id = "leather-seats-div";
  leatherSeatsDiv.className = "form-select-half";

  const leatherSeatsLabel = document.createElement("label");
  leatherSeatsLabel.setAttribute("for", "leather-seats-checkbox");
  leatherSeatsLabel.textContent = "Leather Seats";
  leatherSeatsLabel.className = "form-label";

  const checkboxWrapper = document.createElement("div");
  checkboxWrapper.className = "checkbox-wrapper";

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";

  const leatherSeatsCheckbox = document.createElement("input");
  leatherSeatsCheckbox.type = "checkbox";
  leatherSeatsCheckbox.id = "leather-seats-checkbox";
  leatherSeatsCheckbox.className = "form-checkbox";

  checkboxContainer.append(leatherSeatsCheckbox);
  checkboxWrapper.append(checkboxContainer);
  leatherSeatsDiv.append(leatherSeatsLabel, checkboxWrapper);

  return leatherSeatsDiv;
};

export const buildSunroofDiv = async () => {
  const sunroofDiv = document.createElement("div");
  sunroofDiv.id = "sunroof-div";
  sunroofDiv.className = "form-select-half";

  const sunroofLabel = document.createElement("label");
  sunroofLabel.setAttribute("for", "sunroof-checkbox");
  sunroofLabel.textContent = "Sunroof";
  sunroofLabel.className = "form-label";

  const checkboxWrapper = document.createElement("div");
  checkboxWrapper.className = "checkbox-wrapper";

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";

  const sunroofCheckbox = document.createElement("input");
  sunroofCheckbox.type = "checkbox";
  sunroofCheckbox.id = "sunroof-checkbox";
  sunroofCheckbox.className = "form-checkbox";

  checkboxContainer.append(sunroofCheckbox);
  checkboxWrapper.append(checkboxContainer);
  sunroofDiv.append(sunroofLabel, checkboxWrapper);

  return sunroofDiv;
};

export const buildAwdDiv = async () => {
  const awdDiv = document.createElement("div");
  awdDiv.id = "awd-div";
  awdDiv.className = "form-select-half";

  const awdLabel = document.createElement("label");
  awdLabel.setAttribute("for", "awd-checkbox");
  awdLabel.textContent = "AWD / 4WD";
  awdLabel.className = "form-label";

  const checkboxWrapper = document.createElement("div");
  checkboxWrapper.className = "checkbox-wrapper";

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";

  const awdCheckbox = document.createElement("input");
  awdCheckbox.type = "checkbox";
  awdCheckbox.id = "awd-checkbox";
  awdCheckbox.className = "form-checkbox";

  checkboxContainer.append(awdCheckbox);
  checkboxWrapper.append(checkboxContainer);
  awdDiv.append(awdLabel, checkboxWrapper);

  return awdDiv;
};

export const buildHeatedSeatsDiv = async () => {
  const heatedSeatsDiv = document.createElement("div");
  heatedSeatsDiv.id = "heated-seats-div";
  heatedSeatsDiv.className = "form-select-half";

  const heatedSeatsLabel = document.createElement("label");
  heatedSeatsLabel.setAttribute("for", "heated-seats-checkbox");
  heatedSeatsLabel.textContent = "Heated Seats";
  heatedSeatsLabel.className = "form-label";

  const checkboxWrapper = document.createElement("div");
  checkboxWrapper.className = "checkbox-wrapper";

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";

  const heatedSeatsCheckbox = document.createElement("input");
  heatedSeatsCheckbox.type = "checkbox";
  heatedSeatsCheckbox.id = "heated-seats-checkbox";
  heatedSeatsCheckbox.className = "form-checkbox";

  checkboxContainer.append(heatedSeatsCheckbox);
  checkboxWrapper.append(checkboxContainer);
  heatedSeatsDiv.append(heatedSeatsLabel, checkboxWrapper);

  return heatedSeatsDiv;
};

export const buildCarPlayDiv = async () => {
  const carPlayDiv = document.createElement("div");
  carPlayDiv.id = "carplay-div";
  carPlayDiv.className = "form-select-half";

  const carPlayLabel = document.createElement("label");
  carPlayLabel.setAttribute("for", "carplay-checkbox");
  carPlayLabel.textContent = "CarPlay / AA";
  carPlayLabel.className = "form-label";

  const checkboxWrapper = document.createElement("div");
  checkboxWrapper.className = "checkbox-wrapper";

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "checkbox-container";

  const carPlayCheckbox = document.createElement("input");
  carPlayCheckbox.type = "checkbox";
  carPlayCheckbox.id = "carplay-checkbox";
  carPlayCheckbox.className = "form-checkbox";

  checkboxContainer.append(carPlayCheckbox);
  checkboxWrapper.append(checkboxContainer);
  carPlayDiv.append(carPlayLabel, checkboxWrapper);

  return carPlayDiv;
};

//----------------

const PRICE_MIN = 0;
const PRICE_MAX = 100000;
const PRICE_STEP = 5000;

const formatPriceLabel = (value) => {
  if (value <= PRICE_MIN) return "Any";
  if (value >= PRICE_MAX) return "$100,000+";
  return "$" + Number(value).toLocaleString("en-US");
};

const getPct = (value) => ((value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

const updateSliderTrack = (trackEl, minVal, maxVal) => {
  const l = getPct(minVal);
  const r = getPct(maxVal);
  trackEl.style.background = `linear-gradient(to right, #d1d5db ${l}%, #2563a8 ${l}%, #2563a8 ${r}%, #d1d5db ${r}%)`;
};

export const buildPriceRangeListItem = async () => {
  const priceRangeListItem = document.createElement("li");
  priceRangeListItem.id = "price-range-list-item";
  priceRangeListItem.className = "form-list-item";

  const priceLabel = document.createElement("label");
  priceLabel.textContent = "Price Range";
  priceLabel.className = "form-label";

  const sliderWrapper = document.createElement("div");
  sliderWrapper.id = "price-slider-wrapper";

  const sliderTrack = document.createElement("div");
  sliderTrack.id = "price-slider-track";

  const minInput = document.createElement("input");
  minInput.type = "range";
  minInput.id = "price-min-input";
  minInput.min = String(PRICE_MIN);
  minInput.max = String(PRICE_MAX);
  minInput.step = String(PRICE_STEP);
  minInput.value = String(PRICE_MIN);
  minInput.setAttribute("data-label", "price-min");

  const maxInput = document.createElement("input");
  maxInput.type = "range";
  maxInput.id = "price-max-input";
  maxInput.min = String(PRICE_MIN);
  maxInput.max = String(PRICE_MAX);
  maxInput.step = String(PRICE_STEP);
  maxInput.value = String(PRICE_MAX);
  maxInput.setAttribute("data-label", "price-max");

  const priceDisplay = document.createElement("div");
  priceDisplay.id = "price-range-display";
  priceDisplay.textContent = "Any \u2013 $100,000+";

  updateSliderTrack(sliderTrack, PRICE_MIN, PRICE_MAX);

  minInput.addEventListener("input", () => {
    let minVal = parseInt(minInput.value, 10);
    const maxVal = parseInt(maxInput.value, 10);
    if (minVal > maxVal) {
      minVal = maxVal;
      minInput.value = String(minVal);
    }
    minInput.style.zIndex = minVal === PRICE_MAX ? "5" : "3";
    maxInput.style.zIndex = "4";
    updateSliderTrack(sliderTrack, minVal, maxVal);
    priceDisplay.textContent = formatPriceLabel(minVal) + " \u2013 " + formatPriceLabel(maxVal);
  });

  maxInput.addEventListener("input", () => {
    const minVal = parseInt(minInput.value, 10);
    let maxVal = parseInt(maxInput.value, 10);
    if (maxVal < minVal) {
      maxVal = minVal;
      maxInput.value = String(maxVal);
    }
    maxInput.style.zIndex = maxVal === PRICE_MIN ? "5" : "4";
    minInput.style.zIndex = maxVal === PRICE_MIN ? "4" : "3";
    updateSliderTrack(sliderTrack, minVal, maxVal);
    priceDisplay.textContent = formatPriceLabel(minVal) + " \u2013 " + formatPriceLabel(maxVal);
  });

  sliderWrapper.append(sliderTrack, minInput, maxInput);
  priceRangeListItem.append(priceLabel, sliderWrapper, priceDisplay);

  return priceRangeListItem;
};

//----------------

export const buildPasteJobListItem = async () => {
  const pasteJobListItem = document.createElement("li");
  pasteJobListItem.id = "paste-job-list-item";
  pasteJobListItem.className = "form-list-item";

  const pasteJobLabel = document.createElement("label");
  pasteJobLabel.setAttribute("for", "car-details");
  pasteJobLabel.textContent = "Details";
  pasteJobLabel.className = "form-label";

  const pasteJobInput = document.createElement("textarea");
  // pasteJobInput.rows = 15;
  pasteJobInput.rows = 7;
  pasteJobInput.name = "car-details";
  pasteJobInput.id = "car-details";
  pasteJobInput.className = "form-textarea";
  pasteJobInput.placeholder = "[Describe your dream car here. Be as detailed as possible. The longer the better.]";

  pasteJobListItem.append(pasteJobLabel, pasteJobInput);

  return pasteJobListItem;
};

export const buildSubmitListItem = async () => {
  const submitListItem = document.createElement("li");
  submitListItem.id = "submit-list-item";
  submitListItem.className = "form-list-item";

  const submitButton = document.createElement("button");
  submitButton.id = "form-submit-button";
  submitButton.className = "btn-submit";
  submitButton.textContent = "SUBMIT";
  submitButton.setAttribute("data-label", "submit-button");

  submitListItem.append(submitButton);

  return submitListItem;
};

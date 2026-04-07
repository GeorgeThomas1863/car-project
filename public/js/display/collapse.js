import { EYE_CLOSED_SVG, EYE_OPEN_SVG } from "../util/define-things.js";

export const buildCollapseContainer = async (inputObj) => {
  if (!inputObj || !inputObj.titleElement || !inputObj.contentElement) return null;
  const { titleElement, contentElement, isExpanded = false, className = "", dataAttribute = "" } = inputObj;

  // Create container
  const collapseContainer = document.createElement("div");
  collapseContainer.className = `collapse-container ${className}`;

  // Create header with arrow and title
  const collapseHeader = document.createElement("div");
  collapseHeader.setAttribute("data-update", dataAttribute);
  collapseHeader.className = "collapse-header";

  const arrow = document.createElement("div");
  arrow.id = "collapse-arrow";
  arrow.className = isExpanded ? "collapse-arrow expanded" : "collapse-arrow";
  arrow.setAttribute("data-update", dataAttribute);

  const existingTitleClasses = titleElement.className || "";
  titleElement.className = existingTitleClasses ? `${existingTitleClasses} collapse-title` : "collapse-title";
  titleElement.setAttribute("data-update", dataAttribute);

  //add arrow / title to header
  collapseHeader.append(arrow, titleElement);

  //below preserves existing classes on content
  const existingClasses = contentElement.className || "";
  const collapseClasses = isExpanded ? "collapse-content" : "collapse-content hidden";
  contentElement.className = existingClasses ? `${existingClasses} ${collapseClasses}` : collapseClasses;

  //add collapse element at end
  collapseContainer.append(collapseHeader, contentElement);

  // CLICK LISTENER HERE
  collapseHeader.addEventListener("click", () => {
    arrow.classList.toggle("expanded");
    contentElement.classList.toggle("hidden");
  });

  return collapseContainer;
};

export const defineCollapseItems = async (inputArray) => {
  if (!inputArray || !inputArray.length) return null;

  for (let i = 0; i < inputArray.length; i++) {
    const collapseElement = inputArray[i];
    const header = collapseElement.querySelector(".collapse-header");
    if (!header) continue;

    header.addEventListener("click", () => {
      // collapse shit
      for (let j = 0; j < inputArray.length; j++) {
        if (i !== j) {
          const otherCollapse = inputArray[j];
          const otherContent = otherCollapse.querySelector(".collapse-content");
          const otherArrow = otherCollapse.querySelector(".collapse-arrow");

          otherContent.classList.add("hidden");
          otherArrow.classList.remove("expanded");
        }
      }
    });
  }
};

//--------------

export const hideArray = async (inputs) => {
  for (const input of inputs) {
    if (!input) continue;
    input.classList.add("hidden");
  }
};

export const unhideArray = async (inputs) => {
  for (const input of inputs) {
    if (!input) continue;
    input.classList.remove("hidden");
  }
};

//-----------

export const runPwToggle = async () => {
  const pwButton = document.querySelector(".password-toggle-btn");
  const pwInput = document.querySelector(".password-input");
  const currentSvgId = pwButton.querySelector("svg").id;

  if (currentSvgId === "eye-closed-icon") {
    pwButton.innerHTML = EYE_OPEN_SVG;
    pwInput.type = "text";
    return true;
  }

  pwButton.innerHTML = EYE_CLOSED_SVG;
  pwInput.type = "password";
  return true;
};

export const runModelOptionsToggle = async () => {
  const modelOptionsListItem = document.getElementById("model-options-list-item");
  // const modelOptionsContentWrapper = document.getElementById("model-options-content-wrapper");
  const toggleButton = document.getElementById("model-options-toggle");

  //expanded to collapsed
  if (toggleButton.getAttribute("aria-expanded") === "true") {
    await hideArray([modelOptionsListItem]);
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.classList.remove("expanded");
    modelOptionsListItem.style.borderBottom = "none";
    modelOptionsListItem.style.borderTop = "none";
    modelOptionsListItem.style.paddingBottom = "0";
    modelOptionsListItem.style.paddingTop = "0";
    return true;
  }
  //collapsed to expanded
  await unhideArray([modelOptionsListItem]);
  toggleButton.setAttribute("aria-expanded", "true");
  toggleButton.classList.add("expanded");
  modelOptionsListItem.style.borderBottom = "1px solid rgba(209, 213, 219, 0.6)";
  modelOptionsListItem.style.borderTop = "1px solid rgba(209, 213, 219, 0.6)";
  modelOptionsListItem.style.paddingBottom = "2rem";
  modelOptionsListItem.style.paddingTop = "1.5rem";

  return true;
};

export const runExtraFiltersToggle = async () => {
  const extraFiltersListItem = document.getElementById("extra-filters-list-item");
  const toggleButton = document.getElementById("extra-filters-toggle");

  //expanded to collapsed
  if (toggleButton.getAttribute("aria-expanded") === "true") {
    await hideArray([extraFiltersListItem]);
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.classList.remove("expanded");
    extraFiltersListItem.style.borderBottom = "none";
    extraFiltersListItem.style.borderTop = "none";
    extraFiltersListItem.style.paddingBottom = "0";
    extraFiltersListItem.style.paddingTop = "0";
    return true;
  }
  //collapsed to expanded
  await unhideArray([extraFiltersListItem]);
  toggleButton.setAttribute("aria-expanded", "true");
  toggleButton.classList.add("expanded");
  extraFiltersListItem.style.borderBottom = "1px solid rgba(209, 213, 219, 0.6)";
  extraFiltersListItem.style.borderTop = "1px solid rgba(209, 213, 219, 0.6)";
  extraFiltersListItem.style.paddingBottom = "2rem";
  extraFiltersListItem.style.paddingTop = "1.5rem";

  return true;
};

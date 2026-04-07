import { sendToBack } from "./util/api-front.js";
import { buildMainParams } from "./util/param.js";
import { showLoadStatus, hideLoadStatus } from "./display/loading.js";
import { buildResultsDisplay } from "./display/results.js";

export const runAuthSubmit = async () => {
  const authPwInput = document.getElementById("auth-pw-input");
  if (!authPwInput || !authPwInput.value) return null;

  const data = await sendToBack({ route: "/site-auth-route", pw: authPwInput.value });
  if (!data || !data.redirect) return null;

  window.location.href = data.redirect;
  return data;
};

const showResultsError = (message) => {
  const existing = document.getElementById("results-wrapper");
  if (existing) existing.remove();

  const errEl = document.createElement("div");
  errEl.id = "results-wrapper";
  errEl.className = "results-error-message";
  errEl.textContent = message || "Search failed. Please try again.";

  const displayElement = document.getElementById("display-element");
  if (displayElement) displayElement.append(errEl);
};

const confirmWinner = () =>
  new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "winner-overlay";

    const modal = document.createElement("div");
    modal.className = "winner-modal";

    const heading = document.createElement("h2");
    heading.textContent = "Are you a winner?";

    const buttons = document.createElement("div");
    buttons.className = "winner-modal-buttons";

    const yesBtn = document.createElement("button");
    yesBtn.className = "winner-btn winner-btn-yes";
    yesBtn.textContent = "Yes";
    yesBtn.addEventListener("click", () => {
      overlay.remove();
      resolve(true);
    });

    const noBtn = document.createElement("button");
    noBtn.className = "winner-btn winner-btn-no";
    noBtn.textContent = "No";
    noBtn.addEventListener("click", () => {
      modal.innerHTML = "";
      const wrongAnswer = document.createElement("p");
      wrongAnswer.className = "wrong-answer-text";
      wrongAnswer.textContent = "WRONG ANSWER!!! PLEASE TRY AGAIN.";
      modal.append(wrongAnswer);
      setTimeout(() => {
        overlay.remove();
        resolve(false);
      }, 3000);
    });

    buttons.append(yesBtn, noBtn);
    modal.append(heading, buttons);
    overlay.append(modal);
    document.body.append(overlay);
  });

export const runMainSubmit = async () => {
  const isWinner = await confirmWinner();
  if (!isWinner) return null;

  let params;
  try {
    params = await buildMainParams();
  } catch {
    showResultsError("Unable to read form values. Please reload the page.");
    return null;
  }
  if (!params) return null;

  await showLoadStatus();

  let data = null;
  try {
    data = await sendToBack(params);
  } finally {
    await hideLoadStatus();
  }

  if (!data || data === "FAIL" || !data.success) {
    showResultsError(data?.message || "Search failed. Please try again.");
    return null;
  }

  const resultsElement = await buildResultsDisplay(data.data);
  if (!resultsElement) return null;

  const displayElement = document.getElementById("display-element");
  if (!displayElement) return null;

  const existing = document.getElementById("results-wrapper");
  if (existing) existing.remove();

  displayElement.append(resultsElement);
  resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });

  return true;
};

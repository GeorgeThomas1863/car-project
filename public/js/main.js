import { buildMainForm } from "./display/main-form.js";
import { buildAuthForm } from "./display/auth-form.js";

const displayElement = document.getElementById("display-element");
const authElement = document.getElementById("auth-element");

export const buildDisplay = async () => {
  if (!displayElement) return null;

  const data = await buildMainForm();
  if (!data) return null;
  displayElement.append(data);

  //   await checkFile();

  return true;
};

export const buildAuthDisplay = async () => {
  if (!authElement) return null;

  const authForm = await buildAuthForm();
  if (!authForm) {
    console.log("FAILED TO BUILD AUTH FORM");
    return null;
  }

  authElement.appendChild(authForm);
};

if (displayElement) buildDisplay();
if (authElement) buildAuthDisplay();

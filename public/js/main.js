import { buildMainForm } from "./main-form.js";

const displayElement = document.getElementById("display-element");

export const buildDisplay = async () => {
  if (!displayElement) return null;

  const data = await buildMainForm();
  if (!data) return null;
  displayElement.append(data);

//   await checkFile();

  return true;
};

buildDisplay();

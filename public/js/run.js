import { sendToBack } from "./util/api-front.js";
import { buildMainParams } from "./util/param.js";

export const runAuthSubmit = async () => {
  const authPwInput = document.getElementById("auth-pw-input");
  if (!authPwInput || !authPwInput.value) return null;

  const data = await sendToBack({ route: "/site-auth-route", pw: authPwInput.value });
  if (!data || !data.redirect) return null;

  window.location.href = data.redirect;
  return data;
};

export const runMainSubmit = async () => {
  const params = await buildMainParams();
  if (!params) return null;

  const data = await sendToBack(params);
};

export const sanitizeMongoValue = (value) => {
  if (typeof value === "object" && value !== null) {
    throw new Error("Invalid query value: objects not allowed");
  }
  if (typeof value === "string" && value.startsWith("$")) {
    throw new Error("Invalid query value: operator injection attempt");
  }
  return value;
};

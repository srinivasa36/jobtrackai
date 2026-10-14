const K = "jobtrack:gemini-key";

export const getAIKey = () => {
  try {
    return typeof window !== "undefined" ? localStorage.getItem(K) || "" : "";
  } catch {
    return "";
  }
};
export const setAIKey = (value) => {
  try {
    localStorage.setItem(K, value.trim());
  } catch {}
};
export const clearAIKey = () => {
  try {
    localStorage.removeItem(K);
  } catch {}
};

import { httpError } from "./http";

const MODELS = [
  process.env.GEMINI_MODEL || "gemini-flash-latest",
  ...(process.env.GEMINI_FALLBACK_MODELS || "gemini-flash-lite-latest")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
];
const RETRYABLE = [404, 429, 500, 503];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function messageFor(status, ownKey) {
  if (ownKey) {
    if (status === 429)
      return "Your Gemini key hit its own rate limit. Wait a minute and try again.";
    if (status === 400 || status === 401 || status === 403)
      return "Google rejected your Gemini key. Check it in My profile.";
  } else {
    if (status === 429)
      return "The shared AI quota is busy. Try again in a minute, or add your own free Gemini key in My profile.";
    if (status === 400 || status === 401 || status === 403)
      return "Server AI key problem. Check GEMINI_API_KEY.";
  }
  return status === 503
    ? "The AI service is busy right now. Try again in a few seconds."
    : "The AI service had a problem. Please try again.";
}

export async function generate({ system, prompt, json = false, apiKey }) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  const ownKey = !!apiKey;
  if (!key)
    throw httpError(
      "No AI key available. Add your own Gemini key in My profile.",
      500,
    );
  let lastStatus = 500;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 8000,
              ...(json ? { responseMimeType: "application/json" } : {}),
            },
          }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        const text = (data.candidates?.[0]?.content?.parts || [])
          .map((p) => p.text || "")
          .join("");
        if (!text)
          throw httpError("The AI returned an empty answer. Try again.", 502);
        return text;
      }

      lastStatus = res.status;
      console.error(
        "Gemini",
        model,
        res.status,
        ownKey ? "(user key)" : "(shared key)",
      );
      if (!RETRYABLE.includes(res.status))
        throw httpError(messageFor(res.status, ownKey), res.status);
      await sleep(700 * (attempt + 1));
    }
  }
  throw httpError(messageFor(lastStatus, ownKey), lastStatus);
}

export function parseJSON(text) {
  const clean = text
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(clean);
  } catch {
    throw httpError(
      "The AI returned an unreadable answer. Please try again.",
      502,
    );
  }
}

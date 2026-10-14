import { auth } from "./firebase";
import { getAIKey } from "./aiKey";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  list: () => request("/api/applications"),
  create: (body) => request("/api/applications", { method: "POST", body }),
  update: (id, body) =>
    request(`/api/applications/${id}`, { method: "PATCH", body }),
  remove: (id) => request(`/api/applications/${id}`, { method: "DELETE" }),
  getProfile: () => request("/api/profile"),
  saveProfile: (body) => request("/api/profile", { method: "PUT", body }),
  ai: (action, payload) => {
    const key = getAIKey();
    return request("/api/ai", {
      method: "POST",
      body: { action, ...payload },
      headers: key ? { "x-gemini-key": key } : {},
    });
  },
};

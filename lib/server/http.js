import { ZodError } from "zod";
import { adminAuth } from "./firebaseAdmin";

export const json = (data, status = 200) => Response.json(data, { status });

export const httpError = (message, status = 500) => {
  const err = new Error(message);
  err.publicMessage = message;
  err.status = status;
  return err;
};

export async function withAuth(req, handler) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return json({ error: "Unauthorized" }, 401);

  let uid;
  try {
    uid = (await adminAuth.verifyIdToken(token)).uid;
  } catch {
    return json({ error: "Session expired. Please sign in again." }, 401);
  }

  try {
    return await handler(uid);
  } catch (err) {
    if (err instanceof ZodError) {
      return json({ error: err.issues[0]?.message || "Invalid input" }, 400);
    }
    console.error(err);
    return json(
      { error: err.publicMessage || "Server error" },
      err.status || 500,
    );
  }
}

import { withAuth, json } from "@/lib/server/http";
import { db } from "@/lib/server/firebaseAdmin";
import { applicationSchema } from "@/lib/server/schemas";

export const runtime = "nodejs";
const col = (uid) => db.collection("users").doc(uid).collection("applications");

export async function GET(req) {
  return withAuth(req, async (uid) => {
    const snap = await col(uid).get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.updatedAt - a.updatedAt);
    return json({ items });
  });
}

export async function POST(req) {
  return withAuth(req, async (uid) => {
    const data = applicationSchema.parse(await req.json());
    const now = Date.now();
    const doc = { ...data, createdAt: now, updatedAt: now };
    const ref = await col(uid).add(doc);
    return json({ item: { id: ref.id, ...doc } }, 201);
  });
}

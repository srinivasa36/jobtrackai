import { withAuth, json } from "@/lib/server/http";
import { db } from "@/lib/server/firebaseAdmin";
import { applicationSchema } from "@/lib/server/schemas";

export const runtime = "nodejs";
const ref = (uid, id) => db.collection("users").doc(uid).collection("applications").doc(id);

export async function PATCH(req, { params }) {
  return withAuth(req, async (uid) => {
    const patch = applicationSchema.partial().parse(await req.json());
    const doc = ref(uid, params.id);
    if (!(await doc.get()).exists) return json({ error: "Not found" }, 404);
    await doc.update({ ...patch, updatedAt: Date.now() });
    return json({ ok: true });
  });
}

export async function DELETE(req, { params }) {
  return withAuth(req, async (uid) => {
    const doc = ref(uid, params.id);
    if (!(await doc.get()).exists) return json({ error: "Not found" }, 404);
    await doc.delete();
    return json({ ok: true });
  });
}

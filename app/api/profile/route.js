import { withAuth, json } from "@/lib/server/http";
import { db } from "@/lib/server/firebaseAdmin";
import { profileSchema } from "@/lib/server/schemas";
import { isAdminUid } from "@/lib/server/admin";

export const runtime = "nodejs";

export async function GET(req) {
  return withAuth(req, async (uid) => {
    const snap = await db.collection("users").doc(uid).get();

    return json({
      profile: snap.data()?.profile || null,
      isAdmin: isAdminUid(uid),
    });
  });
}

export async function PUT(req) {
  return withAuth(req, async (uid) => {
    const profile = profileSchema.parse(await req.json());
    await db.collection("users").doc(uid).set({ profile }, { merge: true });
    return json({ profile });
  });
}

import { withAuth, json, httpError } from "@/lib/server/http";
import { db } from "@/lib/server/firebaseAdmin";
import { aiSchema } from "@/lib/server/schemas";
import { generate, parseJSON } from "@/lib/server/ai";
import { isAdminUid } from "@/lib/server/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const KEY_RE = /^AIza[0-9A-Za-z_-]{30,60}$/;
const DAILY_FREE = Number(process.env.DAILY_SHARED_AI_LIMIT || 5);

const hits = new Map();
function limited(uid, max = 10, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(uid) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(uid, recent);
  return recent.length > max;
}

const today = () => new Date().toISOString().slice(0, 10);

async function takeQuota(uid) {
  const ref = db.collection("users").doc(uid);
  return db.runTransaction(async (t) => {
    const u = (await t.get(ref)).data()?.aiUsage;
    const count = u?.date === today() ? u.count : 0;
    if (count >= DAILY_FREE) {
      throw httpError(
        `Daily free AI limit reached (${DAILY_FREE}/day). Add your own free Gemini key in My profile to keep going, or come back tomorrow.`,
        429
      );
    }
    t.set(ref, { aiUsage: { date: today(), count: count + 1 } }, { merge: true });
    return DAILY_FREE - (count + 1);
  });
}

async function refundQuota(uid) {
  const ref = db.collection("users").doc(uid);
  await db.runTransaction(async (t) => {
    const u = (await t.get(ref)).data()?.aiUsage;
    if (u?.date === today() && u.count > 0) t.set(ref, { aiUsage: { date: u.date, count: u.count - 1 } }, { merge: true });
  });
}

const SYSTEM = `You are an expert career coach and recruiter. Be concise, concrete and honest.
Never invent facts about the candidate. Use only the profile and job description provided.`;

const clamp = (n) => (Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : null);
const strArr = (a, max) => (Array.isArray(a) ? a.map(String).slice(0, max) : []);

export async function POST(req) {
  return withAuth(req, async (uid) => {
    if (limited(uid)) throw httpError("Too many AI requests. Wait a minute.", 429);

    const { action, jobDescription, company, role } = aiSchema.parse(await req.json());

    const userKey = (req.headers.get("x-gemini-key") || "").trim();
    if (userKey && !KEY_RE.test(userKey)) {
      throw httpError("That doesn't look like a valid Gemini API key (it starts with AIza).", 400);
    }

    const snap = await db.collection("users").doc(uid).get();
    const p = snap.data()?.profile;
    const profileText = p && (p.skills?.length || p.summary)
      ? `Name: ${p.name}\nHeadline: ${p.headline}\nSkills: ${(p.skills || []).join(", ")}\nSummary: ${p.summary}`
      : "No candidate profile provided.";
    const context = `CANDIDATE PROFILE:\n${profileText}\n\nJOB (${role || "role"} at ${company || "company"}):\n${jobDescription}`;

    const run = async () => {
      const apiKey = userKey || undefined;

      if (action === "analyze") {
        const text = await generate({
          system: SYSTEM, json: true, apiKey,
          prompt: `${context}\n\nReturn JSON with exactly these keys:
{"company": string, "role": string, "location": string ("" if unknown),
 "skills": string[] (up to 12 key skills the job requires),
 "matchScore": number 0-100 (how well the candidate fits; null if no profile provided),
 "matchReasons": string[] (up to 3 short reasons),
 "missingSkills": string[] (up to 5 required skills the candidate lacks),
 "summary": string (max 2 sentences describing the job)}`,
        });
        const r = parseJSON(text);
        return {
          company: String(r.company || ""),
          role: String(r.role || ""),
          location: String(r.location || ""),
          skills: strArr(r.skills, 12),
          matchScore: r.matchScore == null ? null : clamp(Number(r.matchScore)),
          matchReasons: strArr(r.matchReasons, 3),
          missingSkills: strArr(r.missingSkills, 5),
          summary: String(r.summary || ""),
        };
      }

      if (action === "coverLetter") {
        const text = await generate({
          system: SYSTEM, apiKey,
          prompt: `${context}\n\nWrite a tailored cover letter (max 220 words, 3 short paragraphs, confident but not cliché).
Highlight the candidate's most relevant skills for this job. Plain text only, no markdown, no placeholders except sign-off with the candidate's name if known.`,
        });
        return text.trim();
      }

      const text = await generate({
        system: SYSTEM, json: true, apiKey,
        prompt: `${context}\n\nCreate interview preparation. Return JSON: {"questions":[{"question": string, "tip": string (one-sentence advice on how to answer)}]} with exactly 6 questions mixing technical and behavioral, specific to this job.`,
      });
      const r = parseJSON(text);
      return (Array.isArray(r.questions) ? r.questions : [])
        .slice(0, 8)
        .map((q) => ({ question: String(q.question || ""), tip: String(q.tip || "") }));
    };

    const unlimited = isAdminUid(uid) || !!userKey;
    const remaining = unlimited ? null : await takeQuota(uid);
    try {
      return json({ result: await run(), remaining });
    } catch (err) {
      if (!unlimited) await refundQuota(uid).catch(() => {});
      throw err;
    }
  });
}

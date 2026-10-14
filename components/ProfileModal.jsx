"use client";
import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Modal, Button, Field, inputCls } from "./ui";
import { api } from "@/lib/api";
import { clearAIKey, getAIKey, setAIKey } from "@/lib/aiKey";

export default function ProfileModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", headline: "", skills: "", summary: "" });
  const [aiKey, setKey] = useState(() => getAIKey());
  const [isAdmin, setIsAdmin] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getProfile()
      .then(({ profile, isAdmin }) => {
        setIsAdmin(!!isAdmin);
        if (profile) setForm({ ...profile, skills: (profile.skills || []).join(", ") });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const key = isAdmin ? "" : aiKey.trim();
    if (key && !/^AIza[0-9A-Za-z_-]{30,60}$/.test(key)) {
      setError("That doesn't look like a Gemini API key. It should start with AIza.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.saveProfile({ ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) });
      if (!isAdmin) key ? setAIKey(key) : clearAIKey();
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title="My profile" onClose={onClose}>
      <p className="mb-5 text-sm text-muted">The AI uses this to score how well you match each job and to write your cover letters.</p>
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><input className={inputCls} value={form.name} onChange={set("name")} disabled={loading} /></Field>
          <Field label="Headline"><input className={inputCls} placeholder="Front-end Developer" value={form.headline} onChange={set("headline")} disabled={loading} /></Field>
        </div>
        <Field label="Skills (comma separated)">
          <input className={inputCls} placeholder="React, Next.js, Tailwind, JavaScript" value={form.skills} onChange={set("skills")} disabled={loading} />
        </Field>
        <Field label="Short summary">
          <textarea rows={4} className={inputCls} placeholder="3+ years building responsive web apps…" value={form.summary} onChange={set("summary")} disabled={loading} />
        </Field>

        {isAdmin ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
            <span className="mr-2 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">ADMIN</span>
            Unlimited AI using the server key. No API key needed.
          </div>
        ) : (
        <div className="rounded-xl border border-line bg-subtle/50 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><KeyRound size={15} className="text-link" />Your own Gemini API key <span className="text-xs font-normal text-muted">(optional)</span></div>
          <p className="mb-3 text-xs text-muted">
            Without a key you get a small number of free AI actions per day. With your own free key there is no daily cap from us.
            Get one at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-link underline">aistudio.google.com/apikey</a>.
          </p>
          <div className="relative">
            <input type={showKey ? "text" : "password"} className={`${inputCls} pr-10`} placeholder="AIza…" value={aiKey}
              onChange={(e) => setKey(e.target.value)} autoComplete="off" spellCheck={false} aria-label="Gemini API key" />
            <button type="button" onClick={() => setShowKey((s) => !s)} aria-label={showKey ? "Hide key" : "Show key"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-fg">
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            {aiKey.trim() ? "✓ Your key will be used for AI actions." : "Currently using the shared free quota."} Stored only in this browser, sent over HTTPS with each AI request, never saved on our servers.
          </p>
        </div>
        )}

        {error && <p role="alert" className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving} disabled={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}

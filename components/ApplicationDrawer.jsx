"use client";
import { useState } from "react";
import {
  Check,
  Copy,
  FileText,
  MessagesSquare,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button, Drawer, Field, ScoreRing, inputCls } from "./ui";
import { STATUSES } from "@/lib/constants";
import { avatarColor, initials } from "@/lib/utils";
import { api } from "@/lib/api";

const EMPTY = {
  company: "",
  role: "",
  location: "",
  url: "",
  status: "wishlist",
  jobDescription: "",
  notes: "",
  skills: [],
  matchScore: null,
};

const ACTIONS = [
  {
    id: "analyze",
    label: "Analyze job",
    desc: "Skills, match score, gaps",
    icon: Sparkles,
  },
  {
    id: "coverLetter",
    label: "Cover letter",
    desc: "Tailored to this role",
    icon: FileText,
  },
  {
    id: "interviewPrep",
    label: "Interview prep",
    desc: "6 likely questions",
    icon: MessagesSquare,
  },
];

export default function ApplicationDrawer({
  item,
  initialStatus,
  onSave,
  onDelete,
  onClose,
}) {
  const [form, setForm] = useState(
    item
      ? { ...EMPTY, ...item }
      : { ...EMPTY, status: initialStatus || "wishlist" },
  );
  const [tab, setTab] = useState(item ? "details" : "ai");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [letter, setLetter] = useState("");
  const [questions, setQuestions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [remaining, setRemaining] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const noJD = form.jobDescription.trim().length < 40;

  const runAI = async (action) => {
    setBusy(action);
    setError("");
    try {
      const { result, remaining: left } = await api.ai(action, {
        jobDescription: form.jobDescription,
        company: form.company,
        role: form.role,
      });
      setRemaining(left);
      if (action === "analyze") {
        setAnalysis(result);
        setForm((f) => ({
          ...f,
          company: f.company || result.company,
          role: f.role || result.role,
          location: f.location || result.location,
          skills: result.skills,
          matchScore: result.matchScore,
        }));
      } else if (action === "coverLetter") setLetter(result);
      else setQuestions(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  };

  const addSkill = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const s = skillInput.trim();
    if (s && !form.skills.includes(s))
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      setTab("details");
      setError("Company and role are required.");
      return;
    }
    setBusy("save");
    setError("");
    try {
      const {
        company,
        role,
        location,
        url,
        status,
        jobDescription,
        notes,
        skills,
        matchScore,
      } = form;
      await onSave({
        company,
        role,
        location,
        url,
        status,
        jobDescription,
        notes,
        skills,
        matchScore,
      });
    } catch (err) {
      setError(err.message);
      setBusy("");
    }
  };

  const remove = async () => {
    if (!confirm("Delete this application?")) return;
    setBusy("delete");
    try {
      await onDelete();
    } catch (err) {
      setError(err.message);
      setBusy("");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Drawer
      label={item ? "Edit application" : "New application"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold text-white"
            style={{
              background: form.company
                ? avatarColor(form.company)
                : "rgb(var(--subtle))",
            }}
          >
            {form.company ? initials(form.company) : "＋"}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold">
              {form.company || "New application"}
            </h2>
            <p className="truncate text-xs text-muted">
              {form.role || "Paste a job description to get started"}
            </p>
          </div>
          {form.matchScore != null && (
            <ScoreRing value={form.matchScore} size={40} />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-fg"
          >
            <X size={18} />
          </button>
        </div>

        <div role="tablist" className="flex gap-1 border-b border-line px-4">
          {[
            ["ai", "✨ AI assistant"],
            ["details", "Details"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition ${tab === id ? "border-brand text-fg" : "border-transparent text-muted hover:text-fg"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {tab === "details" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company *">
                  <input
                    className={inputCls}
                    value={form.company}
                    onChange={set("company")}
                  />
                </Field>
                <Field label="Role *">
                  <input
                    className={inputCls}
                    value={form.role}
                    onChange={set("role")}
                  />
                </Field>
                <Field label="Location">
                  <input
                    className={inputCls}
                    value={form.location}
                    onChange={set("location")}
                  />
                </Field>
                <Field label="Job link">
                  <input
                    className={inputCls}
                    placeholder="https://…"
                    value={form.url}
                    onChange={set("url")}
                  />
                </Field>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-medium text-muted">
                  Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s.id }))}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${s.chip} ${form.status === s.id ? "ring-2 ring-brand" : "opacity-70 hover:opacity-100"}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-medium text-muted">
                  Skills
                </span>
                <div className="flex flex-wrap gap-1.5 rounded-lg border border-line bg-surface p-2">
                  {form.skills.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 rounded-md bg-subtle px-2 py-1 text-xs"
                    >
                      {s}
                      <button
                        type="button"
                        aria-label={`Remove ${s}`}
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            skills: f.skills.filter((x) => x !== s),
                          }))
                        }
                        className="text-muted hover:text-fg"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="Type a skill and press Enter"
                    aria-label="Add skill"
                    className="min-w-[160px] flex-1 bg-transparent px-1 py-1 text-xs outline-none placeholder:text-muted/70"
                  />
                </div>
              </div>

              <Field label="Notes">
                <textarea
                  rows={4}
                  className={inputCls}
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Recruiter name, follow-up date, salary range…"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Job description">
                <textarea
                  rows={7}
                  className={inputCls}
                  value={form.jobDescription}
                  onChange={set("jobDescription")}
                  placeholder="Paste the full job description here, then pick an AI action below…"
                />
              </Field>

              <div className="grid gap-2 sm:grid-cols-3">
                {ACTIONS.map(({ id, label, desc, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={noJD || !!busy}
                    onClick={() => runAI(id)}
                    className="rounded-xl border border-line bg-surface p-3 text-left transition hover:border-brand/50 hover:bg-brand-soft/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Icon
                      size={16}
                      className={`mb-2 text-link ${busy === id ? "animate-pulse" : ""}`}
                    />
                    <p className="text-sm font-medium">
                      {busy === id ? "Working…" : label}
                    </p>
                    <p className="text-xs text-muted">{desc}</p>
                  </button>
                ))}
              </div>
              {noJD && (
                <p className="text-xs text-muted">
                  Paste at least a few lines of the job description to enable
                  the AI actions.
                </p>
              )}
              {remaining != null && (
                <p className="text-xs text-muted">
                  {remaining} free AI {remaining === 1 ? "action" : "actions"}{" "}
                  left today. Add your own key in My profile for no daily cap.
                </p>
              )}
              {analysis && (
                <div className="rounded-xl border border-line bg-subtle/50 p-4">
                  <div className="flex items-start gap-4">
                    {analysis.matchScore != null && (
                      <ScoreRing
                        value={analysis.matchScore}
                        size={56}
                        stroke={5}
                      />
                    )}
                    <div className="min-w-0 flex-1 space-y-2 text-sm">
                      {analysis.summary && <p>{analysis.summary}</p>}
                      {analysis.matchScore == null && (
                        <p className="text-xs text-muted">
                          Add your skills in “My profile” to get a match score.
                        </p>
                      )}
                      {analysis.matchReasons.length > 0 && (
                        <ul className="list-inside list-disc space-y-0.5 text-xs text-muted">
                          {analysis.matchReasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  {analysis.missingSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-muted">Skills to brush up:</span>
                      {analysis.missingSkills.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-amber-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 text-xs text-muted">
                    Company, role, skills and score were filled in under
                    Details.
                  </p>
                </div>
              )}

              {letter && (
                <div className="rounded-xl border border-line bg-subtle/50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wide text-muted">
                      COVER LETTER
                    </span>
                    <button
                      type="button"
                      onClick={copy}
                      className="flex items-center gap-1 text-xs text-link hover:underline"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {letter}
                  </p>
                </div>
              )}

              {questions.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold tracking-wide text-muted">
                    INTERVIEW PREP
                  </span>
                  {questions.map((q, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-line bg-subtle/50 p-3.5"
                    >
                      <p className="text-sm font-medium">
                        <span className="mr-2 text-link">{i + 1}.</span>
                        {q.question}
                      </p>
                      <p className="mt-1 text-xs text-muted">💡 {q.tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-6 py-4">
          {item ? (
            <Button
              type="button"
              variant="danger"
              onClick={remove}
              loading={busy === "delete"}
              disabled={!!busy}
            >
              <Trash2 size={14} />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={busy === "save"} disabled={!!busy}>
              Save
            </Button>
          </div>
        </div>
      </form>
    </Drawer>
  );
}

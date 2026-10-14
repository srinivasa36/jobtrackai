"use client";
import { motion } from "framer-motion";
import { STATUSES } from "@/lib/constants";
import { ScoreRing } from "./ui";

function Bar({ value, max, className }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-subtle">
      <motion.div className={`h-full rounded-full ${className}`} initial={{ width: 0 }}
        animate={{ width: `${(value / Math.max(max, 1)) * 100}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
    </div>
  );
}

export default function Insights({ items }) {
  if (!items.length) {
    return <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center text-sm text-muted">Add a few applications to see your insights.</div>;
  }

  const counts = STATUSES.map((s) => ({ ...s, n: items.filter((i) => i.status === s.id).length }));
  const max = Math.max(...counts.map((c) => c.n));

  const scored = items.filter((i) => i.matchScore != null);
  const avg = scored.length ? Math.round(scored.reduce((s, i) => s + i.matchScore, 0) / scored.length) : null;

  const skillMap = {};
  items.forEach((i) => (i.skills || []).forEach((s) => (skillMap[s] = (skillMap[s] || 0) + 1)));
  const skills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-xl border border-line bg-surface p-5 shadow-card lg:col-span-2">
        <h2 className="text-sm font-semibold">Pipeline</h2>
        <p className="mb-4 text-xs text-muted">Where your applications are right now</p>
        <div className="space-y-3">
          {counts.map((c) => (
            <div key={c.id}>
              <div className="mb-1 flex justify-between text-xs"><span>{c.label}</span><span className="text-muted">{c.n}</span></div>
              <Bar value={c.n} max={max} className={c.bar} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold">Average match</h2>
        <p className="mb-4 text-xs text-muted">Across {scored.length} analyzed jobs</p>
        {avg != null ? (
          <div className="flex items-center gap-4">
            <ScoreRing value={avg} size={72} stroke={6} />
            <p className="text-xs text-muted">{avg >= 75 ? "Strong fit. Keep applying." : avg >= 50 ? "Decent fit. Close the skill gaps." : "Aim at roles closer to your skills."}</p>
          </div>
        ) : (
          <p className="text-xs text-muted">Run “Analyze job” on a card to see this.</p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface p-5 shadow-card lg:col-span-3">
        <h2 className="text-sm font-semibold">Skills in demand</h2>
        <p className="mb-4 text-xs text-muted">Most requested across your saved jobs</p>
        {skills.length ? (
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {skills.map(([name, n]) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-xs"><span>{name}</span><span className="text-muted">{n} {n === 1 ? "job" : "jobs"}</span></div>
                <Bar value={n} max={skills[0][1]} className="bg-brand" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">Analyze jobs with AI to collect skills.</p>
        )}
      </section>
    </div>
  );
}

import { Briefcase, MessagesSquare, Send, Trophy } from "lucide-react";

export default function StatsBar({ items }) {
  const n = (s) => items.filter((i) => i.status === s).length;
  const active = items.length - n("wishlist");
  const rate = (x) => (active ? Math.round((x / active) * 100) : 0);

  const cards = [
    { label: "Total tracked", value: items.length, hint: `${n("wishlist")} in wishlist`, icon: Briefcase, tone: "text-zinc-500 bg-zinc-500/10" },
    { label: "Applied", value: n("applied"), hint: `${active} submitted overall`, icon: Send, tone: "text-blue-500 bg-blue-500/10" },
    { label: "Interviews", value: n("interview"), hint: `${rate(n("interview"))}% of applications`, icon: MessagesSquare, tone: "text-amber-500 bg-amber-500/10" },
    { label: "Offers", value: n("offer"), hint: `${rate(n("offer"))}% offer rate`, icon: Trophy, tone: "text-emerald-500 bg-emerald-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, hint, icon: Icon, tone }) => (
        <div key={label} className="rounded-xl border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">{label}</span>
            <span className={`grid h-7 w-7 place-items-center rounded-lg ${tone}`}><Icon size={15} /></span>
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
          <p className="mt-0.5 text-xs text-muted">{hint}</p>
        </div>
      ))}
    </div>
  );
}

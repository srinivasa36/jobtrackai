"use client";
import {
  BarChart3,
  LayoutGrid,
  LogOut,
  Moon,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/useTheme";

const NAV = [
  { id: "board", label: "Board", icon: LayoutGrid },
  { id: "insights", label: "Insights", icon: BarChart3 },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white shadow-sm">
        <Sparkles size={16} />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        JobTrack <span className="text-link">AI</span>
      </span>
    </div>
  );
}

export default function AppShell({ view, setView, onProfile, children }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  const initial = (user?.email || "?")[0].toUpperCase();

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Main">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              aria-current={view === id ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${view === id ? "bg-brand-soft text-link" : "text-muted hover:bg-subtle hover:text-fg"}`}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
          <button
            onClick={onProfile}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-subtle hover:text-fg"
          >
            <UserRound size={17} /> My profile
          </button>
        </nav>
        <div className="space-y-1 border-t border-line p-3">
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-subtle hover:text-fg"
          >
            <ThemeIcon size={17} />{" "}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-sm font-semibold text-link">
              {initial}
            </span>
            <span
              className="min-w-0 flex-1 truncate text-xs text-muted"
              title={user?.email}
            >
              {user?.email}
            </span>
            <button
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-fg"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              aria-label={label}
              className={`rounded-lg p-2 ${view === id ? "bg-brand-soft text-link" : "text-muted"}`}
            >
              <Icon size={18} />
            </button>
          ))}
          <button
            onClick={onProfile}
            aria-label="My profile"
            className="rounded-lg p-2 text-muted"
          >
            <UserRound size={18} />
          </button>
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-muted"
          >
            <ThemeIcon size={18} />
          </button>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="rounded-lg p-2 text-muted"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="lg:pl-60">{children}</div>
    </div>
  );
}

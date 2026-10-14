"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Plus, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/hooks/useApplications";
import AppShell from "@/components/AppShell";
import StatsBar from "@/components/StatsBar";
import Board from "@/components/Board";
import Insights from "@/components/Insights";
import ApplicationDrawer from "@/components/ApplicationDrawer";
import ProfileModal from "@/components/ProfileModal";
import { Button } from "@/components/ui";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    items,
    loading: fetching,
    error,
    add,
    update,
    remove,
  } = useApplications(!!user);

  const [view, setView] = useState("board");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null); // { item?, status? }
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setView("board");
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? items.filter((i) =>
          `${i.company} ${i.role} ${(i.skills || []).join(" ")}`
            .toLowerCase()
            .includes(q),
        )
      : items;
  }, [items, query]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const move = (id, status) =>
    update(id, { status }).catch((e) => flash(e.message));
  const save = async (data) => {
    const editing = !!modal.item;
    if (editing) await update(modal.item.id, data);
    else await add(data);
    setModal(null);
    flash(editing ? "Application updated" : "Application added");
  };
  const del = async () => {
    await remove(modal.item.id);
    setModal(null);
    flash("Application deleted");
  };

  if (loading || !user) {
    return (
      <div className="grid h-screen place-items-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  return (
    <AppShell
      view={view}
      setView={setView}
      onProfile={() => setShowProfile(true)}
    >
      <div className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {view === "board" ? "Applications" : "Insights"}
            </h1>
            <p className="text-xs text-muted">
              {items.length}{" "}
              {items.length === 1 ? "application" : "applications"} tracked
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {view === "board" && (
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search applications"
                  placeholder="Search…"
                  className="w-44 rounded-lg border border-line bg-surface py-2 pl-9 pr-10 text-sm outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10 sm:w-60"
                />
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 text-[10px] text-muted sm:block">
                  ⌘K
                </kbd>
              </div>
            )}
            <Button onClick={() => setModal({ status: "wishlist" })}>
              <Plus size={16} />
              Add application
            </Button>
          </div>
        </div>
      </div>

      <main className="space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400"
          >
            {error}
          </p>
        )}

        {view === "board" && <StatsBar items={items} />}

        {fetching ? (
          <div className="flex gap-4 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[300px] shrink-0 space-y-2.5 rounded-2xl border border-line bg-subtle/60 p-3"
              >
                <div className="h-4 w-24 animate-pulse rounded bg-line" />
                {[0, 1].map((j) => (
                  <div
                    key={j}
                    className="h-24 animate-pulse rounded-xl bg-surface"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line bg-surface px-8 py-14 text-center">
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-link">
              <Sparkles size={22} />
            </span>
            <h2 className="text-lg font-semibold">Start your job search</h2>
            <p className="mt-1 text-sm text-muted">
              Paste a job description and let AI extract the details, score your
              match and draft a cover letter.
            </p>
            <Button
              className="mt-5"
              onClick={() => setModal({ status: "wishlist" })}
            >
              <Plus size={16} />
              Add your first application
            </Button>
          </div>
        ) : view === "board" ? (
          <Board
            items={filtered}
            onMove={move}
            onOpen={(item) => setModal({ item })}
            onAdd={(status) => setModal({ status })}
          />
        ) : (
          <Insights items={items} />
        )}
      </main>

      <AnimatePresence>
        {modal && (
          <ApplicationDrawer
            key={modal.item?.id || "new"}
            item={modal.item}
            initialStatus={modal.status}
            onSave={save}
            onDelete={del}
            onClose={() => setModal(null)}
          />
        )}
        {showProfile && (
          <ProfileModal
            key="profile"
            onClose={() => setShowProfile(false)}
            onSaved={() => flash("Profile saved")}
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center">
        <AnimatePresence>
          {toast && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm text-white shadow-pop dark:bg-zinc-100 dark:text-zinc-900"
            >
              <CheckCircle2
                size={16}
                className="text-emerald-400 dark:text-emerald-600"
              />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

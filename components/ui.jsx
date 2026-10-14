"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";

export const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10";

const variants = {
  primary: "bg-brand text-white shadow-sm hover:bg-brand/90",
  secondary: "border border-line bg-surface text-fg hover:bg-subtle",
  ghost: "text-muted hover:bg-subtle hover:text-fg",
  danger:
    "border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400",
};
const sizes = { md: "px-4 py-2 text-sm", sm: "px-3 py-1.5 text-xs" };

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

export function Modal({ title, onClose, children }) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-10">
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        className="relative w-full max-w-lg rounded-2xl border border-line bg-surface shadow-pop"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted hover:bg-subtle hover:text-fg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

export function Drawer({ label, onClose, children }) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-line bg-surface shadow-pop"
      >
        {children}
      </motion.aside>
    </div>
  );
}

export function ScoreRing({ value, size = 36, stroke = 3 }) {
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const color = value >= 75 ? "#10b981" : value >= 50 ? "#f59e0b" : "#f43f5e";
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`${value}% match`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          className="text-line"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <span
        className={`absolute inset-0 grid place-items-center font-semibold ${size > 44 ? "text-sm" : "text-[10px]"}`}
      >
        {value}
      </span>
    </div>
  );
}

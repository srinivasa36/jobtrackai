"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, FileText, Sparkles, Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button, inputCls } from "@/components/ui";

const friendly = (code) =>
  ({
    "auth/invalid-credential": "Wrong email or password.",
    "auth/email-already-in-use":
      "That email already has an account. Try signing in.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/popup-closed-by-user": "The sign-in popup was closed.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
  })[code] || "Something went wrong. Please try again.";

const FEATURES = [
  {
    icon: Target,
    title: "AI match score",
    text: "See how well each job fits your skills before you apply.",
  },
  {
    icon: FileText,
    title: "Cover letters in seconds",
    text: "Tailored drafts built from the job description and your profile.",
  },
  {
    icon: BarChart3,
    title: "Track your pipeline",
    text: "Drag applications from wishlist to offer and spot trends.",
  },
];

const GoogleG = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
    />
  </svg>
);

export default function LoginPage() {
  const { user, loading, signIn, signUp, google } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  const run = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(friendly(e.code));
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    run(() =>
      mode === "signin" ? signIn(email, password) : signUp(email, password),
    );
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur">
            <Sparkles size={18} />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            JobTrack AI
          </span>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Land your next role, faster.
          </h2>
          <p className="mt-3 text-indigo-100">
            One calm place to organize applications, with AI doing the
            repetitive work.
          </p>
          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-indigo-100/90">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-indigo-200">
          Built with Next.js, Firebase and Gemini
        </p>
      </section>

      <section className="grid place-items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand text-white">
              <Sparkles size={18} />
            </span>
            <p className="text-lg font-semibold">
              JobTrack <span className="text-link">AI</span>
            </p>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "signin"
              ? "Sign in to continue to your board."
              : "Start tracking your applications in minutes."}
          </p>

          <Button
            variant="secondary"
            className="mt-6 w-full"
            disabled={busy}
            onClick={() => run(google)}
          >
            <GoogleG /> Continue with Google
          </Button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              aria-label="Email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min. 6 characters)"
              aria-label="Password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400"
              >
                {error}
              </p>
            )}
            <Button type="submit" loading={busy} className="w-full">
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError("");
              }}
              className="font-medium text-link hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SpotlightCard } from "@/components/site/SpotlightCard";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — SpinShine Control Panel" }],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup";

function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
      await router.invalidate();
      await router.navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy bg-grid-pattern-dark p-6">
      <div className="w-full max-w-md">
        <SpotlightCard
          glowColor="rgba(20, 184, 166, 0.15)"
          borderColor="rgba(110, 68, 255, 0.25)"
          className="border-white/10"
          innerClassName="!bg-navy/95 p-8 space-y-6 text-white rounded-[inherit]"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold font-display">
              Spin<span className="text-teal">Shine</span> Console
            </h1>
            <p className="text-xs text-white/50">
              {mode === "signin"
                ? "Sign in to manage bookings, zones, rates, and content."
                : "Create an account. The first account on a fresh database becomes the admin."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`rounded-lg py-2.5 transition-colors ${
                mode === "signin" ? "bg-teal text-navy" : "text-white/60 hover:text-white"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`rounded-lg py-2.5 transition-colors ${
                mode === "signup" ? "bg-teal text-navy" : "text-white/60 hover:text-white"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-teal/50"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-teal/50"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-teal/50"
            />

            {error && <p className="text-xs font-bold text-royal">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-teal via-royal to-gold py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lift hover:shadow-glow disabled:opacity-60 transition-all"
            >
              {loading
                ? mode === "signin"
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p className="text-center text-[10px] text-white/40">
            <Link to="/" className="hover:text-teal transition-colors">
              ← Back to website
            </Link>
          </p>
        </SpotlightCard>
      </div>
    </div>
  );
}

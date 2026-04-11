import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "../../lib/auth-client";
import { api } from "../../lib/api";
import { ArrowRight, User } from "lucide-react";
import { Logo } from "../../components/logo";

export const Route = createFileRoute('/_protected/onboarding')({
  component: Onboarding,
})

function Onboarding() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.updateMe({ name: name.trim() });
      navigate({ to: "/me", search: { onboarding: "1" } as any });
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 flex items-center justify-center px-6">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[180px] rounded-full blur-[80px] opacity-20 pointer-events-none"
        style={{ background: "var(--primary)" }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <Logo size={28} />
            <span className=" font-bold text-foreground text-xl">TrueInbox</span>
          </div>
          <h1 className=" text-2xl font-bold text-foreground">What's your name?</h1>
          <p className="text-muted-foreground text-sm mt-2">
            This is how you'll appear to others on TrueInbox.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jamie Chen"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-all glow-primary-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Signed in as <span className="text-foreground font-medium">{session?.user?.email}</span>
        </p>
      </div>
    </div>
  );
}

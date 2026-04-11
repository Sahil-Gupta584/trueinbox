import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { signIn, useSession } from "../lib/auth-client";
import { Mail, ArrowRight, Inbox, CheckCircle, Sparkles } from "lucide-react";
import { Logo } from "../components/logo";
import { Button } from "#/components/ui/button";

type Step = "email" | "sent";

export const Route = createFileRoute('/login')({
  component: SignIn,
})

function SignIn() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && session) navigate({ to: "/dashboard" });
  }, [session, isPending, navigate]);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
      console.log({ res });
      // navigate({ href: res.data?.url })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!email.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      // Assuming signIn.magicLink is used for magic links in better-auth
      const res = await signIn.magicLink({
        email,
        callbackURL: "/dashboard",
      });
      
      if (res?.error) {
        setError(res.error.message || "Failed to send link. Try again.");
      } else {
        setStep("sent");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-[0.06] pointer-events-none"
        style={{ background: "var(--primary)" }} />

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/">
            <div className="inline-flex items-center gap-2.5 cursor-pointer mb-6 group">
              <Logo size={30} />
              <span className=" font-bold text-foreground text-xl group-hover:text-primary transition-colors">TrueInbox</span>
            </div>
          </a>

          {step === "email" ? (
            <>
              <h1 className=" text-3xl font-bold text-foreground">Welcome back</h1>
              <p className="text-muted-foreground text-sm mt-2">Sign in to manage your inbox</p>
            </>
          ) : (
            <>
              <h1 className=" text-3xl font-bold text-foreground">Check your inbox</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Link sent to <span className="font-semibold text-foreground">{email}</span>
              </p>
            </>
          )}
        </div>

        <div className="bg-card border border-border rounded-3xl p-7 shadow-xl shadow-black/5">
          {step === "email" ? (
            <div className="space-y-5">
              <Button
                variant="outline"
                onClick={signInWithGoogle}
                className="w-full bg-card hover:bg-muted/50 border-border rounded-xl h-12 gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-medium">Continue with Google</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="bg-card px-3 text-muted-foreground/60">Or continue with</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="you@example.com"
                    autoFocus
                    style={{ paddingLeft: "2.75rem" }}
                    className="w-full pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-xs leading-relaxed">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSend}
                disabled={loading || !email.trim()}
                className="w-full rounded-xl h-11"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                ) : (
                  <>Send magic link <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>

              <div className="flex items-center gap-2 justify-center">
                <Sparkles className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">No password needed. One click and you're in.</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center mx-auto">
                <Inbox className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                A sign-in link is on its way to{" "}
                <span className="font-semibold text-foreground">{email}</span>.
                Click it to access your account instantly.
              </p>
              <div className="flex items-center gap-2.5 p-3.5 bg-primary/5 rounded-2xl border border-primary/15">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs text-primary font-medium">Link expires in 10 minutes</p>
              </div>
              <button
                onClick={() => { setStep("email"); setError(""); }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                ← Use a different email
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

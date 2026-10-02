"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Lock, Mail, ArrowRight, ShieldCheck, Sun, Moon, Sparkles, LogIn } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/lib/auth/auth-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { enterDemoMode, refreshAuth } = useAuth();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(authError.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (data.session) {
        await refreshAuth();
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Unable to connect to authentication service. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between antialiased selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      {/* Header */}
      <header className="w-full border-b border-border-subtle bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground group-hover:border-primary transition-all duration-200 shadow-xs">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg text-foreground tracking-tight">G-Tech</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Delta
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:bg-surface-elevated transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
            </button>
            <button
              onClick={enterDemoMode}
              className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-xs font-semibold text-foreground transition-colors"
            >
              Demo Mode
            </button>
          </div>
        </div>
      </header>

      {/* Main Sign In Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Operator Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Sign In to G-Tech OS
            </h1>
            <p className="text-xs text-muted-foreground">
              Access your ISP network management, subscriber billing, and NOC telemetry
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xl space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@yourisp.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm transition flex items-center justify-center gap-2 shadow-brand-btn disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface px-2 text-muted-foreground font-medium">Or</span>
              </div>
            </div>

            <button
              onClick={enterDemoMode}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-surface border border-border text-foreground font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Explore Demo Mode (No Account Needed)</span>
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an ISP account yet?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-border bg-surface-subtle text-center text-xs text-muted-foreground">
        &copy; 2025 G-Tech ISP Operating System. Carrier-Grade Network Billing.
      </footer>
    </div>
  );
}

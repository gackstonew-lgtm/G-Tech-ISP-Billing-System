"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Lock, Mail, User, Building, ArrowRight, ShieldCheck, Sun, Moon, Sparkles } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/lib/auth/auth-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { enterDemoMode, refreshAuth } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Call server API to create auth user, org, and profile
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          organizationName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to create account. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // 2. Sign user in via client-side Supabase Auth
      const supabase = createSupabaseBrowserClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        setError("Account created, but sign in failed. Please proceed to the Sign In page.");
        setIsSubmitting(false);
        return;
      }

      await refreshAuth();
      router.push("/dashboard");
    } catch (err) {
      setError("Network error occurred during registration. Please try again.");
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

      {/* Register Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Tenant ISP Onboarding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Create Your ISP Account
            </h1>
            <p className="text-xs text-muted-foreground">
              Register your organization to start managing subscribers, speed plans, and M-Pesa billing
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-xl space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Baraka Gackstone"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  ISP / Organization Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="G-Tech Fiber Networks Ltd"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

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
                    placeholder="admin@gtechisp.co.ke"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-sm text-foreground focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Password
                </label>
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

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Provisioning Account...</span>
                ) : (
                  <>
                    <span>Create ISP Account</span>
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
              <span>Explore Demo Mode (No Registration Needed)</span>
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Already have an ISP account?{" "}
            <Link href="/sign-in" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-border bg-surface-subtle text-center text-xs text-muted-foreground">
        &copy; 2025 G-Tech ISP Operating System. Built for East African WISPs.
      </footer>
    </div>
  );
}

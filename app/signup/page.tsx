"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    agreed: false,
  });

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthMeta = [
    null,
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-yellow-500" },
    { label: "Good", color: "bg-blue-500" },
    { label: "Strong", color: "bg-green-500" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) return setError("Full name is required.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (!form.agreed) return setError("You must agree to the Terms & Privacy Policy.");

    setError("");
    setLoading(true);
    try {
      // TODO: replace with your auth logic
      await new Promise((r) => setTimeout(r, 1400));
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const eyeOff = (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  const eyeOn = (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <main className="min-h-screen bg-[#0a0f0b] flex items-center justify-center px-4 py-10">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-green-900/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-green-950/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-green-600/10 border border-green-700/30 flex items-center justify-center shadow-xl shadow-green-900/30">
            <Image
              src="/favicon.ico"
              alt="Green Yield logo"
              width={32}
              height={32}
              className="rounded-sm"
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white tracking-tight">Green Yield</p>
            <p className="text-xs text-green-600/70 mt-0.5">Start growing your wealth today.</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0e1410] rounded-3xl border border-white/[0.06] shadow-2xl shadow-black/70 px-8 py-10">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-zinc-500 mb-8">Fill in your details to get started</p>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-400" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-green-600/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-green-600/20"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-400" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-green-600/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-green-600/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-400" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 pr-11 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-green-600/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-green-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-green-500 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? eyeOff : eyeOn}
                </button>
              </div>

              {/* Strength bar */}
              {form.password && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength >= i
                            ? (strengthMeta[strength]?.color ?? "bg-green-500")
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength === 1 ? "text-red-400"
                    : strength === 2 ? "text-yellow-400"
                    : strength === 3 ? "text-blue-400"
                    : "text-green-400"
                  }`}>
                    {strengthMeta[strength]?.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-400" htmlFor="confirm">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                  placeholder="Repeat your password"
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-white placeholder-zinc-700 outline-none transition focus:ring-2 bg-white/[0.04] ${
                    form.confirm && form.confirm !== form.password
                      ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20"
                      : "border-white/[0.07] focus:border-green-600/50 focus:bg-white/[0.06] focus:ring-green-600/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-green-500 transition"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? eyeOff : eyeOn}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={(e) => update("agreed", e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                    form.agreed
                      ? "bg-green-600 border-green-600"
                      : "border-white/20 bg-white/[0.04] group-hover:border-green-600/40"
                  }`}
                >
                  {form.agreed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-zinc-500 leading-relaxed">
                I agree to Green Yield&apos;s{" "}
                <Link href="/terms" className="text-green-500 font-medium hover:text-green-400 transition">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-green-500 font-medium hover:text-green-400 transition">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/50 transition hover:bg-green-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-green-500 hover:text-green-400 transition">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    agreed: false,
  });

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) return setError("Full name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!form.phone.trim()) return setError("Phone number is required.");
    setError("");
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][strength];

  return (
    <main className="min-h-screen bg-[#f4fbf6] flex items-center justify-center px-4 py-10">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-green-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-green-300/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C6 2 3 5.5 3 9c0 2.5 1.5 4.7 3.7 5.8L10 18l3.3-3.2C15.5 13.7 17 11.5 17 9c0-3.5-3-7-7-7z" fill="white"/>
                <path d="M10 6v6M7 9h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-green-900 tracking-tight">Green Yield</span>
          </div>
          <p className="text-sm text-green-700/70">Start growing your wealth today.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-green-900/8 border border-green-100 px-8 py-10">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s
                      ? "bg-green-600 text-white shadow-md shadow-green-600/30"
                      : "bg-green-100 text-green-400"
                  }`}
                >
                  {step > s ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? "text-green-900" : "text-gray-400"}`}>
                  {s === 1 ? "Personal Info" : "Set Password"}
                </span>
                {s < 2 && <div className={`flex-1 h-px ${step > 1 ? "bg-green-500" : "bg-green-100"}`} />}
              </div>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-green-900 mb-1">
            {step === 1 ? "Create your account" : "Secure your account"}
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {step === 1
              ? "Fill in your details to get started"
              : "Choose a strong password to protect your account"}
          </p>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-green-900" htmlFor="fullName">
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
                  className="w-full rounded-xl border border-green-100 bg-green-50/50 px-4 py-3 text-sm text-green-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-3 focus:ring-green-500/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-green-900" htmlFor="email">
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
                  className="w-full rounded-xl border border-green-100 bg-green-50/50 px-4 py-3 text-sm text-green-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-3 focus:ring-green-500/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-green-900" htmlFor="phone">
                  Phone number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-green-100 bg-green-50/50 px-3 py-3 text-sm text-green-900 shrink-0">
                    <span>🇳🇬</span>
                    <span className="text-gray-500">+234</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="080 0000 0000"
                    className="flex-1 rounded-xl border border-green-100 bg-green-50/50 px-4 py-3 text-sm text-green-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-3 focus:ring-green-500/15"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-green-600/30 transition hover:bg-green-700 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-green-900" htmlFor="password">
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
                    className="w-full rounded-xl border border-green-100 bg-green-50/50 px-4 py-3 pr-11 text-sm text-green-900 placeholder-gray-400 outline-none transition focus:border-green-500 focus:ring-3 focus:ring-green-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition"
                  >
                    {showPassword ? (
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            strength >= i ? strengthColor : "bg-green-100"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      strength <= 1 ? "text-red-500" : strength === 2 ? "text-yellow-600" : strength === 3 ? "text-blue-600" : "text-green-600"
                    }`}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-green-900" htmlFor="confirm">
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
                    className={`w-full rounded-xl border bg-green-50/50 px-4 py-3 pr-11 text-sm text-green-900 placeholder-gray-400 outline-none transition focus:ring-3 ${
                      form.confirm && form.confirm !== form.password
                        ? "border-red-300 focus:border-red-400 focus:ring-red-400/15"
                        : "border-green-100 focus:border-green-500 focus:ring-green-500/15"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition"
                  >
                    {showConfirm ? (
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={form.agreed}
                    onChange={(e) => update("agreed", e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${
                      form.agreed
                        ? "bg-green-600 border-green-600"
                        : "border-green-200 bg-white group-hover:border-green-400"
                    }`}
                  >
                    {form.agreed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500 leading-relaxed">
                  I agree to Green Yield&apos;s{" "}
                  <Link href="/terms" className="text-green-600 font-medium hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-green-600 font-medium hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl border border-green-200 py-3.5 text-sm font-semibold text-green-700 hover:bg-green-50 transition active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-green-600/30 transition hover:bg-green-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-green-600 hover:text-green-700 transition">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

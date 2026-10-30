import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import AuthIllustration from "../components/AuthIllustration";

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Track whether a PASSWORD_RECOVERY event was received. A plain SIGNED_IN
  // event (e.g. a logged-in user navigating directly) is not sufficient proof
  // that a recovery flow was initiated.
  const recoveryConfirmed = useRef(false);

  useEffect(() => {
    let active = true;

    // 1. Check for error parameters the Supabase client embeds in the URL after
    //    a failed or expired recovery link click.
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const searchParams = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

    const urlError =
      searchParams.get("error_description") ||
      hashParams.get("error_description") ||
      searchParams.get("error") ||
      hashParams.get("error");

    if (urlError) {
      const isExpired = urlError.toLowerCase().includes("expired");
      setSessionError(
        isExpired
          ? "Your password reset link has expired. Please request a new one."
          : "This recovery link is invalid or has already been used."
      );
      setVerifying(false);
      return;
    }

    // 2. Subscribe to auth state changes BEFORE calling getSession so we never
    //    miss a PASSWORD_RECOVERY event that fires during initialisation.
    //
    //    The Supabase client emits PASSWORD_RECOVERY (not SIGNED_IN) when it
    //    detects a recovery redirect URL on page load. Accepting SIGNED_IN here
    //    would allow any already-logged-in user to reach the reset form by
    //    navigating directly to /reset-password.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY") {
        recoveryConfirmed.current = true;
        setIsValidSession(true);
        setSessionError("");
        setVerifying(false);
      }
    });

    // 3. Give the Supabase initialisation a moment to detect the recovery URL
    //    and emit PASSWORD_RECOVERY. If it hasn't fired within the timeout,
    //    check whether a code/type=recovery parameter is present in the URL.
    //    If neither is present, this is direct navigation — reject it.
    const timeout = setTimeout(() => {
      if (!active) return;

      if (recoveryConfirmed.current) {
        // Already handled by the listener above.
        return;
      }

      const hasCode = searchParams.has("code");
      const isRecoveryType =
        hashParams.get("type") === "recovery" ||
        searchParams.get("type") === "recovery";

      if (!hasCode && !isRecoveryType) {
        // No recovery context in the URL and no PASSWORD_RECOVERY event —
        // this is direct navigation without a valid recovery link.
        setSessionError(
          "No password reset session was found. Reset links are single-use and expire after a short time."
        );
      } else {
        // A code/type=recovery was in the URL but the event hasn't fired yet.
        // Surface a helpful message rather than leaving the spinner indefinitely.
        setSessionError(
          "Unable to verify your recovery link. It may be expired or already used."
        );
      }

      setVerifying(false);
    }, 4000);

    return () => {
      active = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdatePassword = async (event) => {
    event.preventDefault();
    setError("");

    if (!isValidSession) {
      setError(
        "A valid password recovery session is required to update your password."
      );
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Sign out to end the temporary recovery session.
      try {
        await supabase.auth.signOut();
      } catch {
        // Best-effort; the password has already been updated.
      }
    } catch (err) {
      setError(
        err.message || "Unable to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="flex w-full flex-col gap-2 bg-gradient-to-b from-emerald-100 to-emerald-50 px-6 py-4">
        <Link
          to="/"
          className="flex items-center self-start text-2xl font-bold text-emerald-700"
        >
          <ShieldCheck className="h-6 w-6" />
          MailGuard
        </Link>

        <p className="flex items-center gap-2 self-center rounded-full bg-emerald-100 px-4 py-2 text-sm text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Your secure gateway is ready!
        </p>
      </header>

      <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-10">
        <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-12 xl:gap-16">
          {/* Decorative Illustration */}
          <AuthIllustration variant="reset-password" />

          {/* Form / Status Card */}
          <div className="flex w-full max-w-[440px] flex-col items-center gap-4">
            <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">
              {verifying ? (
                /* Verification Loading State */
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
                  <h2 className="mt-4 text-lg font-semibold text-gray-800">
                    Verifying recovery link...
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Establishing your secure session with MailGuard.
                  </p>
                </div>
              ) : success ? (
                /* Success State */
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Password updated!
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    Your MailGuard account password has been changed successfully.
                    You can now sign in with your new credentials.
                  </p>

                  <Link
                    to="/login"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Continue to Sign In
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : !isValidSession ? (
                /* Invalid / Expired / Missing Recovery Session */
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <ShieldAlert className="h-8 w-8" />
                  </div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Invalid or Expired Link
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {sessionError ||
                      "This password reset link is invalid, expired, or has already been used."}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    For your protection, password recovery links are single-use
                    and expire after a short time.
                  </p>

                  <div className="mt-6 flex w-full flex-col gap-3">
                    <Link
                      to="/forgot-password"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      Request a New Reset Link
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      to="/login"
                      className="text-xs font-medium text-gray-500 hover:text-emerald-700"
                    >
                      Return to Sign In
                    </Link>
                  </div>
                </div>
              ) : (
                /* Valid Recovery Session - Reset Form */
                <form
                  onSubmit={handleUpdatePassword}
                  className="flex flex-col gap-4"
                >
                  <h1 className="text-center text-3xl font-semibold sm:text-4xl">
                    Set new password.
                  </h1>

                  <p className="text-center font-light text-gray-600">
                    Choose a strong password to secure your MailGuard account.
                  </p>

                  {/* New Password */}
                  <label htmlFor="password" className="font-light">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={loading}
                      className="w-full rounded-md border border-gray-300 p-2 pr-12 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <label htmlFor="confirmPassword" className="font-light">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;&#x2022;"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      disabled={loading}
                      className="w-full rounded-md border border-gray-300 p-2 pr-12 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-gray-400">
                    Must be at least 8 characters long.
                  </p>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-700 p-3 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Updating password..." : "Update password"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>

                  <div className="mt-2 text-center">
                    <Link
                      to="/login"
                      className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              )}
            </div>

            <p className="flex items-center gap-1 text-center text-xs text-gray-400">
              <Lock className="h-3.5 w-3.5" />
              End-to-end encrypted password transmission
            </p>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-gray-200 bg-emerald-50 px-6 py-6 text-sm text-gray-600 sm:flex-row sm:justify-between sm:px-16">
        <p>&#169; 2026 MailGuard Security. Assisted Clarity for Email.</p>

        <div className="flex gap-4">
          <Link to="/privacy">Privacy Policy</Link>
          <span className="text-gray-400">Support</span>
        </div>
      </footer>
    </>
  );
}

export default ResetPasswordPage;

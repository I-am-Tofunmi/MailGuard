import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import AuthIllustration from "../components/AuthIllustration";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleResetRequest = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : "http://localhost:5173/reset-password";

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo,
        });

      if (resetError) {
        // Surface rate-limit errors with a polite message.
        // For all other Supabase errors, do NOT fall through to the success
        // state — throw so the catch block can display a generic failure notice.
        if (resetError.message?.toLowerCase().includes("rate limit")) {
          throw new Error(
            "Too many requests. Please wait a few moments before trying again."
          );
        }
        throw new Error(
          "Unable to send reset instructions. Please try again."
        );
      }

      // Only reach here when Supabase accepted the request with no error.
      // Show the neutral success state, which avoids revealing whether the
      // address has an account.
      setSubmitted(true);
    } catch (err) {
      setError(
        err.message || "Unable to send reset instructions. Please try again."
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
          <AuthIllustration variant="forgot-password" />

          {/* Form / Success Card */}
          <div className="flex w-full max-w-[440px] flex-col items-center gap-4">
            <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8">
              {!submitted ? (
                <form
                  onSubmit={handleResetRequest}
                  className="flex flex-col gap-4"
                >
                  <h1 className="text-center text-3xl font-semibold sm:text-4xl">
                    Reset password.
                  </h1>

                  <p className="text-center font-light text-gray-600">
                    Enter the email address associated with your MailGuard account
                    and we'll send you a recovery link.
                  </p>

                  <label htmlFor="email" className="font-light">
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                    className="rounded-md border border-gray-300 p-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />

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
                    {loading ? "Sending link..." : "Send reset link"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>

                  <div className="mt-2 text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Mail className="h-8 w-8" />
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Check your email
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    If an account exists for this email address, you'll receive
                    instructions to reset your password.
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Please check your inbox and spam folder. Reset links expire after 60 minutes.
                  </p>

                  <div className="mt-6 flex w-full flex-col gap-3">
                    <Link
                      to="/login"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      Return to Sign In
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setEmail("");
                      }}
                      className="text-xs font-medium text-gray-500 hover:text-emerald-700"
                    >
                      Didn't get the email? Try another address
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-gray-500">
              Remember your password?{" "}
              <Link to="/login" className="font-medium text-emerald-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-gray-200 bg-emerald-50 px-6 py-6 text-sm text-gray-600 sm:flex-row sm:justify-between sm:px-16">
        <p>© 2026 MailGuard Security. Assisted Clarity for Email.</p>

        <div className="flex gap-4">
          <Link to="/privacy">Privacy Policy</Link>
          <span className="text-gray-400">Support</span>
        </div>
      </footer>
    </>
  );
}

export default ForgotPasswordPage;

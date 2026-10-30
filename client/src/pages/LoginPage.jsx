import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import AuthIllustration from "../components/AuthIllustration";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      if (!data.session) {
        throw new Error(
          "Unable to establish a session. Please try again."
        );
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (
        err.message?.toLowerCase().includes("email not confirmed")
      ) {
        setError(
          "Please confirm your email address before signing in."
        );
      } else if (
        err.message?.toLowerCase().includes("invalid login credentials")
      ) {
        setError("Incorrect email or password.");
      } else {
        setError(
          err.message || "Login failed. Please try again."
        );
      }
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
          <AuthIllustration variant="login" />

          <div className="flex w-full max-w-[440px] flex-col items-center gap-4">
            <form
              onSubmit={handleLogin}
              className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8"
            >
              <h1 className="text-center text-3xl font-semibold sm:text-4xl">
                Welcome back.
              </h1>

              <p className="text-center font-light text-gray-600">
                Let's make sure your emails keep reaching your customers.
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
                className="w-full rounded-md border border-gray-300 p-2"
              />

              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-light">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
                >
                  Forgot?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 p-2 pr-12"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
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
                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-700 p-3 text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}

                {!loading && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <hr className="flex-1 border-gray-300" />
                <span className="text-center font-mono text-xs text-gray-500">
                  OR CONTINUE WITH
                </span>
                <hr className="flex-1 border-gray-300" />
              </div>

              <div className="flex justify-center gap-5">
                <button
                  type="button"
                  disabled
                  title="Google sign-in coming soon"
                  className="flex items-center gap-2 rounded-md border border-gray-300 px-5 py-2 opacity-50"
                >
                  <FcGoogle className="h-5 w-5" />
                  Google
                </button>

                <button
                  type="button"
                  disabled
                  title="Microsoft sign-in coming soon"
                  className="flex items-center gap-2 rounded-md border border-gray-300 px-5 py-2 opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 23 23"
                  >
                    <rect x="0" y="0" width="10.5" height="10.5" fill="#f25022" />
                    <rect x="12.5" y="0" width="10.5" height="10.5" fill="#7fba00" />
                    <rect x="0" y="12.5" width="10.5" height="10.5" fill="#00a4ef" />
                    <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#ffb900" />
                  </svg>
                  Microsoft
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500">
              New to MailGuard?{" "}
              <Link
                to="/register"
                className="font-medium text-emerald-700"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-gray-200 bg-emerald-50 px-6 py-6 text-sm text-gray-600 sm:flex-row sm:justify-between sm:px-16">
        <p>
          © 2026 MailGuard Security. Assisted Clarity for Email.
        </p>

        <div className="flex gap-4">
          <Link to="/privacy">Privacy Policy</Link>
          <span className="text-gray-400">Support</span>
        </div>
      </footer>
    </>
  );
}

export default LoginPage;

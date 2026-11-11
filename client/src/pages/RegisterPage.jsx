import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import AuthIllustration from "../components/AuthIllustration";

function RegisterPage() {
  const navigate = useNavigate();
  const { signInWithProvider } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [error, setError] = useState("");

  const handleOAuthSignIn = async (provider) => {
    setError("");
    setOauthLoading(provider);

    try {
      await signInWithProvider(provider);
    } catch (err) {
      console.error(`OAuth registration error (${provider}):`, err);
      setError(
        err.message ||
          `Unable to register with ${
            provider === "azure" ? "Microsoft" : "Google"
          }. Please try again.`
      );
      setOauthLoading(null);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim()) {
      setError("Please enter your full name.");
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
      const normalizedEmail = email.trim().toLowerCase();

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      // If email confirmation is disabled, Supabase
      // may return an active session immediately.
      if (data.session) {
        navigate("/dashboard", { replace: true });
        return;
      }

      navigate("/check-email", {
        state: { email: normalizedEmail },
      });
    } catch (err) {
      setError(
        err.message || "Registration failed. Please try again."
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
          Your secure gateway is awaiting!
        </p>
      </header>

      <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-10">
        <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-12 xl:gap-16">
          <AuthIllustration variant="register" />

          <div className="flex w-full max-w-[440px] flex-col items-center gap-4">
            <form
              onSubmit={handleRegister}
              className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-md sm:p-8"
            >
              <h1 className="text-center text-3xl font-semibold sm:text-4xl">
                Create your account.
              </h1>

              <p className="text-center font-light text-gray-600">
                Start improving your business email deliverability
                with MailGuard.
              </p>

              <label htmlFor="fullName" className="font-light">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                required
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-md border border-gray-300 p-2"
              />

              <label htmlFor="email" className="font-light">
                Business Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-md border border-gray-300 p-2"
              />

              <label htmlFor="password" className="font-light">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 p-2 pr-12"
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <label htmlFor="confirmPassword" className="font-light">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-md border border-gray-300 p-2 pr-12"
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  required
                  disabled={loading}
                  className="mt-1"
                />
                <span>
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-medium text-emerald-700"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-medium text-emerald-700"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

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
                {loading ? "Creating Account..." : "Create Account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="flex items-center gap-2">
                <hr className="flex-1 border-gray-300" />
                <span className="text-center font-mono text-xs text-gray-500">
                  OR CONTINUE WITH
                </span>
                <hr className="flex-1 border-gray-300" />
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={loading || Boolean(oauthLoading)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {oauthLoading === "google" ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin text-emerald-700" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <FcGoogle className="h-4 w-4 shrink-0" />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("azure")}
                  disabled={loading || Boolean(oauthLoading)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {oauthLoading === "azure" ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin text-emerald-700" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 shrink-0"
                        viewBox="0 0 23 23"
                      >
                        <rect x="0" y="0" width="10.5" height="10.5" fill="#f25022" />
                        <rect x="12.5" y="0" width="10.5" height="10.5" fill="#7fba00" />
                        <rect x="0" y="12.5" width="10.5" height="10.5" fill="#00a4ef" />
                        <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#ffb900" />
                      </svg>
                      <span>Continue with Microsoft</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="flex items-center gap-1 text-center text-gray-500">
              <LockKeyhole className="h-4 w-4" />
              Assisted Clarity for Email Security
            </p>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-emerald-700"
              >
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
          <a href="mailto:support@example.com" onClick={(e) => e.preventDefault()}>
            Support
          </a>
        </div>
      </footer>
    </>
  );
}

export default RegisterPage;

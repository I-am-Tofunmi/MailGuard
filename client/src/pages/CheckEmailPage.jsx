import { Link, useLocation } from "react-router-dom";
import { MailCheck, ShieldCheck, ArrowRight } from "lucide-react";

function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-white">
      <header className="px-6 py-5">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-emerald-700"
        >
          <ShieldCheck className="h-6 w-6" />
          MailGuard
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <MailCheck className="h-10 w-10 text-emerald-700" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Check your email
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-600">
            If your registration was accepted, we've sent a
            confirmation link
            {email ? (
              <>
                {" "}to <strong>{email}</strong>
              </>
            ) : (
              " to your email address"
            )}
            .
          </p>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Open your inbox and click the confirmation link
            to verify your MailGuard account.
          </p>

          <Link
            to="/login"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Continue to Login
            <ArrowRight size={17} />
          </Link>

          <p className="mt-6 text-xs text-gray-500">
            Didn't receive the email? Check your spam folder.
          </p>
        </div>
      </main>
    </div>
  );
}

export default CheckEmailPage;
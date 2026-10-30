import {
  ShieldCheck,
  Mail,
  CheckCircle2,
  Lock,
  Inbox,
  Check,
} from "lucide-react";

const illustrationContent = {
  login: {
    badge: "Reliable Email Delivery",
    headline: "Your emails deserve the inbox.",
    supportingText:
      "Understand your email authentication and deliverability with clear, actionable guidance.",
    mobileTitle: "Deliver with certainty",
    mobileSubtitle: "Keep business emails in the primary inbox.",
    mobileBadge: "Primary Inbox",
    cardTitle: "Customer Communication",
    cardSubtitle: "orders@yourbusiness.com",
    subject: "Monthly Statement & Service Update",
    statusBadge: "Delivered to Inbox",
    statusDetail: "Ready for your primary inbox",
    highlights: [
      "Check why emails land in spam folders",
      "Understand technical warnings in plain English",
      "Track your email configuration over time",
    ],
  },
  register: {
    badge: "Simple, Safe Setup",
    headline: "A better home for your business emails",
    supportingText:
      "Create your account to check email health, understand delivery issues, and find clear steps to improve your results.",
    mobileTitle: "A better home for your emails",
    mobileSubtitle: "Check email health & improve delivery.",
    mobileBadge: "Safe Setup",
    cardTitle: "Business Email Protection",
    cardSubtitle: "yourcompany.com",
    subject: "Safe sending for all outbound emails",
    statusBadge: "Protected Setup",
    statusDetail: "Clean configuration & privacy-first",
    highlights: [
      "Check where your emails land before sending",
      "Clear, step-by-step guidance to fix delivery issues",
      "Built for privacy with no email tracking",
    ],
  },
  "forgot-password": {
    badge: "Account Recovery",
    headline: "Let's get you back in.",
    supportingText:
      "We'll help you securely regain access to your MailGuard account.",
    mobileTitle: "Secure account recovery",
    mobileSubtitle: "One-time reset link delivered to your inbox.",
    mobileBadge: "Single Use",
    cardTitle: "Single-Use Reset Link",
    cardSubtitle: "Direct inbox delivery",
    subject: "Secure account recovery request",
    statusBadge: "Protected & Encrypted",
    statusDetail: "Valid for 60 minutes",
    highlights: [
      "Only accessible through your verified email",
      "Single-use link expires automatically",
      "Your domain monitoring history is safe",
    ],
  },
  "reset-password": {
    badge: "Credential Security",
    headline: "Secure your account.",
    supportingText:
      "Choose a new password to get back to MailGuard.",
    mobileTitle: "Protect your account",
    mobileSubtitle: "Choose a fresh, secure password.",
    mobileBadge: "Encrypted",
    cardTitle: "Account Protection",
    cardSubtitle: "Password update",
    subject: "Choose a secure new password",
    statusBadge: "Safe & Encrypted",
    statusDetail: "Immediate account protection",
    highlights: [
      "At least 8 characters for strong protection",
      "Instantly sign in after saving your new password",
      "Active protection across all your devices",
    ],
  },
};

function AuthIllustration({
  variant = "login",
  headline,
  supportingText,
  className = "",
}) {
  const content =
    illustrationContent[variant] || illustrationContent.login;
  const displayHeadline = headline || content.headline;
  const displaySupportingText =
    supportingText || content.supportingText;

  const isLockVariant =
    variant === "forgot-password" || variant === "reset-password";

  return (
    <aside
      className={`animate-mg-fade-in flex w-full max-w-[440px] flex-col justify-start px-2 lg:-translate-y-3 lg:px-0 ${className}`}
      aria-label="Product benefits overview"
    >
      {/* 1. Mobile-only compact banner (< sm, 640px) */}
      <div className="block sm:hidden w-full">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white/95 px-3.5 py-2.5 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              {isLockVariant ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <Mail className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-900">
                {content.mobileTitle}
              </p>
              <p className="truncate text-[11px] text-gray-500">
                {content.mobileSubtitle}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
            {content.mobileBadge}
          </span>
        </div>
      </div>

      {/* 2. Tablet (sm) and Desktop (lg) view */}
      <div className="hidden sm:flex sm:flex-col">
        {/* Category pill and headline */}
        <div className="mb-4 lg:mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            {content.badge}
          </span>

          <h2 className="mt-2.5 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
            {displayHeadline}
          </h2>

          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-gray-600">
            {displaySupportingText}
          </p>
        </div>

        {/* Clean, approachable visual card */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
          {/* Email / message header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3.5 lg:pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                {isLockVariant ? (
                  <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
                ) : (
                  <Mail className="h-4 w-4 lg:h-5 lg:w-5" />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-900">
                  {content.cardTitle}
                </p>
                <p className="text-[11px] text-gray-500">
                  {content.cardSubtitle}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
              <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
              {content.statusBadge}
            </span>
          </div>

          {/* Familiar email message context */}
          <div className="my-3.5 lg:my-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3 lg:p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-500">
                Message Preview
              </span>
              <Inbox className="h-3.5 w-3.5 text-gray-400" />
            </div>

            <p className="mt-1 text-xs font-semibold text-gray-800">
              {content.subject}
            </p>

            <p className="mt-0.5 text-[11px] font-medium text-emerald-700">
              ✓ {content.statusDetail}
            </p>
          </div>

          {/* Desktop-only reassurance checklist: shown on desktop (lg+), hidden on tablet (sm-md) to prevent unnecessary vertical scrolling */}
          <ul className="hidden lg:flex flex-col gap-2.5 border-t border-gray-100 pt-4">
            {content.highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-xs text-gray-600"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default AuthIllustration;

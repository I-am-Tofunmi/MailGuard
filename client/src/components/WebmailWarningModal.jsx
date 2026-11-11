import { useEffect } from "react";
import { AlertCircle, X, ShieldAlert, ArrowRight } from "lucide-react";

/**
 * Educational modal displayed when a user attempts to audit a public webmail domain
 * (e.g., gmail.com, yahoo.com, outlook.com).
 */
function WebmailWarningModal({
  isOpen,
  onClose,
  onTryCustomDomain,
  detectedDomain = "",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="webmail-modal-title"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Explicit ✕ Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header with Soft Amber/Blue Badge and Icon */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
            <AlertCircle size={24} />
          </div>

          <div className="min-w-0 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                id="webmail-modal-title"
                className="text-lg sm:text-xl font-bold text-gray-900"
              >
                Custom Business Domains Only
              </h2>
              {detectedDomain && (
                <span className="rounded-md bg-amber-100 px-2 py-0.5 font-mono text-xs font-semibold text-amber-900">
                  {detectedDomain}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-amber-800 font-medium">
              Free webmail services cannot be customized
            </p>
          </div>
        </div>

        {/* Informative Educational Body */}
        <div className="mt-4 space-y-3 text-xs sm:text-sm leading-relaxed text-gray-700">
          <p>
            MailGuard is designed for <strong>custom business domains</strong> (e.g.,{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-800">
              yourcompany.com
            </code>
            ). Free webmail providers like Gmail, Yahoo, and Outlook are managed directly
            by Google and Microsoft, so individual users cannot edit their DNS records.
          </p>

          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs sm:text-sm text-blue-950">
            <p className="leading-relaxed">
              <strong>Tip for Business Owners:</strong> If you run a business, setting up a custom
              domain with Google Workspace, Microsoft 365, or a local registrar (like Whogohost or
              Truehost) will instantly boost your deliverability and prevent client invoices from
              landing in spam.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex min-h-[42px] items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer"
          >
            I understand
          </button>

          <button
            type="button"
            onClick={onTryCustomDomain}
            className="w-full sm:w-auto inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-800 cursor-pointer"
          >
            <span>Try a Custom Domain</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebmailWarningModal;

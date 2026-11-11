import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building2,
  Bell,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Camera,
  Upload,
  Trash2,
  LoaderCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { getUserDisplayName, getUserAvatarUrl, getUserInitials } from "../utils/userUtils";

// ── helpers ────────────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 bg-[#F4F7FC] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
          <Icon size={17} className="text-emerald-700" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[#071B36]">{title}</h2>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function FormField({ label, htmlFor, hint, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}

function inputCls(disabled) {
  return `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition ${
    disabled
      ? "border-gray-100 bg-gray-50 text-gray-400 cursor-default"
      : "border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
  }`;
}

function SaveButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-[#007F59] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Saving…" : children}
    </button>
  );
}

function FeedbackMessage({ type, message }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div
      role="alert"
      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
        isSuccess
          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 size={16} className="shrink-0" />
      ) : (
        <AlertCircle size={16} className="shrink-0" />
      )}
      {message}
    </div>
  );
}

// ── password strength ──────────────────────────────────────────────────────

function passwordStrength(pw) {
  if (!pw) return null;
  const strong = pw.length >= 10 && /[A-Z]/.test(pw) && /[0-9]/.test(pw);
  const medium = pw.length >= 8;
  if (strong) return { label: "Strong", cls: "text-emerald-700", barCls: "bg-emerald-500 w-full" };
  if (medium) return { label: "Fair",   cls: "text-amber-600",   barCls: "bg-amber-400 w-2/3" };
  return          { label: "Weak",    cls: "text-red-600",     barCls: "bg-red-400 w-1/3" };
}

// ── main component ─────────────────────────────────────────────────────────

function SettingsPage() {
  const { user, signOut, updateUserMetadata, refreshUser } = useAuth();
  const navigate = useNavigate();

  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const initials = getUserInitials(user);

  // ── Avatar ─────────────────────────────────────────────────────────────
  const fileInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState({ type: "", msg: "" });

  // ── Personal info ──────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [nameLoading, setNameLoading] = useState(false);
  const [nameFeedback, setNameFeedback] = useState({ type: "", msg: "" });

  // ── Business info ──────────────────────────────────────────────────────
  // Stored in user_metadata. Persisted to Supabase on save.
  const [businessName, setBusinessName] = useState(
    user?.user_metadata?.business_name || ""
  );
  const [businessWebsite, setBusinessWebsite] = useState(
    user?.user_metadata?.business_website || ""
  );
  const [bizLoading, setBizLoading] = useState(false);
  const [bizFeedback, setBizFeedback] = useState({ type: "", msg: "" });

  // ── Notifications ──────────────────────────────────────────────────────
  // Stored locally only — no backend notification system exists yet.
  const [notifCheckComplete, setNotifCheckComplete] = useState(false);
  const [notifReminders, setNotifReminders] = useState(false);

  // ── Password change ────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwFeedback, setPwFeedback] = useState({ type: "", msg: "" });

  // ── Logout ─────────────────────────────────────────────────────────────
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  // Keep name in sync if user object changes (e.g. after update)
  const prevUserRef = useRef(user);
  useEffect(() => {
    if (prevUserRef.current !== user) {
      prevUserRef.current = user;
      setFullName(user?.user_metadata?.full_name || "");
      setBusinessName(user?.user_metadata?.business_name || "");
      setBusinessWebsite(user?.user_metadata?.business_website || "");
    }
  }, [user]);

  // ── handlers ────────────────────────────────────────────────────────────

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFeedback({ type: "", msg: "" });

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setAvatarFeedback({
        type: "error",
        msg: "Please upload an image file (JPG, PNG, or WebP).",
      });
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarFeedback({
        type: "error",
        msg: "Image size must be less than 2MB.",
      });
      return;
    }

    setAvatarLoading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result;
          if (updateUserMetadata) {
            await updateUserMetadata({ avatar_url: base64Data });
          } else {
            const { error } = await supabase.auth.updateUser({
              data: { avatar_url: base64Data },
            });
            if (error) throw error;
          }
          if (refreshUser) {
            await refreshUser();
          }
          setAvatarFeedback({
            type: "success",
            msg: "Profile avatar updated successfully.",
          });
        } catch (err) {
          setAvatarFeedback({
            type: "error",
            msg: err.message || "Failed to update profile photo.",
          });
        } finally {
          setAvatarLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAvatarLoading(false);
      setAvatarFeedback({
        type: "error",
        msg: err.message || "Failed to process image file.",
      });
    }
  }

  async function handleRemoveAvatar() {
    setAvatarLoading(true);
    setAvatarFeedback({ type: "", msg: "" });
    try {
      if (updateUserMetadata) {
        await updateUserMetadata({ avatar_url: null });
      } else {
        const { error } = await supabase.auth.updateUser({
          data: { avatar_url: null },
        });
        if (error) throw error;
      }
      if (refreshUser) {
        await refreshUser();
      }
      setAvatarFeedback({
        type: "success",
        msg: "Profile avatar removed.",
      });
    } catch (err) {
      setAvatarFeedback({
        type: "error",
        msg: err.message || "Failed to remove avatar.",
      });
    } finally {
      setAvatarLoading(false);
    }
  }

  async function handleSaveName(e) {
    e.preventDefault();
    setNameFeedback({ type: "", msg: "" });
    const trimmed = fullName.trim();
    if (!trimmed) {
      setNameFeedback({ type: "error", msg: "Please enter your name." });
      return;
    }
    setNameLoading(true);
    try {
      if (updateUserMetadata) {
        await updateUserMetadata({ full_name: trimmed });
      } else {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: trimmed },
        });
        if (error) throw error;
      }
      if (refreshUser) {
        await refreshUser();
      }
      setNameFeedback({ type: "success", msg: "Your name has been updated." });
    } catch (err) {
      setNameFeedback({
        type: "error",
        msg: err.message || "Unable to update name. Please try again.",
      });
    } finally {
      setNameLoading(false);
    }
  }

  async function handleSaveBusiness(e) {
    e.preventDefault();
    setBizFeedback({ type: "", msg: "" });
    setBizLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          business_name: businessName.trim(),
          business_website: businessWebsite.trim(),
        },
      });
      if (error) throw error;
      setBizFeedback({ type: "success", msg: "Business details saved." });
    } catch (err) {
      setBizFeedback({
        type: "error",
        msg: err.message || "Unable to save business details. Please try again.",
      });
    } finally {
      setBizLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwFeedback({ type: "", msg: "" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwFeedback({ type: "error", msg: "Please fill in all password fields." });
      return;
    }
    if (newPassword.length < 8) {
      setPwFeedback({ type: "error", msg: "Your new password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwFeedback({ type: "error", msg: "The new passwords do not match." });
      return;
    }

    setPwLoading(true);
    try {
      // Re-authenticate first to confirm identity
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: currentPassword,
      });
      if (reAuthError) {
        throw new Error("Your current password is incorrect. Please try again.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setPwFeedback({ type: "success", msg: "Your password has been changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwFeedback({
        type: "error",
        msg: err.message || "Unable to change password. Please try again.",
      });
    } finally {
      setPwLoading(false);
    }
  }

  async function handleLogout() {
    if (logoutLoading) return;
    setLogoutLoading(true);
    setLogoutError("");
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Unable to sign out. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  }

  const pwStrength = passwordStrength(newPassword);

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FE]">
      <Navbar />

      <main className="mx-auto w-full max-w-[780px] flex-1 px-5 pb-16 pt-10 sm:px-8 lg:px-0">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#071B36]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account and how MailGuard works for your business.
          </p>
        </div>

        <div className="flex flex-col gap-6">

          {/* ── A. Personal Information ── */}
          <SectionCard
            icon={User}
            title="Personal Information"
            subtitle="Your name and photo as they appear across MailGuard"
          >
            {/* Avatar Upload Container */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-emerald-600/30 shadow-sm"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-800 ring-2 ring-emerald-600/20 shadow-sm">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  aria-label="Upload new avatar"
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-700 text-white shadow hover:bg-emerald-800 disabled:opacity-50"
                >
                  <Camera size={14} />
                </button>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">Profile Avatar</h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Upload a JPG, PNG, or WebP photo (max 2MB).
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
                  >
                    {avatarLoading ? (
                      <LoaderCircle size={14} className="animate-spin text-emerald-700" />
                    ) : (
                      <Upload size={14} />
                    )}
                    Upload Photo
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={avatarLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="mt-2">
                  <FeedbackMessage type={avatarFeedback.type} message={avatarFeedback.msg} />
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveName} className="flex flex-col gap-4">

              <FormField label="Full name" htmlFor="full-name">
                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  placeholder="Your full name"
                  className={inputCls(false)}
                />
              </FormField>

              <FormField
                label="Email address"
                htmlFor="account-email"
                hint="To change your email address, please contact MailGuard support. For security reasons this requires email verification."
              >
                <input
                  id="account-email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  readOnly
                  className={inputCls(true)}
                />
              </FormField>

              <FeedbackMessage type={nameFeedback.type} message={nameFeedback.msg} />

              <div>
                <SaveButton loading={nameLoading}>Save name</SaveButton>
              </div>
            </form>
          </SectionCard>

          {/* ── B. Business Information ── */}
          <SectionCard
            icon={Building2}
            title="Business Information"
            subtitle="Helps personalise your MailGuard experience"
          >
            <form onSubmit={handleSaveBusiness} className="flex flex-col gap-4">

              <FormField label="Business name" htmlFor="business-name">
                <input
                  id="business-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Savannah Traders Ltd"
                  className={inputCls(false)}
                />
              </FormField>

              <FormField
                label="Business website or domain (optional)"
                htmlFor="business-website"
                hint="Enter the domain you use to send business emails, e.g. mybusiness.com"
              >
                <input
                  id="business-website"
                  type="text"
                  value={businessWebsite}
                  onChange={(e) => setBusinessWebsite(e.target.value)}
                  placeholder="e.g. mybusiness.com"
                  className={inputCls(false)}
                />
              </FormField>

              <FeedbackMessage type={bizFeedback.type} message={bizFeedback.msg} />

              <div>
                <SaveButton loading={bizLoading}>Save business details</SaveButton>
              </div>
            </form>
          </SectionCard>

          {/* ── C. Notifications ── */}
          <SectionCard
            icon={Bell}
            title="Notifications"
            subtitle="Choose how MailGuard keeps you informed"
          >
            {/* Honest disclaimer */}
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>
                Email notifications are not yet active. These preferences will be applied when the notification service is connected.
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <ToggleRow
                id="notif-complete"
                checked={notifCheckComplete}
                onChange={setNotifCheckComplete}
                label="Email me when a check is complete"
                description="Receive a summary each time one of your email checks finishes."
              />
              <ToggleRow
                id="notif-reminders"
                checked={notifReminders}
                onChange={setNotifReminders}
                label="Send me important email health reminders"
                description="Occasional tips and reminders to keep your email delivery healthy."
              />
            </div>
          </SectionCard>

          {/* ── D. Security — Change Password ── */}
          <SectionCard
            icon={Lock}
            title="Change Password"
            subtitle="Update the password you use to sign in to MailGuard"
          >
            <form
              onSubmit={handleChangePassword}
              className="flex flex-col gap-4"
              autoComplete="off"
            >
              <FormField label="Current password" htmlFor="current-pw">
                <PasswordInput
                  id="current-pw"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  show={showCurrent}
                  onToggle={() => setShowCurrent((v) => !v)}
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                />
              </FormField>

              <FormField label="New password" htmlFor="new-pw">
                <PasswordInput
                  id="new-pw"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNew}
                  onToggle={() => setShowNew((v) => !v)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
                {/* Strength indicator */}
                {pwStrength && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all ${pwStrength.barCls}`}
                      />
                    </div>
                    <p className={`mt-1 text-xs font-medium ${pwStrength.cls}`}>
                      {pwStrength.label} password
                    </p>
                  </div>
                )}
              </FormField>

              <FormField label="Confirm new password" htmlFor="confirm-pw">
                <PasswordInput
                  id="confirm-pw"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirm}
                  onToggle={() => setShowConfirm((v) => !v)}
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                />
              </FormField>

              <FeedbackMessage type={pwFeedback.type} message={pwFeedback.msg} />

              <div>
                <SaveButton loading={pwLoading}>Update password</SaveButton>
              </div>
            </form>
          </SectionCard>

          {/* ── E. Account ── */}
          <SectionCard
            icon={LogOut}
            title="Account"
            subtitle="Manage your MailGuard account"
          >
            <div className="flex flex-col gap-4">

              {/* Account profile display */}
              <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-emerald-600/30"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900" title={displayName}>
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-gray-500" title={user?.email || ""}>
                    {user?.email || "—"}
                  </p>
                </div>
              </div>

              {/* Sign out */}
              {logoutError && (
                <FeedbackMessage type="error" message={logoutError} />
              )}

              <div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut size={16} />
                  {logoutLoading ? "Signing out…" : "Sign Out"}
                </button>
              </div>

              {/* Quick links */}
              <div className="mt-2 flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200">
                <QuickLink label="Privacy Policy" />
                <QuickLink label="Terms of Service" />
                <QuickLink label="Contact Support" />
              </div>

            </div>
          </SectionCard>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// ── helper components ──────────────────────────────────────────────────────

function ToggleRow({ id, checked, onChange, label, description }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-gray-100 p-4 transition hover:bg-gray-50"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      {/* Toggle switch */}
      <div className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`h-6 w-11 rounded-full transition-colors ${
            checked ? "bg-emerald-600" : "bg-gray-200"
          }`}
        />
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </div>
    </label>
  );
}

function PasswordInput({ id, value, onChange, show, onToggle, autoComplete, placeholder }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-3.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={onToggle}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function QuickLink({ label }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between px-4 py-3 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-emerald-700"
    >
      {label}
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  );
}

export default SettingsPage;

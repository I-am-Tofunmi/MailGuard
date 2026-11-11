/**
 * Resolves user display name according to the priority order:
 * 1. user.user_metadata?.full_name or user.user_metadata?.name
 * 2. Email prefix capitalized (e.g., "tofunmi" from "tofunmi@dev.com" -> "Tofunmi")
 * 3. Fallback: "User" (never "mailguard user")
 */
export function getUserDisplayName(user) {
  if (!user) return "User";

  const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (metaName && typeof metaName === "string" && metaName.trim()) {
    return metaName.trim();
  }

  if (user.email && typeof user.email === "string") {
    const rawPrefix = user.email.split("@")[0] || "";
    const cleanPrefix = rawPrefix.replace(/[._+-]/g, " ").trim();
    if (cleanPrefix) {
      return cleanPrefix
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }
  }

  return "User";
}

/**
 * Returns the configured avatar image URL from user metadata if present
 */
export function getUserAvatarUrl(user) {
  return (
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.avatar ||
    user?.user_metadata?.picture ||
    null
  );
}

/**
 * Returns initials for user avatar badge (e.g., "TO" or "T")
 */
export function getUserInitials(user) {
  const name = getUserDisplayName(user);
  if (!name || name === "User") return "U";

  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

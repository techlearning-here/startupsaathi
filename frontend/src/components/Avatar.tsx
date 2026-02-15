"use client";

/**
 * Avatar display with fallback to initials (AVATAR-04).
 */

type Props = {
  avatarUrl?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-20 h-20 text-xl",
};

function getInitials(email: string | null | undefined): string {
  if (!email || !email.trim()) return "?";
  const part = email.trim().split("@")[0];
  if (!part) return "?";
  const segments = part.replace(/[._-]/g, " ").split(/\s+/).filter(Boolean);
  if (segments.length >= 2) {
    return (segments[0][0] + segments[1][0]).toUpperCase().slice(0, 2);
  }
  return part.slice(0, 2).toUpperCase();
}

export function Avatar({ avatarUrl, email, size = "md", className = "" }: Props) {
  const sizeClass = sizeClasses[size];
  const initials = getInitials(email ?? null);

  if (avatarUrl?.trim()) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${sizeClass} rounded-full object-cover bg-stone-200 ${className}`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} rounded-full bg-amber-200 text-stone-700 inline-flex items-center justify-center font-medium ${className}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

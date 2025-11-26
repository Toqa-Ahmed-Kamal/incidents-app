
import React from "react";

function getInitials(user) {
  const name = user?.displayName?.trim() || user?.email || "";
  if (!name) return "U";


  const parts = name.replace(/\s+/g, " ").split(" ");
  if (parts.length >= 2 && user?.displayName) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }


  if (!user?.displayName && user?.email) {
    const local = user.email.split("@")[0];
    const segs = local.split(/[.\-_]+/).filter(Boolean);
    if (segs.length >= 2) return (segs[0][0] + segs[1][0]).toUpperCase();
    if (segs.length === 1) return segs[0].slice(0, 2).toUpperCase();
  }


  return parts[0][0].toUpperCase();
}

export default function AvatarInitials({ user, size = 26, title }) {
  const initials = getInitials(user);
  const style = {
    width: size,
    height: size,
    lineHeight: `${size}px`,
    fontSize: Math.max(10, Math.floor(size * 0.45)),
  };

  return (
    <div
      className="rounded-circle d-inline-flex align-items-center justify-content-center
                 bg-primary-subtle text-primary-emphasis border"
      style={style}
      title={title || (user?.displayName || user?.email)}
      aria-label="User avatar initials"
    >
      <span className="fw-semibold">{initials}</span>
    </div>
  );
}

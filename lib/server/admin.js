const ids = (process.env.ADMIN_UIDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const isAdminUid = (uid) => ids.includes(uid);

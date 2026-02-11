export function sanitizeFileName(fileName: string) {
  const normalized = fileName.trim().replace(/\s+/g, "_");
  const safe = normalized.replace(/[^A-Za-z0-9._-]/g, "");
  return safe.length > 0 ? safe : "attachment";
}

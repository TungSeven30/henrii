export function sanitizeFileName(fileName: string) {
  // Step 1: Normalize and trim
  let normalized = fileName.trim().replace(/\s+/g, "_");

  // Step 2: Remove path traversal sequences entirely
  // This blocks: ../, ..\, .., /.., \.., and variations
  normalized = normalized.replace(/\.\.[\/\\]?/g, "");
  normalized = normalized.replace(/[\/\\]\.\./g, "");

  // Step 3: Remove any remaining path separators
  normalized = normalized.replace(/[\/\\]/g, "_");

  // Step 4: Handle multiple dots - prevent extension spoofing
  // Keep only the last extension, remove all other dots
  const lastDotIndex = normalized.lastIndexOf(".");
  if (lastDotIndex > 0) {
    const namePart = normalized.substring(0, lastDotIndex).replace(/\./g, "_");
    const extensionPart = normalized.substring(lastDotIndex);
    normalized = namePart + extensionPart;
  }

  // Step 5: Remove any other special characters that could be used maliciously
  // Only allow alphanumeric, single dots, hyphens, and underscores
  const safe = normalized.replace(/[^A-Za-z0-9._-]/g, "");

  // Step 6: Ensure we don't start or end with a dot (hidden file or trailing dot issues)
  const trimmed = safe.replace(/^\.+|\.+$/g, "");

  // Step 7: Return default if empty
  return trimmed.length > 0 ? trimmed : "attachment";
}

import { describe, expect, it } from "vitest";
import { sanitizeFileName } from "./sanitize-file-name";

describe("sanitizeFileName", () => {
  describe("path traversal prevention", () => {
    it("should reject path traversal with forward slashes (../)", () => {
      const result = sanitizeFileName("../../../etc/passwd");
      // The ../ sequences should be stripped, leaving only etc_passwd or similar
      expect(result).not.toContain("../");
      expect(result).not.toContain("..");
      expect(result).not.toMatch(/\.\./);
    });

    it("should reject path traversal with backslashes (..\\)", () => {
      const result = sanitizeFileName("..\\..\\windows\\system32\\config\\sam");
      expect(result).not.toContain("..\\");
      expect(result).not.toContain("..");
    });

    it("should reject standalone double dots", () => {
      const result = sanitizeFileName("..");
      expect(result).not.toBe("..");
      expect(result).not.toContain("..");
    });

    it("should reject filename starting with double dots", () => {
      const result = sanitizeFileName("..hiddenfile.txt");
      expect(result).not.toContain("..");
      expect(result).not.toMatch(/^\./);
    });

    it("should reject path traversal in the middle of filename", () => {
      const result = sanitizeFileName("file../../../etc/passwd.txt");
      expect(result).not.toContain("../");
      expect(result).not.toContain("..");
    });

    it("should reject encoded path traversal attempts", () => {
      // While we don't decode, ensure the pattern is still blocked
      const result = sanitizeFileName("file..%2F..%2Fsecret.txt");
      expect(result).not.toContain("../");
    });

    it("should reject forward slashes in filename", () => {
      const result = sanitizeFileName("path/to/file.txt");
      expect(result).not.toContain("/");
    });

    it("should reject backslashes in filename", () => {
      const result = sanitizeFileName("path\\to\\file.txt");
      expect(result).not.toContain("\\");
    });

    it("should handle complex path traversal attempts", () => {
      const malicious = "....//....//....//etc/passwd";
      const result = sanitizeFileName(malicious);
      expect(result).not.toContain("../");
      expect(result).not.toContain("..");
    });
  });

  describe("extension spoofing prevention", () => {
    it("should sanitize multiple dots to prevent double extension attacks", () => {
      // Double extension attack: shell.php.jpg could execute as PHP
      const result = sanitizeFileName("shell.php.jpg");
      // Should only keep the last extension
      expect(result).toBe("shell_php.jpg");
    });

    it("should handle triple extension attempts", () => {
      const result = sanitizeFileName("file.exe.txt.jpg");
      expect(result).toBe("file_exe_txt.jpg");
    });

    it("should remove leading dots (hidden files)", () => {
      const result = sanitizeFileName(".htaccess");
      // Leading dots should be removed to prevent hidden file creation
      expect(result).not.toMatch(/^\./);
    });

    it("should remove trailing dots", () => {
      const result = sanitizeFileName("file.txt.");
      expect(result).not.toMatch(/\.$/);
    });

    it("should handle filename with many dots", () => {
      const result = sanitizeFileName("a.b.c.d.e.f.txt");
      expect(result).toBe("a_b_c_d_e_f.txt");
    });
  });

  describe("normal file handling", () => {
    it("should preserve single extension", () => {
      const result = sanitizeFileName("document.pdf");
      expect(result).toBe("document.pdf");
    });

    it("should normalize spaces to underscores", () => {
      const result = sanitizeFileName("my file name.txt");
      expect(result).toBe("my_file_name.txt");
    });

    it("should allow hyphens", () => {
      const result = sanitizeFileName("my-file-name.txt");
      expect(result).toBe("my-file-name.txt");
    });

    it("should handle alphanumeric characters", () => {
      const result = sanitizeFileName("file123.txt");
      expect(result).toBe("file123.txt");
    });

    it("should return default for empty filename", () => {
      const result = sanitizeFileName("");
      expect(result).toBe("attachment");
    });

    it("should return default for filename with only special characters", () => {
      const result = sanitizeFileName("@#$%^&*");
      expect(result).toBe("attachment");
    });
  });

  describe("regression - specific attack vectors", () => {
    it("should block attempt to access /etc/passwd", () => {
      const result = sanitizeFileName("../../../etc/passwd");
      // Path traversal sequences must be removed
      expect(result).not.toContain("../");
      expect(result).not.toContain("..");
      // Path separators must be removed/replaced
      expect(result).not.toContain("/");
      // Result should be safe for use in file paths
      expect(result).not.toMatch(/^\./);
    });

    it("should block windows system file access", () => {
      const result = sanitizeFileName("..\\..\\windows\\system32\\config\\sam");
      // Path traversal sequences must be removed
      expect(result).not.toContain("..");
      // Path separators must be removed
      expect(result).not.toContain("\\");
      expect(result).not.toContain("/");
    });

    it("should block null byte injection attempt", () => {
      const result = sanitizeFileName("file.php%00.jpg");
      // %00 is encoded null byte - ensure dots are handled
      // Multiple dots should be reduced to single extension
      expect(result).not.toContain(".php.");
      expect(result).not.toContain("..");
    });

    it("should handle mixed attack vectors", () => {
      const malicious = "  ../../../etc/../secret.txt.exe.jpg  ";
      const result = sanitizeFileName(malicious);
      expect(result).not.toContain("../");
      expect(result).not.toContain("..");
      expect(result).not.toContain("/");
      expect(result).not.toContain("\\");
    });
  });
});

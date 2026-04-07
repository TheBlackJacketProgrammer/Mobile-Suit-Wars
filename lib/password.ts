import bcrypt from "bcryptjs";

/**
 * Verifies a plaintext password against the stored value.
 * Supports bcrypt hashes; otherwise falls back to plain comparison for legacy rows.
 * Prefer hashing all passwords and removing the legacy branch.
 */
export async function verifyPassword(
  plain: string,
  stored: string
): Promise<boolean> {
  if (/^\$2[aby]\$/.test(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
}

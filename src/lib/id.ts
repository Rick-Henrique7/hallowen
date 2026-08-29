import { customAlphabet } from "nanoid";

/**
 * Cryptographically-secure session token. 32 chars from a 62-char
 * alphabet = 190 bits of entropy. Stored as the session row PK.
 */
const TOKEN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const generateToken = customAlphabet(TOKEN_ALPHABET, 32);

export function generateSessionToken(): string {
  return generateToken();
}

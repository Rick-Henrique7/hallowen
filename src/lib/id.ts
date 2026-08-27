import { customAlphabet } from "nanoid";

/**
 * Short, URL-safe, human-friendly slug for invite ids.
 * Excludes visually ambiguous characters (0/O, 1/I/L).
 * 6 chars from a 30-char alphabet = 30^6 = 729M combinations.
 * Brute-forcing an invite id is impractical, and invites are not
 * security-sensitive anyway (the name is in the URL).
 */
const INVITE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const generateSlug = customAlphabet(INVITE_ALPHABET, 6);

/**
 * Cryptographically-secure session token. 32 chars from a 62-char
 * alphabet = 190 bits of entropy. Stored as the session row PK.
 */
const TOKEN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const generateToken = customAlphabet(TOKEN_ALPHABET, 32);

export function generateInviteId(): string {
  return generateSlug();
}

export function generateSessionToken(): string {
  return generateToken();
}

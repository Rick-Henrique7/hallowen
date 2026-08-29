import { getCookie, setCookie, deleteCookie } from "@tanstack/start-server-core/request-response";

const COOKIE_NAME = "halloween-card-session";
const THIRTY_DAYS_S = 30 * 24 * 60 * 60;

const baseOptions = {
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: THIRTY_DAYS_S,
};

export function getSessionCookie(): string | null {
  return getCookie(COOKIE_NAME) ?? null;
}

export function setSessionCookie(token: string): void {
  setCookie(COOKIE_NAME, token, baseOptions);
}

export function clearSessionCookie(): void {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

"use server";

import {
  getClientIp,
  normalizeEmail,
  requestLoginLink,
} from "@/lib/auth";
import { verifyTurnstile } from "@/lib/turnstile";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

export async function requestLogin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!email) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const ip = await getClientIp();
  const captcha = String(formData.get("cf-turnstile-response") ?? "") || null;
  if (!(await verifyTurnstile(captcha, ip))) {
    return {
      status: "error",
      message: "Please complete the human check and try again.",
    };
  }

  try {
    const result = await requestLoginLink(email, ip);
    if (result === "rate_limited") {
      return {
        status: "error",
        message: "Too many requests. Please wait a few minutes and try again.",
      };
    }
  } catch (error) {
    console.error("login link failed", error);
    return {
      status: "error",
      message: "We couldn't send the email. Please try again later.",
    };
  }

  // Same response whether or not the address already has an account.
  return { status: "sent" };
}

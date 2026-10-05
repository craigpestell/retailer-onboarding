"use server";

import { redirect } from "next/navigation";
import { consumeLoginToken } from "@/lib/auth";

export async function confirmLogin(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const ok = token ? await consumeLoginToken(token) : false;
  redirect(ok ? "/" : "/login?error=expired");
}

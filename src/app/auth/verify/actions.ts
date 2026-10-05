"use server";

import { consumeLoginToken } from "@/lib/auth";

export async function confirmLogin(formData: FormData): Promise<boolean> {
  const token = String(formData.get("token") ?? "");
  return token ? await consumeLoginToken(token) : false;
}

"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { checklistEvents } from "@/db/schema";
import { getSessionUser, isAdmin } from "@/lib/auth";

/** Deletes every checklist event. Admin only, and only with the confirm box ticked. */
export async function purgeEvents(formData: FormData) {
  if (!isAdmin(await getSessionUser())) redirect("/");
  if (formData.get("confirm") !== "yes") redirect("/admin");

  await getDb().delete(checklistEvents);
  redirect("/admin?purged=1");
}

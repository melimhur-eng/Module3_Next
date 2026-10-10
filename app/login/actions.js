"use server";

import { redirect } from "next/navigation";
import { checkCredentials } from "@/lib/users";
import { createSession, destroySession } from "@/lib/session";
import { safeNext } from "@/lib/safeNext";

// Plain form actions, so signing in and out work even with JavaScript off.
export async function signIn(formData) {
  const phone = String(formData.get("phone") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  const user = checkCredentials(phone, password);
  if (!user) {
    // the same message whether the phone or the password was wrong
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  await createSession(user);
  redirect(next);
}

export async function signOut() {
  await destroySession();
  redirect("/");
}

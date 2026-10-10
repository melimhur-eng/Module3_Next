"use server";

import { redirect } from "next/navigation";
import { clearUser, setUser } from "@/lib/session";

// Only ever send people back to a page on this site ("/checkout"),
// never to "//evil.example" or "https://…".
function safeNext(next) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

// A pretend sign-in: just a name. It is a plain form action, so it works
// even with JavaScript turned off.
export async function signIn(formData) {
  const name = String(formData.get("name") ?? "").trim();
  const next = safeNext(formData.get("next"));

  if (name.length < 2) {
    redirect(`/login?error=name&next=${encodeURIComponent(next)}`);
  }

  await setUser(name);
  redirect(next);
}

export async function signOut() {
  await clearUser();
  redirect("/");
}

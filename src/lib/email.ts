export async function sendLoginEmail(to: string, link: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    console.log(`\n[dev] Sign-in link for ${to}:\n${link}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Start Your Store <onboarding@resend.dev>",
      to,
      subject: "Your sign-in link",
      text: `Use this link to sign in to Start Your Store. It works once and expires in 15 minutes.\n\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status}`);
}

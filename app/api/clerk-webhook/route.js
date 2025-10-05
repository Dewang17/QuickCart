import { inngest } from "@/config/inngest";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env");
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", { status: 400 });
  }

  // Clerk requires raw body for signature verification
  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return new Response("Invalid signature", { status: 400 });
  }

  // Forward to Inngest
  await inngest.send({
    name: `clerk/${evt.type}`, // e.g. clerk/user.created
    data: evt.data,
  });

  console.log("✅ Clerk event forwarded to Inngest:", evt.type);

  return new Response("Webhook received", { status: 200 });
}

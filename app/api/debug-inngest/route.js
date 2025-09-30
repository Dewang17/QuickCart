export async function GET() {
  return Response.json({
    has_signing_key: !!process.env.INNGEST_SIGNING_KEY,
    has_event_key: !!process.env.INNGEST_EVENT_KEY,
    signing_key_prefix: process.env.INNGEST_SIGNING_KEY?.substring(0, 20),
    event_key_prefix: process.env.INNGEST_EVENT_KEY?.substring(0, 20),
  });
}

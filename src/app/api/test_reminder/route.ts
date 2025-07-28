import { api } from "@/../convex/_generated/api";
import { fetchAction } from "convex/nextjs";

export async function GET() {
  await fetchAction(api.reminder.runManualReminder, {});
  return new Response("✅ Manual Reminder dijalankan!", { status: 200 });
}

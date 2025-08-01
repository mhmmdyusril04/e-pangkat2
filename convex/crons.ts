import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// if (process.env.NODE_ENV === 'production') {
crons.daily(
  "check_promotion_reminders_daily",
  { hourUTC: 4, minuteUTC: 20 }, // Jam 09:00 WIB
  internal.reminder.checkAndSendPromotionReminders
);
// } else {
// crons.interval('check_promotion_reminders_for_dev', { minutes: 1 }, internal.reminder.checkAndSendPromotionReminders);
// }

export default crons;

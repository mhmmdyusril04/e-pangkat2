import { v } from "convex/values";
import { action } from "./_generated/server";
import { createClerkClient } from "@clerk/backend";

export const deleteUserInClerk = action({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    await clerkClient.users.deleteUser(args.clerkUserId);
    console.log("User di Clerk terhapus:", args.clerkUserId);
  },
});

"use node";

import { v } from "convex/values";
import { App, cert, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { api } from "./_generated/api";
import { internalAction } from "./_generated/server";
import fs from "fs";

let firebaseApp: App | undefined;

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  const config = process.env.FIREBASE_ADMIN_CONFIG;
  if (!config)
    throw new Error("Environment variable FIREBASE_ADMIN_CONFIG is not set.");

  let serviceAccount;

  try {
    serviceAccount = JSON.parse(config); // coba parse langsung
  } catch {
    try {
      const decoded = Buffer.from(config, "base64").toString("utf8");
      serviceAccount = JSON.parse(decoded); // coba parse hasil decode
    } catch {
      serviceAccount = JSON.parse(fs.readFileSync(config, "utf8")); // terakhir, anggap path file
    }
  }

  firebaseApp = initializeApp({ credential: cert(serviceAccount) });
  return firebaseApp;
}

export const sendPushNotification = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { userId, title, body }) => {
    try {
      getFirebaseApp();
      const user = await ctx.runQuery(api.users.getUserById, { userId });
      if (!user || !user.fcmToken) {
        console.log(
          `User ${userId} tidak memiliki FCM token. Notifikasi dibatalkan.`
        );
        return;
      }

      const message = {
        token: user.fcmToken,
        notification: { title, body },
        android: {
          priority: "high" as const,
          notification: { sound: "default" },
        },
        apns: {
          headers: { "apns-priority": "10" },
          payload: { aps: { sound: "default" } },
        },
        webpush: {
          fcmOptions: { link: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` },
        },
      };

      await getMessaging().send(message);
      console.log(`Notifikasi berhasil dikirim ke user ${userId}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Gagal mengirim notifikasi:", error.message, error.stack);
      } else {
        console.error("Gagal mengirim notifikasi:", error);
      }
    }
  },
});

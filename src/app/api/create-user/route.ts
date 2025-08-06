import { NextResponse } from "next/server";
import clerkClient from "@clerk/clerk-sdk-node";

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password, name, role } = body;

  // Validasi input
  if (!username || !password || !name || !role) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ");

    // 🔐 Buat user di Clerk
    const user = await clerkClient.users.createUser({
      username,
      password,
      firstName,
      lastName,
      publicMetadata: { role },
    });

    // ✅ Token identifier untuk Convex
    const tokenIdentifier = `clerk|${user.id}`;

    // 🧠 Kirim ke fungsi internal Convex
    await fetch(
      `${process.env.NEXT_PUBLIC_CONVEX_URL}/functions/internal/users:createUser`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CONVEX_DEPLOY_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenIdentifier,
          name,
          image: user.imageUrl,
          role,
          nip: "", // Kosong dulu, bisa diisi nanti
        }),
      }
    );

    return NextResponse.json({ success: true, userId: user.id });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("🔥 Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

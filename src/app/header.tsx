"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="relative z-10 bg-gradient-to-r from-[#0D1B2A] to-[#1B263B] border-b border-blue-900 px-4 py-4 shadow">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-3 text-white text-xl font-semibold"
        >
          <Image
            src="/logo.jpg"
            width={40}
            height={40}
            alt="ePangkat logo"
            className="rounded-full"
          />
          <span>Sistem ePangkat</span>
        </Link>

        <div className="flex items-center gap-3">
          <UserButton />
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                variant="outline"
                className="text-white bg-black border-white hover:bg-white hover:text-black"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

"use client";

import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import type { Session } from "next-auth";

interface AuthButtonProps {
  session: Session | null;
}

export default function AuthButton({ session }: AuthButtonProps) {
  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "User"}
            width={28}
            height={28}
            className="rounded-full"
          />
        )}
        <button
          onClick={() => signOut()}
          className="text-sm hover:text-scout-light transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="bg-white text-scout-dark px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-scout-light hover:text-white transition-colors"
    >
      Sign In
    </button>
  );
}

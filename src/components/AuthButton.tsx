"use client";

import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";

interface AuthButtonProps {
  session: Session | null;
}

export default function AuthButton({ session }: AuthButtonProps) {
  if (session?.user) {
    const fallbackLabel = (session.user.name ?? "U").charAt(0).toUpperCase();

    return (
      <div className="flex items-center gap-3">
        <Link href="/profile" aria-label="Go to profile" className="block">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <span className="h-7 w-7 rounded-full bg-white/20 text-xs font-semibold text-white grid place-items-center">
              {fallbackLabel}
            </span>
          )}
        </Link>
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
      Sign In with Google
    </button>
  );
}

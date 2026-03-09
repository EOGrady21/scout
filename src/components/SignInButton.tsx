"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/submit" })}
      className="inline-block bg-[#0b6038] text-white px-6 py-2 rounded hover:bg-[#094d2c] transition-colors font-medium"
    >
      Sign in with Google
    </button>
  );
}

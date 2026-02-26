import Link from "next/link";
import { auth } from "@/lib/auth";
import AuthButton from "./AuthButton";

export default async function Header() {
  const session = await auth();

  return (
    <header className="bg-scout-dark text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🏕️ Scout
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-scout-light transition-colors">
            Map
          </Link>
          {session ? (
            <>
              <Link
                href="/submit"
                className="hover:text-scout-light transition-colors"
              >
                Submit Location
              </Link>
              <Link
                href="/profile"
                className="hover:text-scout-light transition-colors"
              >
                Profile
              </Link>
            </>
          ) : null}
          <AuthButton session={session} />
        </nav>
      </div>
    </header>
  );
}

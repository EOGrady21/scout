import Link from "next/link";
import { auth } from "@/lib/auth";
import AuthButton from "./AuthButton";

export default async function Header() {
  const session = await auth();

  return (
    <header className="bg-scout-dark text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🏕️ SCOUT
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-scout-light transition-colors">
            Home
          </Link>
          <AuthButton session={session} />
        </nav>
      </div>
    </header>
  );
}

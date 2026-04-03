import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import AuthButton from "./AuthButton";

export default async function Header() {
  const session = await auth();

  return (
  
  <header className="bg-white text-white shadow-sm h-14 flex items-center justify-between px-20">
    <Link href="/">
    <Image src="/badges/logoBlack.svg" alt="SCOUT" width={140} height={48} className="h-12 w-auto" />
    </Link>

  <div className="flex items-center">
         
        <nav className="flex items-center gap-6 text-sm text-black"> 

          <Link href="/" className="hover:text-scout-light transition-colors">
            Home
          </Link>
          <AuthButton session={session} />
        </nav>

      </div>
    </header>
    
  );
}
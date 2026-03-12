import Link from "next/link";
import { auth } from "@/lib/auth";
import AuthButton from "./AuthButton";

export default async function Header() {
  const session = await auth();

  return (
    // <header className="bg-scout-white text-white shadow-md">
    //   <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

    // 1. positioning sign in button
    // <header className="bg-white text-white shadow-sm h-14 flex items-center">
    //   <div className="flex-1 flex items-center justify-end px-28">

// again for keeping black logos header

<header className="bg-white text-white shadow-sm h-14 flex items-center justify-between px-20">
  <a href="/"><img src="/badges/logoBlack.svg" alt="SCOUT" className="h-12 w-auto" /></a>
  <div className="flex items-center">



        
        {/* 2. Replacing Logo */}
        {/* <Link href="/" className="flex flex-col items-start gap-1 p-2 -ml-28">
         <img src="/badges/logoWhite.svg" alt="SCOUT" className="h-14 w-44" />
         </Link> */}

         
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
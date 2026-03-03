import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Scout – Discover & Share Outdoor Conditions",
  description:
    "Community-driven platform for discovering and sharing outdoor location conditions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-gray-50 min-h-screen" suppressHydrationWarning>
        <SessionProvider>
          <Header />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}

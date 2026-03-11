import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Scout – Discover & Share Outdoor Conditions",
  description:
    "Community-driven platform for discovering and sharing outdoor location conditions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-gray-50 min-h-screen" suppressHydrationWarning>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

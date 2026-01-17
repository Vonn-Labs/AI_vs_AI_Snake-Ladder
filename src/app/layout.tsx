import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI vs AI Snake & Ladder",
  description: "Watch AI language models battle it out in the classic game of Snake and Ladder!",
  keywords: ["AI", "Snake and Ladder", "GPT", "Claude", "Gemini", "Game", "Artificial Intelligence"],
  authors: [{ name: "AI Snake & Ladder" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <div className="min-h-screen bg-[var(--background)]">
          {children}
        </div>
      </body>
    </html>
  );
}

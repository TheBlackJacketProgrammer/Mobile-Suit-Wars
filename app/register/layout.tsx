import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ToastHost from "@/components/ToastHost";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mobile Suit Wars - Register",
  description: "Register for a new account",
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} >
        <body className="min-h-full flex flex-col">
            {children}
            <ToastHost />
        </body>
    </html>
  );
}

import type { Metadata } from "next";
import MainNavbar from "@/components/MainNavbar";

export const metadata: Metadata = {
  title: "Mobile Suit Wars - MS Core",
  description: "MS Management System Admin",
};

export default function MSCoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MainNavbar />
      <main className="admin-container">{children}</main>
    </>
  );
}

import type { Metadata } from "next";
import BackgroundMusic from "@/components/BackgroundMusic";
import MainNavbar from "@/components/MainNavbar";

export const metadata: Metadata = {
  title: "Mobile Suit Wars - Dashboard",
  description: "Dashboard for the Mobile Suit Wars",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <BackgroundMusic src="/sounds/bgm-dashboard.wav" />
      <MainNavbar />
      <main>{children}</main>
    </>
  );
}

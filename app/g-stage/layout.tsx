import type { Metadata } from "next";
import MainNavbar from "@/components/MainNavbar";

export const metadata: Metadata = {
  title: "Mobile Suit Wars - G-Stages",
  description: "Explore the G-Stages in Mobile Suit Wars, where you can test your skills and strategies against various challenges. Each G-Stage offers unique scenarios and rewards, providing an exciting experience for all players.",
};

export default function GStageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MainNavbar />
      <main>{children}</main>
    </>
  );
}

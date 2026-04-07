import type { Metadata } from "next";
import BackgroundMusic from "@/components/BackgroundMusic";
import MainNavbar from "@/components/MainNavbar";
import ModalChangeUnit from "./ModalChangeUnit";
export const metadata: Metadata = {
  title: "Mobile Suit Wars - Hanger",
  description: "Hanger for the Mobile Suit Wars",
};

export default function HangerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <>
      <BackgroundMusic src="/sounds/bgm-hanger.mp3" />
      <MainNavbar />
      <main className="dashboard-container">{children}</main>
      <ModalChangeUnit />
    </>
  );
}

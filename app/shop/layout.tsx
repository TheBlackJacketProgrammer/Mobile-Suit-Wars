import type { Metadata } from "next";
import BackgroundMusic from "@/components/BackgroundMusic";
import MainNavbar from "@/components/MainNavbar";

export const metadata: Metadata = {
  title: "Mobile Suit Wars - Shop",
  description: "Shop for the Mobile Suit Wars",
};

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <BackgroundMusic src="/sounds/bgm-shop.mp3" />
      <MainNavbar />
      <main className="main-shop-container">{children}</main>
    </>
  );
}

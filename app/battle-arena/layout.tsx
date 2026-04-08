import type { Metadata } from "next";
import BackgroundMusic from "@/components/BackgroundMusic";
import MainNavbar from "@/components/MainNavbar";

export const metadata: Metadata = {
  title: "Mobile Suit Wars - Battle Arena",
  description: "Battle Arena for the Mobile Suit Wars",
};

export default function BattleArenaLayout({children,}: Readonly<{children: React.ReactNode;}>) {
    return (
        <>
            <BackgroundMusic src="/sounds/bgm-dashboard.wav" />
            <MainNavbar />
            <main className="battle-arena-container">
                {children}
            </main>
        </>
    );
}

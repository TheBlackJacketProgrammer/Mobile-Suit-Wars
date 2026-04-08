import type { Metadata } from "next";
import BattleArenaShell from "./BattleArenaShell";

export const metadata: Metadata = {
  title: "Mobile Suit Wars - Battle Arena",
  description: "Battle Arena for the Mobile Suit Wars",
};

export default function BattleArenaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <BattleArenaShell>{children}</BattleArenaShell>;
}
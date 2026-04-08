"use client";

import { useCallback, useRef, type ReactNode } from "react";
import BackgroundMusic, {
  type ExternalBgmControls,
} from "@/components/BackgroundMusic";
import MainNavbar from "@/components/MainNavbar";
import { BattleArenaBgmContext } from "./battleArenaBgmContext";

export default function BattleArenaShell({
  children,
}: Readonly<{ children: ReactNode }>) {
  const bgmControlsRef = useRef<ExternalBgmControls | null>(null);
  const registerBgm = useCallback((api: ExternalBgmControls | null) => {
    bgmControlsRef.current = api;
  }, []);

  return (
    <BattleArenaBgmContext.Provider value={bgmControlsRef}>
      <BackgroundMusic
        src="/sounds/bgm-battle-arena.wav"
        registerExternalControls={registerBgm}
      />
      <MainNavbar />
      <main className="battle-arena-container">{children}</main>
    </BattleArenaBgmContext.Provider>
  );
}

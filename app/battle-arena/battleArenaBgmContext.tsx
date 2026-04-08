"use client";

import { createContext, useContext, type RefObject } from "react";
import type { ExternalBgmControls } from "@/components/BackgroundMusic";

export const BattleArenaBgmContext =
  createContext<RefObject<ExternalBgmControls | null> | null>(null);

export function useBattleArenaBgmControlsRef() {
  return useContext(BattleArenaBgmContext);
}

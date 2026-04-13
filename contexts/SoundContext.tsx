"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type SoundContextType = {
  isMuted: boolean;
  toggleMute: () => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load mute state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("soundMuted");
    setIsMuted(saved === "true");
    setMounted(true);
  }, []);

  // Save to localStorage when mute state changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("soundMuted", isMuted.toString());
    }
  }, [isMuted, mounted]);

  // Sync mute state to global state (for non-component code like playSound)
  useEffect(() => {
    setGlobalMuteState(isMuted);
  }, [isMuted]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSoundContext must be used within SoundProvider");
  }
  return context;
}

// Hook for checking mute state (for non-component code)
let globalMuteState = false;

export function setGlobalMuteState(muted: boolean) {
  globalMuteState = muted;
}

export function getGlobalMuteState(): boolean {
  return globalMuteState;
}

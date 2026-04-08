"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import { getActionLabel, getDamageForAction } from "./battleDamage";
import HPBar from "./components/HPBar";
import MSTabs from "./components/MSTabs";
import MSTabContents from "./components/MSTabContents";
import {
  advanceAllUnitCharges,
  canUseAction,
  consumeCharge,
  createInitialAttackCharges,
} from "./battleAttackCharges";
import { runEnemyCounterAttack } from "./enemyTurn";
import type { MSActionHover, TabType } from "./types";
import type { mobile_suits } from "../generated/prisma/client";
import { refreshBattleEnemies } from "../actions/refreshBattleEnemies";
import type { BattleLogEntry, BattleLogPart } from "./battleLog";
import { buildAttackLogLine, resolveAttackOutcome } from "./battleCritEvade";
import { useBattleArenaBgmControlsRef } from "./battleArenaBgmContext";

type Props = {
  lineup: MSLineUpUnit[];
  enemyMS: mobile_suits[];
};

type PendingPlayerAttack = {
  unitIndex: number;
  action: MSActionHover;
};

function tabToIndex(tab: TabType): number {
  if (tab === "MS1") return 0;
  if (tab === "MS2") return 1;
  return 2;
}

function indexToTab(i: number): TabType {
  if (i === 0) return "MS1";
  if (i === 1) return "MS2";
  return "MS3";
}

/** If the active tab points at a destroyed unit, move to the first living slot. */
function pickTabIfAlive(tab: TabType, playerHpAfter: number[]): TabType {
  const idx = tabToIndex(tab);
  if (playerHpAfter[idx]! > 0) return tab;
  const first = playerHpAfter.findIndex((hp) => hp > 0);
  return first >= 0 ? indexToTab(first) : tab;
}

type LastTwoActors = [number | null, number | null];

/** Slots that cannot act this player turn (resting / regrouping). */
function getBenchBannedSlots(
  lastTwo: LastTwoActors,
  playerHP: number[],
): Set<number> {
  const aliveCount = playerHP.filter((hp) => hp > 0).length;
  if (aliveCount <= 1) return new Set();

  if (aliveCount === 2) {
    const last = lastTwo[1];
    if (last != null && playerHP[last]! > 0) return new Set([last]);
    return new Set();
  }

  const banned = new Set<number>();
  for (const i of lastTwo) {
    if (i != null && playerHP[i]! > 0) banned.add(i);
  }
  return banned;
}

/** If the active tab is benched, switch to a living unit that may act. */
function pickTabAfterBenched(
  tab: TabType,
  banned: Set<number>,
  playerHpAfter: number[],
): TabType {
  const tabOnLiving = pickTabIfAlive(tab, playerHpAfter);
  const idx = tabToIndex(tabOnLiving);
  const available = playerHpAfter
    .map((hp, i) => (hp > 0 && !banned.has(i) ? i : -1))
    .filter((i) => i >= 0);
  if (available.length === 0) return tabOnLiving;
  if (!banned.has(idx) && playerHpAfter[idx]! > 0) return tabOnLiving;
  return indexToTab(available[0]!);
}

/** Pause after your hit so the enemy explosion reads clearly before the counterattack. */
const ENEMY_COUNTER_DELAY_MS = 900;

/** Keep destroyed units visible (grayed) this long before removing them from the arena. */
const DESTROYED_UNIT_UI_REMOVE_MS = 1400;

const EVADE_FLASH_MS = 900;

/** After win/lose UI updates, wait before playing stinger (BGM is paused immediately). */
const OUTCOME_STINGER_DELAY_MS = 550;

const BOOM_SFX_SRC = "/sounds/bgm-boom.wav";
const WINNER_SFX_SRC = "/sounds/bgm-winner.wav";
const LOSE_SFX_SRC = "/sounds/bgm-lose.wav";

const INITIAL_LOG_LINES = [
  "Battle start — your side moves first. Choose an action, then tap an enemy unit.",
  "With three active units, the last two suits to attack rest next turn (strict rotation). With two left, only the most recent attacker rests.",
];

const NEW_ENEMY_SQUAD_LOG = "New enemy squad deployed.";

function ActionLogLine({ entry }: { entry: BattleLogEntry }) {
  if (typeof entry === "string") {
    return <p className="m-0 mb-1 last:mb-0 leading-snug text-3-dark">{entry}</p>;
  }
  return (
    <p className="m-0 mb-1 last:mb-0 leading-snug text-3-dark">
      {entry.map((part: BattleLogPart, i: number) =>
        part.bold ? (
          <strong key={i} className="font-bold">
            {part.text}
          </strong>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}

export default function BattleArenaClient({ lineup, enemyMS }: Props) {
  const bgmControlsRef = useBattleArenaBgmControlsRef();
  const [liveEnemyMS, setLiveEnemyMS] = useState<mobile_suits[]>(enemyMS);
  /** Shown until the player picks an attack/skill; reset on a new battle. */
  const [showBattleStartHeading, setShowBattleStartHeading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("MS1");
  const [playerHP, setPlayerHP] = useState<number[]>(() =>
    lineup.map((unit) => unit.armor),
  );
  const [enemyHP, setEnemyHP] = useState<number[]>(() =>
    enemyMS.map((unit) => unit.ms_armor),
  );
  const [playerCharges, setPlayerCharges] = useState(() =>
    lineup.map(() => createInitialAttackCharges()),
  );
  const [enemyCharges, setEnemyCharges] = useState(() =>
    enemyMS.map(() => createInitialAttackCharges()),
  );
  const [endBattleBusy, setEndBattleBusy] = useState(false);
  const [pendingAttack, setPendingAttack] = useState<PendingPlayerAttack | null>(
    null,
  );
  const [battleOutcome, setBattleOutcome] = useState<"win" | "lose" | null>(
    null,
  );
  const [logLines, setLogLines] = useState<BattleLogEntry[]>(() => [
    ...INITIAL_LOG_LINES,
  ]);
  const [playerHitFlashIndex, setPlayerHitFlashIndex] = useState<number | null>(
    null,
  );
  const [enemyHitFlashIndex, setEnemyHitFlashIndex] = useState<number | null>(
    null,
  );
  const [playerEvadeFlashIndex, setPlayerEvadeFlashIndex] = useState<
    number | null
  >(null);
  const [enemyEvadeFlashIndex, setEnemyEvadeFlashIndex] = useState<
    number | null
  >(null);
  const [isEnemyTurnPending, setIsEnemyTurnPending] = useState(false);
  /** Rolling last two attackers; both rest next turn when all three units are alive. */
  const [lastTwoActors, setLastTwoActors] = useState<LastTwoActors>([
    null,
    null,
  ]);
  /** Slot hidden from arena UI after destroy delay (HP may still be 0 until battle reset). */
  const [playerUiRemovedSlots, setPlayerUiRemovedSlots] = useState(
    () => new Set<number>(),
  );
  const [enemyUiRemovedSlots, setEnemyUiRemovedSlots] = useState(
    () => new Set<number>(),
  );
  const prevPlayerHPRef = useRef<number[]>(lineup.map((u) => u.armor));
  const prevEnemyHPRef = useRef<number[]>(enemyMS.map((u) => u.ms_armor));
  const playerDestroyUiTimersRef = useRef<
    Map<number, ReturnType<typeof setTimeout>>
  >(new Map());
  const enemyDestroyUiTimersRef = useRef<
    Map<number, ReturnType<typeof setTimeout>>
  >(new Map());
  const hitFlashClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerEvadeClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const enemyEvadeClearRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const enemyCounterDelayRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const boomAudioRef = useRef<HTMLAudioElement | null>(null);
  const winnerAudioRef = useRef<HTMLAudioElement | null>(null);
  const loseAudioRef = useRef<HTMLAudioElement | null>(null);
  const outcomeStingerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionLogsScrollRef = useRef<HTMLDivElement | null>(null);

  function clearOutcomeStinger() {
    if (outcomeStingerRef.current != null) {
      clearTimeout(outcomeStingerRef.current);
      outcomeStingerRef.current = null;
    }
  }

  function stopOutcomeStingers() {
    const w = winnerAudioRef.current;
    const l = loseAudioRef.current;
    if (w) {
      w.pause();
      w.currentTime = 0;
    }
    if (l) {
      l.pause();
      l.currentTime = 0;
    }
  }

  function pauseBattleBgm() {
    bgmControlsRef?.current?.pause();
  }

  function restartBattleBgm() {
    bgmControlsRef?.current?.restartFromBeginning();
  }

  useEffect(() => {
    const boom = new Audio(BOOM_SFX_SRC);
    const winner = new Audio(WINNER_SFX_SRC);
    const lose = new Audio(LOSE_SFX_SRC);
    boomAudioRef.current = boom;
    winnerAudioRef.current = winner;
    loseAudioRef.current = lose;
    const playerDestroyTimersMap = playerDestroyUiTimersRef.current;
    const enemyDestroyTimersMap = enemyDestroyUiTimersRef.current;
    return () => {
      boom.pause();
      winner.pause();
      lose.pause();
      boomAudioRef.current = null;
      winnerAudioRef.current = null;
      loseAudioRef.current = null;
      if (hitFlashClearRef.current != null) {
        clearTimeout(hitFlashClearRef.current);
      }
      if (enemyCounterDelayRef.current != null) {
        clearTimeout(enemyCounterDelayRef.current);
      }
      if (playerEvadeClearRef.current != null) {
        clearTimeout(playerEvadeClearRef.current);
      }
      if (enemyEvadeClearRef.current != null) {
        clearTimeout(enemyEvadeClearRef.current);
      }
      clearOutcomeStinger();
      for (const t of playerDestroyTimersMap.values()) {
        clearTimeout(t);
      }
      playerDestroyTimersMap.clear();
      for (const t of enemyDestroyTimersMap.values()) {
        clearTimeout(t);
      }
      enemyDestroyTimersMap.clear();
    };
  }, []);

  useEffect(() => {
    return () => clearOutcomeStinger();
  }, []);

  useEffect(() => {
    const prev = prevPlayerHPRef.current;
    for (let i = 0; i < playerHP.length; i++) {
      if (prev[i]! > 0 && playerHP[i]! <= 0) {
        const existing = playerDestroyUiTimersRef.current.get(i);
        if (existing) clearTimeout(existing);
        const t = setTimeout(() => {
          setPlayerUiRemovedSlots((s) => {
            const next = new Set(s);
            next.add(i);
            return next;
          });
          playerDestroyUiTimersRef.current.delete(i);
        }, DESTROYED_UNIT_UI_REMOVE_MS);
        playerDestroyUiTimersRef.current.set(i, t);
      }
      if (playerHP[i]! > 0) {
        const existing = playerDestroyUiTimersRef.current.get(i);
        if (existing) {
          clearTimeout(existing);
          playerDestroyUiTimersRef.current.delete(i);
        }
        setPlayerUiRemovedSlots((s) => {
          if (!s.has(i)) return s;
          const next = new Set(s);
          next.delete(i);
          return next;
        });
      }
    }
    prevPlayerHPRef.current = [...playerHP];
  }, [playerHP]);

  useEffect(() => {
    const prev = prevEnemyHPRef.current;
    for (let i = 0; i < enemyHP.length; i++) {
      if (prev[i]! > 0 && enemyHP[i]! <= 0) {
        const existing = enemyDestroyUiTimersRef.current.get(i);
        if (existing) clearTimeout(existing);
        const t = setTimeout(() => {
          setEnemyUiRemovedSlots((s) => {
            const next = new Set(s);
            next.add(i);
            return next;
          });
          enemyDestroyUiTimersRef.current.delete(i);
        }, DESTROYED_UNIT_UI_REMOVE_MS);
        enemyDestroyUiTimersRef.current.set(i, t);
      }
      if (enemyHP[i]! > 0) {
        const existing = enemyDestroyUiTimersRef.current.get(i);
        if (existing) {
          clearTimeout(existing);
          enemyDestroyUiTimersRef.current.delete(i);
        }
        setEnemyUiRemovedSlots((s) => {
          if (!s.has(i)) return s;
          const next = new Set(s);
          next.delete(i);
          return next;
        });
      }
    }
    prevEnemyHPRef.current = [...enemyHP];
  }, [enemyHP]);

  useEffect(() => {
    if (battleOutcome !== null) return;
    const idx = tabToIndex(activeTab);
    if (playerHP[idx]! > 0) return;
    const first = playerHP.findIndex((h) => h > 0);
    if (first >= 0) setActiveTab(indexToTab(first));
  }, [playerHP, activeTab, battleOutcome]);

  useLayoutEffect(() => {
    const el = actionLogsScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logLines]);

  function flashEnemyEvade(index: number) {
    if (enemyEvadeClearRef.current != null) {
      clearTimeout(enemyEvadeClearRef.current);
    }
    setEnemyEvadeFlashIndex(index);
    enemyEvadeClearRef.current = setTimeout(() => {
      setEnemyEvadeFlashIndex(null);
      enemyEvadeClearRef.current = null;
    }, EVADE_FLASH_MS);
  }

  function flashPlayerEvade(index: number) {
    if (playerEvadeClearRef.current != null) {
      clearTimeout(playerEvadeClearRef.current);
    }
    setPlayerEvadeFlashIndex(index);
    playerEvadeClearRef.current = setTimeout(() => {
      setPlayerEvadeFlashIndex(null);
      playerEvadeClearRef.current = null;
    }, EVADE_FLASH_MS);
  }

  function playBoomSound() {
    const audio = boomAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      /* ignore: autoplay restrictions or missing file */
    });
  }

  function playWinnerSound() {
    const audio = winnerAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  function playLoseSound() {
    const audio = loseAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  function scheduleOutcomeStinger(kind: "win" | "lose") {
    clearOutcomeStinger();
    outcomeStingerRef.current = setTimeout(() => {
      outcomeStingerRef.current = null;
      if (kind === "win") {
        playWinnerSound();
      } else {
        playLoseSound();
      }
    }, OUTCOME_STINGER_DELAY_MS);
  }

  async function handleEndBattle() {
    if (endBattleBusy) return;

    clearOutcomeStinger();
    stopOutcomeStingers();

    if (hitFlashClearRef.current != null) {
      clearTimeout(hitFlashClearRef.current);
      hitFlashClearRef.current = null;
    }
    if (enemyCounterDelayRef.current != null) {
      clearTimeout(enemyCounterDelayRef.current);
      enemyCounterDelayRef.current = null;
    }
    if (playerEvadeClearRef.current != null) {
      clearTimeout(playerEvadeClearRef.current);
      playerEvadeClearRef.current = null;
    }
    if (enemyEvadeClearRef.current != null) {
      clearTimeout(enemyEvadeClearRef.current);
      enemyEvadeClearRef.current = null;
    }
    for (const t of playerDestroyUiTimersRef.current.values()) {
      clearTimeout(t);
    }
    playerDestroyUiTimersRef.current.clear();
    for (const t of enemyDestroyUiTimersRef.current.values()) {
      clearTimeout(t);
    }
    enemyDestroyUiTimersRef.current.clear();

    setEndBattleBusy(true);
    try {
      const nextEnemies = await refreshBattleEnemies();
      setLiveEnemyMS(nextEnemies);
      setEnemyHP(nextEnemies.map((unit) => unit.ms_armor));
      setActiveTab("MS1");
      setPlayerHP(lineup.map((unit) => unit.armor));
      setPlayerCharges(lineup.map(() => createInitialAttackCharges()));
      setEnemyCharges(nextEnemies.map(() => createInitialAttackCharges()));
      setPendingAttack(null);
      setBattleOutcome(null);
      setLogLines([...INITIAL_LOG_LINES, NEW_ENEMY_SQUAD_LOG]);
      setPlayerHitFlashIndex(null);
      setEnemyHitFlashIndex(null);
      setPlayerEvadeFlashIndex(null);
      setEnemyEvadeFlashIndex(null);
      setIsEnemyTurnPending(false);
      setLastTwoActors([null, null]);
      setPlayerUiRemovedSlots(new Set());
      setEnemyUiRemovedSlots(new Set());
      prevPlayerHPRef.current = lineup.map((unit) => unit.armor);
      prevEnemyHPRef.current = nextEnemies.map((unit) => unit.ms_armor);
      restartBattleBgm();
      setShowBattleStartHeading(true);
    } catch {
      setLogLines((prev) => [
        ...prev,
        "Could not load new enemies. Please try again.",
      ]);
    } finally {
      setEndBattleBusy(false);
    }
  }

  const maxPlayerHP = useMemo(
    () => lineup.map((unit) => unit.armor),
    [lineup],
  );
  const maxEnemyHP = useMemo(
    () => liveEnemyMS.map((unit) => unit.ms_armor),
    [liveEnemyMS],
  );

  const lineupNames = lineup.map((unit) => unit.name);
  const lineupPics = lineup.map((unit) => unit.pic);
  const enemyNames = liveEnemyMS.map((unit) => unit.ms_name);
  const enemyPics = liveEnemyMS.map((unit) => unit.ms_pic);

  const benchBannedTabIndices = useMemo(
    () =>
      [...getBenchBannedSlots(lastTwoActors, playerHP)].sort((a, b) => a - b),
    [lastTwoActors, playerHP],
  );
  const benchBannedSet = useMemo(
    () => new Set(benchBannedTabIndices),
    [benchBannedTabIndices],
  );

  const activeUnitIndex = tabToIndex(activeTab);
  const activeUnitIsBenched = benchBannedSet.has(activeUnitIndex);
  const actionsDisabled =
    battleOutcome !== null ||
    playerHP[activeUnitIndex]! <= 0 ||
    pendingAttack !== null ||
    isEnemyTurnPending ||
    activeUnitIsBenched;

  function handleSelectAction(action: MSActionHover) {
    if (battleOutcome !== null) return;
    if (isEnemyTurnPending) return;
    const idx = tabToIndex(activeTab);
    if (playerHP[idx]! <= 0) return;
    if (pendingAttack !== null) return;
    if (benchBannedSet.has(idx)) return;
    const ch = playerCharges[idx];
    if (!ch || !canUseAction(ch, action)) return;
    setPendingAttack({ unitIndex: idx, action });
    setShowBattleStartHeading(false);
  }

  function handleEnemyClick(enemyIndex: number) {
    if (pendingAttack === null || battleOutcome !== null) return;
    if (isEnemyTurnPending) return;
    if (enemyHP[enemyIndex]! <= 0) return;

    const pa = pendingAttack;
    const attackerSlot = playerCharges[pa.unitIndex];
    const consumedPlayer = attackerSlot
      ? consumeCharge(attackerSlot, pa.action)
      : null;
    if (!consumedPlayer) return;

    playBoomSound();

    const unit = lineup[pa.unitIndex]!;
    const action = pa.action;
    const baseDmg = getDamageForAction(unit, action);
    const label = getActionLabel(unit, action);
    const defenderEnemy = liveEnemyMS[enemyIndex]!;
    const outcome = resolveAttackOutcome(
      baseDmg,
      unit.cost,
      defenderEnemy.ms_cost,
    );

    const nextEnemyHP = [...enemyHP];
    if (!outcome.evaded) {
      nextEnemyHP[enemyIndex] = Math.max(
        0,
        nextEnemyHP[enemyIndex]! - outcome.finalDamage,
      );
    }

    const playerAttackEntry = buildAttackLogLine(
      unit.name,
      label,
      enemyNames[enemyIndex]!,
      outcome,
    );

    const allEnemiesDown = nextEnemyHP.every((hp) => hp <= 0);

    const nextLastTwo: LastTwoActors = [lastTwoActors[1], pa.unitIndex];
    setLastTwoActors(nextLastTwo);

    setPlayerCharges((prev) => {
      const next = [...prev];
      next[pa.unitIndex] = consumedPlayer;
      return next;
    });
    setEnemyHP(nextEnemyHP);
    setLogLines((prev) => [...prev, playerAttackEntry]);
    setPendingAttack(null);

    if (allEnemiesDown) {
      setBattleOutcome("win");
      pauseBattleBgm();
      scheduleOutcomeStinger("win");
      setLogLines((prev) => [...prev, "All enemy units defeated. Victory!"]);
      return;
    }

    if (enemyCounterDelayRef.current != null) {
      clearTimeout(enemyCounterDelayRef.current);
    }

    setIsEnemyTurnPending(true);
    if (outcome.evaded) {
      flashEnemyEvade(enemyIndex);
    } else {
      setEnemyHitFlashIndex(enemyIndex);
    }

    const snapshotPlayerHP = [...playerHP];
    const snapshotEnemyHP = nextEnemyHP;
    const snapshotEnemyCharges = [...enemyCharges];

    enemyCounterDelayRef.current = setTimeout(() => {
      enemyCounterDelayRef.current = null;
      setEnemyHitFlashIndex(null);
      setEnemyEvadeFlashIndex(null);

      const counter = runEnemyCounterAttack(
        lineup,
        liveEnemyMS,
        snapshotEnemyHP,
        snapshotPlayerHP,
        snapshotEnemyCharges,
      );

      setPlayerCharges((prev) => advanceAllUnitCharges(prev));

      if (!counter) {
        setEnemyCharges((prev) => advanceAllUnitCharges(prev));
        const banned = getBenchBannedSlots(nextLastTwo, snapshotPlayerHP);
        setActiveTab((t) =>
          pickTabAfterBenched(t, banned, snapshotPlayerHP),
        );
        setIsEnemyTurnPending(false);
        return;
      }

      playBoomSound();

      setPlayerHP(counter.newPlayerHP);
      const banned = getBenchBannedSlots(nextLastTwo, counter.newPlayerHP);
      setActiveTab((t) => pickTabAfterBenched(t, banned, counter.newPlayerHP));
      setEnemyCharges(advanceAllUnitCharges(counter.nextEnemyCharges));
      setLogLines((prev) => [...prev, counter.logEntry]);

      if (counter.evaded) {
        flashPlayerEvade(counter.targetPlayerIndex);
      } else {
        if (hitFlashClearRef.current != null) {
          clearTimeout(hitFlashClearRef.current);
        }
        setPlayerHitFlashIndex(counter.targetPlayerIndex);
        hitFlashClearRef.current = setTimeout(() => {
          setPlayerHitFlashIndex(null);
          hitFlashClearRef.current = null;
        }, 900);
      }

      if (counter.newPlayerHP.every((hp) => hp <= 0)) {
        setBattleOutcome("lose");
        pauseBattleBgm();
        scheduleOutcomeStinger("lose");
        setLogLines((prev) => [...prev, "All your units were defeated."]);
      }

      setIsEnemyTurnPending(false);
    }, ENEMY_COUNTER_DELAY_MS);
  }

  return (
    <>
      <section className="battle-arena-section">
        <div className="arena-container grid grid-cols-1 lg:grid-cols-3">
          <div className="player-units">
            <h2 className="text-2xl font-bold text-center text-3-dark mb-2">
              Player Units
            </h2>
            {[0, 1, 2].map((i) => {
              const pendingDestroy =
                playerHP[i]! <= 0 && !playerUiRemovedSlots.has(i);
              if (playerHP[i]! <= 0 && playerUiRemovedSlots.has(i)) return null;
              return (
                <div key={i} className="contents">
                  <div
                    className={`image-container player-${i + 1} ${pendingDestroy ? "opacity-40 grayscale pointer-events-none" : ""} ${!pendingDestroy && benchBannedSet.has(i) ? "battle-arena-player-benched" : ""} ${playerHitFlashIndex === i ? "battle-arena-player-hit" : ""} ${playerEvadeFlashIndex === i ? "battle-arena-player-evade" : ""}`}
                    onClick={() => {
                      if (pendingDestroy) return;
                      if (benchBannedSet.has(i)) return;
                      setActiveTab(`MS${i + 1}` as TabType);
                    }}
                  >
                    <Image
                      src={lineupPics[i] ?? ""}
                      alt={lineupNames[i] ?? "Player unit"}
                      width={100}
                      height={100}
                    />
                    <div className="exploded-overlay" />
                    <div className="evaded-overlay" aria-hidden="true" />
                  </div>
                  <div className="unit-information w-[150px]">
                    <HPBar
                      currentHP={playerHP[i]!}
                      maxHP={maxPlayerHP[i]!}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="arena-info">
            {showBattleStartHeading && (
              <h2 className="text-2xl font-bold text-center text-3-dark m-0 w-full">
                Battle Start
              </h2>
            )}
            {battleOutcome === "win" && (
              <p className="text-center text-green-700 font-semibold m-0">
                Victory
              </p>
            )}
            {battleOutcome === "lose" && (
              <p className="text-center text-red-600 font-semibold m-0">
                Defeat
              </p>
            )}
            {battleOutcome === null && isEnemyTurnPending && (
              <p className="text-center text-3-dark m-0 text-sm italic">
                Enemy counterattack incoming…
              </p>
            )}
            {battleOutcome === null && !isEnemyTurnPending && pendingAttack && (
              <p className="text-center text-amber-700 font-medium m-0 text-sm">
                Select an enemy unit to attack.
              </p>
            )}
            {battleOutcome === null &&
              !isEnemyTurnPending &&
              !pendingAttack &&
              activeUnitIsBenched && (
                <p className="text-center text-amber-700 font-medium m-0 text-sm">
                  Those suits are resting — switch to a Mobile Suit that can act
                  this turn.
                </p>
              )}
            {battleOutcome === null &&
              !isEnemyTurnPending &&
              !pendingAttack &&
              !activeUnitIsBenched && (
                <p className="text-center text-3-dark m-0 text-sm">
                  Your turn: pick Basic Attack or a skill, then choose a
                  target.
                </p>
              )}
          </div>
          <div className="enemy-units">
            <h2 className="text-2xl font-bold text-center text-3-dark">
              Enemy Units
            </h2>
            {[0, 1, 2].map((i) => {
              const pendingDestroy =
                enemyHP[i]! <= 0 && !enemyUiRemovedSlots.has(i);
              if (enemyHP[i]! <= 0 && enemyUiRemovedSlots.has(i)) return null;
              return (
                <div
                  key={liveEnemyMS[i]?.ms_id ?? `enemy-slot-${i}`}
                  className="contents"
                >
                  <div
                    role={
                      pendingAttack &&
                      !isEnemyTurnPending &&
                      !pendingDestroy
                        ? "button"
                        : undefined
                    }
                    tabIndex={
                      pendingAttack && !isEnemyTurnPending && !pendingDestroy
                        ? 0
                        : undefined
                    }
                    className={`image-container enemy-${i + 1} ${pendingDestroy ? "opacity-40 grayscale pointer-events-none" : ""} ${enemyHitFlashIndex === i ? "battle-arena-enemy-hit" : ""} ${enemyEvadeFlashIndex === i ? "battle-arena-enemy-evade" : ""} ${pendingAttack && !isEnemyTurnPending && !pendingDestroy ? "cursor-pointer ring-2 ring-amber-500 ring-offset-2 rounded" : ""}`}
                    onClick={() => {
                      if (pendingDestroy || isEnemyTurnPending) return;
                      handleEnemyClick(i);
                    }}
                    onKeyDown={(e) => {
                      if (
                        (e.key === "Enter" || e.key === " ") &&
                        !isEnemyTurnPending &&
                        !pendingDestroy
                      ) {
                        e.preventDefault();
                        handleEnemyClick(i);
                      }
                    }}
                  >
                    <Image
                      src={enemyPics[i] ?? ""}
                      alt={enemyNames[i] ?? "Enemy unit"}
                      width={100}
                      height={100}
                    />
                    <div className="exploded-overlay" />
                    <div className="evaded-overlay" aria-hidden="true" />
                  </div>
                  <div className="unit-information w-[150px]">
                    <HPBar currentHP={enemyHP[i]!} maxHP={maxEnemyHP[i]!} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="arena-actions">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
            <div className="action-item col-span-1">
              <MSTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                lineupNames={lineupNames}
                playerHP={playerHP}
                benchBannedTabIndices={benchBannedTabIndices}
                uiRemovedSlotIndices={playerUiRemovedSlots}
              />
              <MSTabContents
                activeTab={activeTab}
                lineup={lineup}
                playerHP={playerHP}
                playerCharges={playerCharges}
                onSelectAction={handleSelectAction}
                actionsDisabled={actionsDisabled}
              />
            </div>
            <div className="enemy-status col-span-1">
              <h3 className="font-bold text-center text-3-dark">Enemy Status</h3>
              {[0, 1, 2].map((i) => {
                if (enemyHP[i]! <= 0 && enemyUiRemovedSlots.has(i)) return null;
                const pendingDestroy =
                  enemyHP[i]! <= 0 && !enemyUiRemovedSlots.has(i);
                return (
                  <div key={i} className="enemy-information">
                    <label
                      htmlFor={`enemy-name-${i}`}
                      className="text-sm text-3-dark"
                    >
                      Mobile Suit Name :{" "}
                      <span className="font-bold">{enemyNames[i]}</span>
                    </label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
                      <label
                        htmlFor={`enemy-armor-${i}`}
                        className="text-sm text-3-dark"
                      >
                        Armor :{" "}
                        <span className="font-bold">{enemyHP[i]}</span>
                      </label>
                      <label
                        htmlFor={`enemy-status-${i}`}
                        className="text-sm text-3-dark"
                      >
                        Status :{" "}
                        <span className="font-bold">
                          {pendingDestroy ? "Destroyed" : "Active"}
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="action-logs col-span-1">
              <h3 className="font-bold text-center text-3-dark">Action Logs</h3>
              <div
                ref={actionLogsScrollRef}
                className="action-logs-scroll text-sm text-3-dark"
                role="log"
                aria-live="polite"
              >
                {logLines.map((entry, i) => (
                  <ActionLogLine key={i} entry={entry} />
                ))}
              </div>
              <button
                type="button"
                className="btn-primary"
                disabled={endBattleBusy}
                onClick={() => {
                  void handleEndBattle();
                }}
              >
                {endBattleBusy ? "Loading…" : "End Battle"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import { getActionLabel, getDamageForAction } from "./battleDamage";
import HPBar from "./components/HPBar";
import MSTabs from "./components/MSTabs";
import MSTabContents from "./components/MSTabContents";
import { runEnemyCounterAttack } from "./enemyTurn";
import type { MSActionHover, TabType } from "./types";
import type { mobile_suits } from "../generated/prisma/client";
import { refreshBattleEnemies } from "../actions/refreshBattleEnemies";

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

/** Pause after your hit so the enemy explosion reads clearly before the counterattack. */
const ENEMY_COUNTER_DELAY_MS = 900;

const BOOM_SFX_SRC = "/sounds/bgm-boom.wav";

const INITIAL_LOG_LINES = [
  "Battle start — your side moves first. Choose an action, then tap an enemy unit.",
];

const NEW_ENEMY_SQUAD_LOG = "New enemy squad deployed.";

export default function BattleArenaClient({ lineup, enemyMS }: Props) {
  const [liveEnemyMS, setLiveEnemyMS] = useState<mobile_suits[]>(enemyMS);
  const [activeTab, setActiveTab] = useState<TabType>("MS1");
  const [playerHP, setPlayerHP] = useState<number[]>(() =>
    lineup.map((unit) => unit.armor),
  );
  const [enemyHP, setEnemyHP] = useState<number[]>(() =>
    enemyMS.map((unit) => unit.ms_armor),
  );
  const [endBattleBusy, setEndBattleBusy] = useState(false);
  const [pendingAttack, setPendingAttack] = useState<PendingPlayerAttack | null>(
    null,
  );
  const [battleOutcome, setBattleOutcome] = useState<"win" | "lose" | null>(
    null,
  );
  const [logLines, setLogLines] = useState<string[]>(() => [
    ...INITIAL_LOG_LINES,
  ]);
  const [playerHitFlashIndex, setPlayerHitFlashIndex] = useState<number | null>(
    null,
  );
  const [enemyHitFlashIndex, setEnemyHitFlashIndex] = useState<number | null>(
    null,
  );
  const [isEnemyTurnPending, setIsEnemyTurnPending] = useState(false);
  const hitFlashClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enemyCounterDelayRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const boomAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(BOOM_SFX_SRC);
    boomAudioRef.current = audio;
    return () => {
      audio.pause();
      boomAudioRef.current = null;
      if (hitFlashClearRef.current != null) {
        clearTimeout(hitFlashClearRef.current);
      }
      if (enemyCounterDelayRef.current != null) {
        clearTimeout(enemyCounterDelayRef.current);
      }
    };
  }, []);

  function playBoomSound() {
    const audio = boomAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      /* ignore: autoplay restrictions or missing file */
    });
  }

  async function handleEndBattle() {
    if (endBattleBusy) return;

    if (hitFlashClearRef.current != null) {
      clearTimeout(hitFlashClearRef.current);
      hitFlashClearRef.current = null;
    }
    if (enemyCounterDelayRef.current != null) {
      clearTimeout(enemyCounterDelayRef.current);
      enemyCounterDelayRef.current = null;
    }

    setEndBattleBusy(true);
    try {
      const nextEnemies = await refreshBattleEnemies();
      setLiveEnemyMS(nextEnemies);
      setEnemyHP(nextEnemies.map((unit) => unit.ms_armor));
      setActiveTab("MS1");
      setPlayerHP(lineup.map((unit) => unit.armor));
      setPendingAttack(null);
      setBattleOutcome(null);
      setLogLines([...INITIAL_LOG_LINES, NEW_ENEMY_SQUAD_LOG]);
      setPlayerHitFlashIndex(null);
      setEnemyHitFlashIndex(null);
      setIsEnemyTurnPending(false);
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

  const activeUnitIndex = tabToIndex(activeTab);
  const actionsDisabled =
    battleOutcome !== null ||
    playerHP[activeUnitIndex]! <= 0 ||
    pendingAttack !== null ||
    isEnemyTurnPending;

  function handleSelectAction(action: MSActionHover) {
    if (battleOutcome !== null) return;
    if (isEnemyTurnPending) return;
    const idx = tabToIndex(activeTab);
    if (playerHP[idx]! <= 0) return;
    if (pendingAttack !== null) return;
    setPendingAttack({ unitIndex: idx, action });
  }

  function handleEnemyClick(enemyIndex: number) {
    if (pendingAttack === null || battleOutcome !== null) return;
    if (isEnemyTurnPending) return;
    if (enemyHP[enemyIndex]! <= 0) return;

    playBoomSound();

    const unit = lineup[pendingAttack.unitIndex]!;
    const action = pendingAttack.action;
    const dmg = getDamageForAction(unit, action);
    const label = getActionLabel(unit, action);

    const nextEnemyHP = [...enemyHP];
    nextEnemyHP[enemyIndex] = Math.max(0, nextEnemyHP[enemyIndex]! - dmg);

    const playerAttackLine = `${unit.name} uses ${label} on ${enemyNames[enemyIndex]} for ${dmg} damage.`;

    const allEnemiesDown = nextEnemyHP.every((hp) => hp <= 0);

    setEnemyHP(nextEnemyHP);
    setLogLines((prev) => [...prev, playerAttackLine]);
    setPendingAttack(null);

    if (allEnemiesDown) {
      setBattleOutcome("win");
      setLogLines((prev) => [...prev, "All enemy units defeated. Victory!"]);
      return;
    }

    if (enemyCounterDelayRef.current != null) {
      clearTimeout(enemyCounterDelayRef.current);
    }

    setIsEnemyTurnPending(true);
    setEnemyHitFlashIndex(enemyIndex);

    const snapshotPlayerHP = [...playerHP];
    const snapshotEnemyHP = nextEnemyHP;

    enemyCounterDelayRef.current = setTimeout(() => {
      enemyCounterDelayRef.current = null;
      setEnemyHitFlashIndex(null);

      const counter = runEnemyCounterAttack(
        lineup,
        liveEnemyMS,
        snapshotEnemyHP,
        snapshotPlayerHP,
      );

      if (!counter) {
        setIsEnemyTurnPending(false);
        return;
      }

      playBoomSound();

      const extraLines: string[] = [counter.logLine];

      setPlayerHP(counter.newPlayerHP);
      setLogLines((prev) => [...prev, ...extraLines]);

      if (hitFlashClearRef.current != null) {
        clearTimeout(hitFlashClearRef.current);
      }
      setPlayerHitFlashIndex(counter.targetPlayerIndex);
      hitFlashClearRef.current = setTimeout(() => {
        setPlayerHitFlashIndex(null);
        hitFlashClearRef.current = null;
      }, 900);

      if (counter.newPlayerHP.every((hp) => hp <= 0)) {
        setBattleOutcome("lose");
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
            {[0, 1, 2].map((i) => (
              <div key={i} className="contents">
                <div
                  className={`image-container player-${i + 1} ${playerHP[i]! <= 0 ? "opacity-40 grayscale" : ""} ${playerHitFlashIndex === i ? "battle-arena-player-hit" : ""}`}
                >
                  <Image
                    src={lineupPics[i] ?? ""}
                    alt="Player Units"
                    width={100}
                    height={100}
                  />
                  <div className="exploded-overlay" />
                </div>
                <div className="unit-information w-[150px]">
                  <HPBar
                    currentHP={playerHP[i]!}
                    maxHP={maxPlayerHP[i]!}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="arena-info">
            <h2 className="text-2xl font-bold text-center text-3-dark">
              Arena Info
            </h2>
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
              !pendingAttack && (
              <p className="text-center text-3-dark m-0 text-sm">
                Your turn: pick Basic Attack or a skill, then choose a target.
              </p>
            )}
          </div>
          <div className="enemy-units">
            <h2 className="text-2xl font-bold text-center text-3-dark">
              Enemy Units
            </h2>
            {[0, 1, 2].map((i) => (
              <div
                key={liveEnemyMS[i]?.ms_id ?? `enemy-slot-${i}`}
                className="contents"
              >
                <div
                  role={
                    pendingAttack && enemyHP[i]! > 0 && !isEnemyTurnPending
                      ? "button"
                      : undefined
                  }
                  tabIndex={
                    pendingAttack && enemyHP[i]! > 0 && !isEnemyTurnPending
                      ? 0
                      : undefined
                  }
                  className={`image-container enemy-${i + 1} ${enemyHP[i]! <= 0 ? "opacity-40 grayscale pointer-events-none" : ""} ${enemyHitFlashIndex === i ? "battle-arena-enemy-hit" : ""} ${pendingAttack && enemyHP[i]! > 0 && !isEnemyTurnPending ? "cursor-pointer ring-2 ring-amber-500 ring-offset-2 rounded" : ""}`}
                  onClick={() => {
                    if (enemyHP[i]! > 0 && !isEnemyTurnPending) handleEnemyClick(i);
                  }}
                  onKeyDown={(e) => {
                    if (
                      (e.key === "Enter" || e.key === " ") &&
                      enemyHP[i]! > 0 &&
                      !isEnemyTurnPending
                    ) {
                      e.preventDefault();
                      handleEnemyClick(i);
                    }
                  }}
                >
                  <Image
                    src={enemyPics[i] ?? ""}
                    alt="Enemy Units"
                    width={100}
                    height={100}
                  />
                  <div className="exploded-overlay" />
                </div>
                <div className="unit-information w-[150px]">
                  <HPBar currentHP={enemyHP[i]!} maxHP={maxEnemyHP[i]!} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="arena-actions">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
            <div className="action-item col-span-1">
              <MSTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                lineupNames={lineupNames}
              />
              <MSTabContents
                activeTab={activeTab}
                lineup={lineup}
                playerHP={playerHP}
                onSelectAction={handleSelectAction}
                actionsDisabled={actionsDisabled}
              />
            </div>
            <div className="enemy-status col-span-1">
              <h3 className="font-bold text-center text-3-dark">Enemy Status</h3>
              {[0, 1, 2].map((i) => (
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
                        {enemyHP[i]! <= 0 ? "Destroyed" : "Active"}
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="action-logs col-span-1">
              <h3 className="font-bold text-center text-3-dark">Action Logs</h3>
              <textarea
                readOnly
                rows={5}
                className="w-full text-sm text-3-dark"
                value={logLines.join("\n")}
              />
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

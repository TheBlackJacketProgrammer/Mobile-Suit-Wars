"use client";

import Link from "next/link";
import type { ApplyBattleWinSuccess } from "../../actions/applyBattleWinRewards";
import {
  ARMOR_BONUS_PER_LEVEL_UP,
  DAMAGE_BONUS_PER_LEVEL_UP,
} from "@/lib/battleWinRewards";

type Props = {
  open: boolean;
  data: ApplyBattleWinSuccess | null;
  onOk: () => void;
  okDisabled?: boolean;
};

export default function BattleWinSummaryModal({
  open,
  data,
  onOk,
  okDisabled = false,
}: Props) {
  if (!open || !data) return null;

  return (
    <div
      className="battle-win-summary-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="battle-win-summary-title"
    >
      <div className="battle-win-summary-panel">
        <h2 id="battle-win-summary-title" className="battle-win-summary-title">
          Player — MS lineup summary
        </h2>

        <div className="battle-win-summary-points">
          <span className="battle-win-summary-label">Points</span>
          <span className="battle-win-summary-calc" aria-live="polite">
            {data.gPointsBefore} + {data.gPointsRewarded} ={" "}
            {data.gPointsAfter}
          </span>
        </div>

        <div className="battle-win-summary-units">
          {data.units.map((u, i) => (
            <div key={u.msId} className="battle-win-summary-unit">
              <span className="battle-win-summary-slot">MS ID {i + 1}</span>
              <div className="battle-win-summary-row">
                <span className="battle-win-summary-k">Name</span>
                <span className="battle-win-summary-v">{u.name}</span>
              </div>
              <div className="battle-win-summary-row">
                <span className="battle-win-summary-k">Model ID</span>
                <span className="battle-win-summary-v">{u.modelId}</span>
              </div>
              <div className="battle-win-summary-row battle-win-summary-row--exp">
                <span className="battle-win-summary-k">Total EXP</span>
                <div className="battle-win-summary-exp-block">
                  {u.rewarded && u.expRewarded > 0 ? (
                    <span className="battle-win-summary-calc">
                      {u.totalExpBefore} + {u.expRewarded} = {u.totalExpAfter}
                    </span>
                  ) : (
                    <span className="battle-win-summary-calc">
                      {u.totalExpAfter}
                    </span>
                  )}
                  <span className="battle-win-summary-exp-hint">
                    Lifetime cumulative — battle EXP always adds to this total; it
                    is not wiped on level-up.
                  </span>
                </div>
              </div>
              <div className="battle-win-summary-row">
                <span className="battle-win-summary-k">Level</span>
                <span className="battle-win-summary-calc">
                  {u.levelBefore} + {u.levelGained} = {u.levelAfter}
                </span>
              </div>
              <div className="battle-win-summary-row battle-win-summary-row--exp">
                <span className="battle-win-summary-k">
                  Toward next level
                </span>
                <div className="battle-win-summary-exp-block">
                  {u.levelGained === 0 && u.rewarded && u.expRewarded > 0 ? (
                    <span className="battle-win-summary-calc">
                      {u.expBefore} + {u.expRewarded} = {u.expAfter}
                    </span>
                  ) : u.levelGained > 0 ? (
                    <>
                      <span className="battle-win-summary-calc">
                        {u.expBefore} → {u.expAfter}
                      </span>
                      <span className="battle-win-summary-exp-hint">
                        Remainder toward the next level after spending EXP on
                        level-ups (see total above for full amount gained).
                      </span>
                      <span className="battle-win-summary-level-bonuses">
                        Level-up bonuses: +
                        {u.levelGained * DAMAGE_BONUS_PER_LEVEL_UP} damage to
                        basic and all skills; +
                        {u.levelGained * ARMOR_BONUS_PER_LEVEL_UP} armor.
                      </span>
                    </>
                  ) : (
                    <span className="battle-win-summary-calc">{u.expAfter}</span>
                  )}
                </div>
              </div>
              {!u.rewarded && (
                <p className="battle-win-summary-destroyed m-0">
                  Unit destroyed — no battle EXP.
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="battle-win-summary-actions">
          <button
            type="button"
            className="battle-win-summary-ok btn-primary"
            disabled={okDisabled}
            onClick={onOk}
          >
            {okDisabled ? "Loading…" : "New game"}
          </button>
          <Link
            href="/hanger"
            className="battle-win-summary-hanger btn-secondary-transparent"
          >
            Go to hanger
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

type Props = {
  open: boolean;
  onNewGame: () => void;
  newGameDisabled?: boolean;
};

export default function BattleLoseModal({
  open,
  onNewGame,
  newGameDisabled = false,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="battle-win-summary-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="battle-lose-title"
    >
      <div className="battle-win-summary-panel">
        <h2
          id="battle-lose-title"
          className="battle-win-summary-title battle-lose-summary-title"
        >
          Defeat
        </h2>
        <p className="battle-lose-summary-message">
          All your units were defeated. Start a new battle or return to the
          hanger.
        </p>

        <div className="battle-win-summary-actions battle-lose-summary-actions">
          <button
            type="button"
            className="battle-win-summary-ok btn-primary"
            disabled={newGameDisabled}
            onClick={onNewGame}
          >
            {newGameDisabled ? "Loading…" : "New game"}
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

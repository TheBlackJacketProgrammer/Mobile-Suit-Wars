"use client";

import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import type { MSActionHover } from "../types";

type Props = {
  lineup: MSLineUpUnit;
  onHoverAction: (action: MSActionHover | null) => void;
  onSelectAction: (action: MSActionHover) => void;
  /** When true, all actions are blocked (dead unit, targeting enemy, enemy turn, battle over). */
  disabled?: boolean;
};

export default function MSActions({
  lineup,
  onHoverAction,
  onSelectAction,
  disabled = false,
}: Props) {
  const locked = disabled;

  return (
    <div
      className={`flex flex-col gap-2 w-full ms-actions${locked ? " ms-actions--locked" : ""}`}
      aria-disabled={locked}
      onMouseLeave={() => {
        if (!locked) onHoverAction(null);
      }}
    >
      <button
        type="button"
        className="btn-primary"
        disabled={locked}
        onMouseEnter={() => {
          if (!locked) onHoverAction("basic");
        }}
        onClick={() => onSelectAction("basic")}
      >
        Basic Attack
      </button>
      <button
        type="button"
        className="btn-primary"
        disabled={locked}
        onMouseEnter={() => {
          if (!locked) onHoverAction("skill1");
        }}
        onClick={() => onSelectAction("skill1")}
      >
        {lineup.skill1}
      </button>
      <button
        type="button"
        className="btn-primary"
        disabled={locked}
        onMouseEnter={() => {
          if (!locked) onHoverAction("skill2");
        }}
        onClick={() => onSelectAction("skill2")}
      >
        {lineup.skill2}
      </button>
      <button
        type="button"
        className="btn-primary"
        disabled={locked}
        onMouseEnter={() => {
          if (!locked) onHoverAction("skill3");
        }}
        onClick={() => onSelectAction("skill3")}
      >
        {lineup.skill3}
      </button>
    </div>
  );
}
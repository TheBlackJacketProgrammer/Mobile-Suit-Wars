"use client";

import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import { canUseAction, formatCooldownDisplay, type UnitAttackCharges } from "../battleAttackCharges";
import type { MSActionHover } from "../types";
import { toast } from "react-toastify";

type Props = {
  lineup: MSLineUpUnit;
  /** Uses left + cooldowns for the active unit. */
  charges: UnitAttackCharges;
  onHoverAction: (action: MSActionHover | null) => void;
  onSelectAction: (action: MSActionHover) => void;
  /** When true, all actions are blocked (dead unit, targeting enemy, enemy turn, battle over). */
  disabled?: boolean;
};

export default function MSActions({
  lineup,
  charges,
  onHoverAction,
  onSelectAction,
  disabled = false,
}: Props) {
  const locked = disabled;

  function btnClass(action: "basic" | "skill1" | "skill2" | "skill3") {
    const exhausted = !locked && !canUseAction(charges, action);
    return `btn-primary${exhausted ? " ms-actions__btn--exhausted" : ""}`;
  }

  function trySelect(action: "basic" | "skill1" | "skill2" | "skill3") {
    if (locked) return;
    if (!canUseAction(charges, action)) {
      // Show cooldown message for skills with no charges
      onHoverAction(action);
      if (action !== "basic") {
        const cooldown = formatCooldownDisplay(charges, action);
        toast.warning(`${action.charAt(0).toUpperCase() + action.slice(1)} Cooldown in ${cooldown}`);
      }
      return;
    }
    onSelectAction(action);
  }

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
        className={btnClass("basic")}
        disabled={locked}
        aria-disabled={locked}
        onMouseEnter={() => {
          if (!locked) onHoverAction("basic");
        }}
        onClick={() => trySelect("basic")}
      >
        Basic Attack
      </button>
      <button
        type="button"
        className={btnClass("skill1")}
        disabled={locked}
        aria-disabled={locked}
        onMouseEnter={() => {
          if (!locked) onHoverAction("skill1");
        }}
        onClick={() => trySelect("skill1")}
      >
        {lineup.skill1}
      </button>
      <button
        type="button"
        className={btnClass("skill2")}
        disabled={locked}
        aria-disabled={locked}
        onMouseEnter={() => {
          if (!locked) onHoverAction("skill2");
        }}
        onClick={() => trySelect("skill2")}
      >
        {lineup.skill2}
      </button>
      <button
        type="button"
        className={btnClass("skill3")}
        disabled={locked}
        aria-disabled={locked}
        onMouseEnter={() => {
          if (!locked) onHoverAction("skill3");
        }}
        onClick={() => trySelect("skill3")}
      >
        {lineup.skill3}
      </button>
    </div>
  );
}

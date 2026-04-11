import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import {
  chargesLeft,
  formatCooldownDisplay,
  maxForAction,
  type UnitAttackCharges,
} from "../battleAttackCharges";
import { getActionLabel, getDamageForAction } from "../battleDamage";
import type { MSActionHover } from "../types";

type Props = {
  lineup: MSLineUpUnit;
  hoveredAction: MSActionHover | null;
  currentArmor: number;
  charges: UnitAttackCharges;
  isBenched?: boolean;
};

function resolveAction(
  lineup: MSLineUpUnit,
  hovered: MSActionHover | null,
): { label: string; damage: number } | null {
  if (!hovered) return null;
  return {
    label: getActionLabel(lineup, hovered),
    damage: getDamageForAction(lineup, hovered),
  };
}

function getStatusDisplay(
  currentArmor: number,
  maxArmor: number,
  isBenched: boolean,
): { status: string; textColor: string; bgColor: string } {
  if (isBenched) {
    return { status: "Benched", textColor: "text-amber-600", bgColor: "bg-amber-50" };
  }

  const hpPercentage = Math.max(0, (currentArmor / maxArmor) * 100);

  if (hpPercentage > 60) {
    return {
      status: "Active",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
    };
  } else if (hpPercentage > 50) {
    return {
      status: "Damaged",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
    };
  } else if (hpPercentage > 0) {
    return {
      status: "Overheating",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    };
  } else {
    return {
      status: "Destroyed",
      textColor: "text-red-700",
      bgColor: "bg-red-100",
    };
  }
}

export default function MSStats({
  lineup,
  hoveredAction,
  currentArmor,
  charges,
  isBenched = false,
}: Props) {
  const preview = resolveAction(lineup, hoveredAction);
  const statusDisplay = getStatusDisplay(currentArmor, lineup.armor, isBenched);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 text-green-700 font-semibold">
        <span>
          Armor: {currentArmor} / {lineup.armor}
        </span>
        <span>Lvl: {lineup.level}</span>
      </div>

      <div className="ms-stats-weapon">
        {!preview || !hoveredAction ? (
          <p className="text-3-dark text-sm m-0 italic">
            Hover an action to preview stats.
          </p>
        ) : (
          <>
            <div className="flex flex-row justify-between">
              <span className="text-3-dark">
                Damage: <b>{preview.damage}</b>
              </span>
            </div>
            <div className="flex flex-row justify-between">
              <span className="text-3-dark">
                Left:{" "}
                <b>
                  {chargesLeft(charges, hoveredAction)}/
                  {maxForAction(hoveredAction)}
                </b>
              </span>
            </div>
            <div className="flex flex-row justify-between">
              <span className="text-3-dark">
                Effect: <b>None</b>
              </span>
            </div>
            <div className="flex flex-row justify-between">
              <span className="text-3-dark">
                Cooldown: <b>{formatCooldownDisplay(charges, hoveredAction)}</b>
              </span>
            </div>
          </>
        )}
      </div>

      <div className={`border p-3 ${statusDisplay.bgColor} shadow text-center`}>
        <span className="text-3-dark">Status: </span>
        <span className={`${statusDisplay.textColor} font-bold`}>
          {statusDisplay.status}
        </span>
      </div>
    </div>
  );
}

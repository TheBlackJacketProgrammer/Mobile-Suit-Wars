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

export default function MSStats({
  lineup,
  hoveredAction,
  currentArmor,
  charges,
}: Props) {
  const preview = resolveAction(lineup, hoveredAction);

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

      <div className="border p-3 bg-gray-100 shadow text-center">
        <span className="text-3-dark">Status: </span>
        <span className="text-green-700 font-bold">Normal</span>
      </div>
    </div>
  );
}

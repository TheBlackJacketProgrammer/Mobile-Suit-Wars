import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import type { MSActionHover } from "../types";

type Props = {
  lineup: MSLineUpUnit;
  hoveredAction: MSActionHover | null;
};

function resolveAction(
  lineup: MSLineUpUnit,
  hovered: MSActionHover | null,
): { label: string; damage: number } | null {
  if (!hovered) return null;
  switch (hovered) {
    case "basic":
      return { label: "Basic Attack", damage: lineup.basicAtkdmg };
    case "skill1":
      return { label: lineup.skill1, damage: lineup.skill1dmg };
    case "skill2":
      return { label: lineup.skill2, damage: lineup.skill2dmg };
    case "skill3":
      return { label: lineup.skill3, damage: lineup.skill3dmg };
    default:
      return null;
  }
}

export default function MSStats({ lineup, hoveredAction }: Props) {
  const preview = resolveAction(lineup, hoveredAction);

  return (
    <div className="flex flex-col gap-2">
      {/* Top Info */}
      <div className="flex flex-col gap-1 text-green-700 font-semibold">
        <span>Armor: {lineup.armor}</span>
        <span>Lvl: {lineup.level}</span>
      </div>

      {/* Weapon Info — updates while hovering action buttons */}
      <div className="ms-stats-weapon">
        {!preview ? (
          <p className="text-3-dark text-sm m-0 italic">
            Hover an action to preview stats.
          </p>
        ) : (
          <>
            {/* <div className="flex flex-row justify-between">
              <span className="text-3-dark">
                Attack: <b>{preview.label}</b>
              </span>
            </div> */}
            <div className="flex flex-row justify-between">
              <span className="text-3-dark">
                Damage: <b>{preview.damage}</b>
              </span>
            </div>
            <div className="flex flex-row justify-between">
              <span className="text-3-dark">Left: ∞</span>
            </div>
            <div className="flex flex-row justify-between">
              <span className="text-3-dark">
                Effect: <b>None</b>
              </span>
            </div>
            <div className="flex flex-row justify-between">
              <span className="text-3-dark">Cooldown: ∞</span>
            </div>
          </>
        )}
      </div>

      {/* Status */}
      <div className="border p-3 bg-gray-100 shadow text-center">
        <span className="text-3-dark">Status: </span>
        <span className="text-green-700 font-bold">Normal</span>
      </div>
    </div>
  );
}
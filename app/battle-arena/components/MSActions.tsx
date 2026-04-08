import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import type { MSActionHover } from "../types";

type Props = {
  lineup: MSLineUpUnit;
  onHoverAction: (action: MSActionHover | null) => void;
};

export default function MSActions({ lineup, onHoverAction }: Props) {
  return (
    <div
      className="flex flex-col gap-2 w-full ms-actions"
      onMouseLeave={() => onHoverAction(null)}
    >
      <button
        type="button"
        className="btn-primary"
        onMouseEnter={() => onHoverAction("basic")}
      >
        Basic Attack
      </button>
      <button
        type="button"
        className="btn-primary"
        onMouseEnter={() => onHoverAction("skill1")}
      >
        {lineup.skill1}
      </button>
      <button
        type="button"
        className="btn-primary"
        onMouseEnter={() => onHoverAction("skill2")}
      >
        {lineup.skill2}
      </button>
      <button
        type="button"
        className="btn-primary"
        onMouseEnter={() => onHoverAction("skill3")}
      >
        {lineup.skill3}
      </button>
    </div>
  );
}
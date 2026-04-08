"use client";

import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import { useEffect, useState } from "react";
import type { MSActionHover, TabType } from "../types";
import MSActions from "./MSActions";
import MSStats from "./MSStats";

type Props = {
  activeTab: TabType;
  lineup: MSLineUpUnit[];
  /** Per-slot current armor in battle (matches HP bars). */
  playerHP: number[];
  onSelectAction: (action: MSActionHover) => void;
  actionsDisabled: boolean;
};

function tabToIndex(tab: TabType): number {
  if (tab === "MS1") return 0;
  if (tab === "MS2") return 1;
  return 2;
}

function MSUnitActionsStats({
  unit,
  currentArmor,
  onSelectAction,
  actionsDisabled,
}: {
  unit: MSLineUpUnit;
  currentArmor: number;
  onSelectAction: (action: MSActionHover) => void;
  actionsDisabled: boolean;
}) {
  const [hoveredAction, setHoveredAction] = useState<MSActionHover | null>(null);

  useEffect(() => {
    if (actionsDisabled) {
      setHoveredAction(null);
    }
  }, [actionsDisabled]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <MSActions
        lineup={unit}
        onHoverAction={setHoveredAction}
        onSelectAction={onSelectAction}
        disabled={actionsDisabled}
      />
      <MSStats
        lineup={unit}
        hoveredAction={hoveredAction}
        currentArmor={currentArmor}
      />
    </div>
  );
}

function unitForTab(activeTab: TabType, lineup: MSLineUpUnit[]): MSLineUpUnit {
  if (activeTab === "MS1") return lineup[0];
  if (activeTab === "MS2") return lineup[1];
  return lineup[2];
}

export default function MSContent({
  activeTab,
  lineup,
  playerHP,
  onSelectAction,
  actionsDisabled,
}: Props) {
  const idx = tabToIndex(activeTab);
  const currentArmor = playerHP[idx] ?? 0;

  return (
    <div className="ms-tab-contents">
      <MSUnitActionsStats
        key={activeTab}
        unit={unitForTab(activeTab, lineup)}
        currentArmor={currentArmor}
        onSelectAction={onSelectAction}
        actionsDisabled={actionsDisabled}
      />
    </div>
  );
}

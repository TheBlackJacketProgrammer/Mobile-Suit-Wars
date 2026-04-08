"use client";

import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import { useState } from "react";
import type { MSActionHover, TabType } from "../types";
import MSActions from "./MSActions";
import MSStats from "./MSStats";

type Props = {
  activeTab: TabType;
  lineup: MSLineUpUnit[];
};

function MSUnitActionsStats({ unit }: { unit: MSLineUpUnit }) {
  const [hoveredAction, setHoveredAction] = useState<MSActionHover | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <MSActions lineup={unit} onHoverAction={setHoveredAction} />
      <MSStats lineup={unit} hoveredAction={hoveredAction} />
    </div>
  );
}

function unitForTab(activeTab: TabType, lineup: MSLineUpUnit[]): MSLineUpUnit {
  if (activeTab === "MS1") return lineup[0];
  if (activeTab === "MS2") return lineup[1];
  return lineup[2];
}

export default function MSContent({ activeTab, lineup }: Props) {
  return (
    <div className="ms-tab-contents">
      <MSUnitActionsStats key={activeTab} unit={unitForTab(activeTab, lineup)} />
    </div>
  );
}

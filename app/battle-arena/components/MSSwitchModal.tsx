"use client";

import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import type { PendingPlayerAttack } from "../BattleArenaClient";
import type { TabType } from "../types";
import MSTabs from "./MSTabs";
import MSTabContents from "./MSTabContents";
import type { AttackCharges } from "../battleAttackCharges";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lineupNames: string[];
  playerHP: number[];
  benchBannedTabIndices: number[];
  uiRemovedSlotIndices: ReadonlySet<number>;
  pendingAttack?: PendingPlayerAttack | null;
  lineup: MSLineUpUnit[];
  playerCharges: AttackCharges[];
  onSelectAction: (action: any) => void;
  onCancelAttack: () => void;
  actionsDisabled: boolean;
  benchBannedSet: Set<number>;
};

export default function MSSwitchModal({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  lineupNames,
  playerHP,
  benchBannedTabIndices,
  uiRemovedSlotIndices,
  pendingAttack,
  lineup,
  playerCharges,
  onSelectAction,
  onCancelAttack,
  actionsDisabled,
  benchBannedSet,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal flex justify-start items-center flex-col">
      <div className="modal-dialog-box">
        <div className="modal-header">
          <h4 className="text-3-dark">
            {pendingAttack ? "Pending Attack - Select Target" : "Select Unit"}
          </h4>
          <button
            type="button"
            className="btn-close text-3-dark"
            onClick={() => {
              if (pendingAttack) {
                onCancelAttack();
              }
              onClose();
            }}
          >
            <span className="sr-only">Close</span>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <MSTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            lineupNames={lineupNames}
            playerHP={playerHP}
            benchBannedTabIndices={benchBannedTabIndices}
            uiRemovedSlotIndices={uiRemovedSlotIndices}
            pendingAttack={pendingAttack}
          />
          {!pendingAttack && (
            <MSTabContents
              activeTab={activeTab}
              lineup={lineup}
              playerHP={playerHP}
              playerCharges={playerCharges}
              onSelectAction={(action) => {
                onSelectAction(action);
                onClose();
              }}
              actionsDisabled={false}
              benchBannedSet={benchBannedSet}
            />
          )}
          {pendingAttack && (
            <div className="flex flex-col gap-2 items-center w-full">
              <p className="text-center text-amber-700 font-medium m-0 text-sm">
                Select an enemy unit to attack or cancel to choose another unit.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              if (pendingAttack) {
                onCancelAttack();
              }
              onClose();
            }}
            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded"
          >
            {pendingAttack ? "Cancel Attack" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

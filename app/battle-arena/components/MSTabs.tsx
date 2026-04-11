import type { TabType } from "../types";

type Props = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lineupNames: string[];
  /** Per-slot HP; used to disable tab for a unit that must sit out this turn. */
  playerHP: number[];
  /** Indices of units regrouping this turn (cannot be selected). */
  benchBannedTabIndices: number[];
  /** Slots already removed from the arena UI after destroy delay. */
  uiRemovedSlotIndices: ReadonlySet<number>;
};

const tabs: TabType[] = ["MS1", "MS2", "MS3"];

export default function MSTabs({
  activeTab,
  setActiveTab,
  lineupNames,
  playerHP,
  benchBannedTabIndices,
  uiRemovedSlotIndices,
}: Props) {
  const bannedSet = new Set(benchBannedTabIndices);

  return (
    <div className="flex bg-gray-200 border-b">
      {tabs.map((tab, index) => {
        if (playerHP[index]! <= 0 && uiRemovedSlotIndices.has(index))
          return null;
        const destroyedPending =
          playerHP[index]! <= 0 && !uiRemovedSlotIndices.has(index);
        const benched = !destroyedPending && bannedSet.has(index);
        return (
          <button
            key={tab}
            type="button"
            disabled={benched || destroyedPending}
            title={
              destroyedPending
                ? "Unit destroyed."
                : benched
                  ? "This suit is resting — choose another unit for this turn."
                  : undefined
            }
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-r ms-tabs__btn ${
              activeTab === tab
                ? "bg-white font-bold"
                : "bg-gray-200 hover:bg-gray-300"
            }${benched || destroyedPending ? " ms-tabs__btn--blocked" : ""}`}
          >
            <span className="text-3-dark">
              {lineupNames[index] ?? tab}
              {benched && <span className="text-3-dark font-semibold"> - Benched</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

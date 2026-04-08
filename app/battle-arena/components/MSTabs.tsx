import type { TabType } from "../types";

type Props = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lineupNames: string[];
};

const tabs: TabType[] = ["MS1", "MS2", "MS3"];

export default function MSTabs({ activeTab, setActiveTab, lineupNames }: Props) {
  return (
    <div className="flex bg-gray-200 border-b">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 border-r ${
            activeTab === tab
              ? "bg-white font-bold"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <span className="text-3-dark">{lineupNames[index] ?? tab}</span>
        </button>
      ))}
    </div>
  );
}
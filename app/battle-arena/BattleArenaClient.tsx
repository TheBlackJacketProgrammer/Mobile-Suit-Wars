"use client";

import Image from "next/image";
import type { MSLineUpUnit } from "@/lib/getMSLineUp";
import HPBar from "./components/HPBar";
import MSTabs from "./components/MSTabs";
import MSTabContents from "./components/MSTabContents";
import { useState } from "react";
import type { TabType } from "./types";

type Props = {
  lineup: MSLineUpUnit[];
};

export default function BattleArenaClient({ lineup }: Props) {

  const [activeTab, setActiveTab] = useState<TabType>("MS1");
  const lineupNames = lineup.map((unit) => unit.name);
  const lineupPics = lineup.map((unit) => unit.pic);
  const lineupHPs = lineup.map((unit) => unit.armor);

  return (
    <>
      <section className="battle-arena-section">
        <div className="arena-container grid grid-cols-1 lg:grid-cols-3">
          <div className="player-units">
            <h2 className="text-2xl font-bold text-center text-3-dark mb-2">Player Units</h2>
            <div className="image-container">
              <Image src={lineupPics[0]} alt="Player Units" width={100} height={100} />
            </div>
            <div className="unit-information w-[150px]">
              <HPBar currentHP={lineupHPs[0]} maxHP={lineupHPs[0]} />
            </div>
            <div className="image-container">
              <Image src={lineupPics[1]} alt="Player Units" width={100} height={100} />
            </div>
            <div className="unit-information w-[150px]">
              <HPBar currentHP={lineupHPs[1]} maxHP={lineupHPs[1]} />
            </div>
            <div className="image-container">
              <Image src={lineupPics[2]} alt="Player Units" width={100} height={100} />
            </div>
            <div className="unit-information w-[150px]">
              <HPBar currentHP={lineupHPs[2]} maxHP={lineupHPs[2]} />
            </div>
          </div>
          <div className="arena-info">
            <h2 className="text-2xl font-bold text-center text-3-dark">Arena Info</h2>
          </div>
          <div className="enemy-units">
            <h2 className="text-2xl font-bold text-center text-3-dark">Enemy Units</h2>
            <div className="image-container">
              <Image src="/images/test-unit.png" alt="Enemy Units" width={100} height={100} />
            </div>
            <div className="unit-information w-[150px]">
              <HPBar currentHP={50} maxHP={100} />
            </div>
            <div className="image-container">
              <Image src="/images/test-unit.png" alt="Enemy Units" width={100} height={100} />
            </div>
            <div className="unit-information w-[150px]">
              <HPBar currentHP={50} maxHP={100} />
            </div>
            <div className="image-container">
              <Image src="/images/test-unit.png" alt="Enemy Units" width={100} height={100} />
            </div>
            <div className="unit-information w-[150px]">
              <HPBar currentHP={50} maxHP={100} />
            </div>
          </div>
        </div>
        <div className="arena-actions">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
            <div className="action-item col-span-1">
              <MSTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                lineupNames={lineupNames}
              />
              <MSTabContents activeTab={activeTab} lineup={lineup} />
            </div>
            <div className="enemy-status col-span-1">
              <h3 className="font-bold text-center text-3-dark">Enemy Status</h3>
              <div className="enemy-information">
                <label htmlFor="enemy-name" className="text-sm text-3-dark">Mobile Suit Name : <span className="font-bold">Test 1</span></label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
                  <label htmlFor="enemy-name" className="text-sm text-3-dark">Armor : <span className="font-bold">100</span></label>
                  <label htmlFor="enemy-name" className="text-sm text-3-dark">Status : <span className="font-bold">Active</span></label>
                </div>
              </div>
              <div className="enemy-information">
                <label htmlFor="enemy-name" className="text-sm text-3-dark">Mobile Suit Name : <span className="font-bold">Test 2</span></label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
                  <label htmlFor="enemy-name" className="text-sm text-3-dark">Armor : <span className="font-bold">100</span></label>
                  <label htmlFor="enemy-name" className="text-sm text-3-dark">Status : <span className="font-bold">Active</span></label>
                </div>
              </div>
              <div className="enemy-information">
                <label htmlFor="enemy-name" className="text-sm text-3-dark">Mobile Suit Name : <span className="font-bold">Test 3</span></label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 w-full">
                  <label htmlFor="enemy-name" className="text-sm text-3-dark">Armor : <span className="font-bold">100</span></label>
                  <label htmlFor="enemy-name" className="text-sm text-3-dark">Status : <span className="font-bold">Active</span></label>
                </div>
              </div>
            </div>
            <div className="action-logs col-span-1">
              <h3 className="font-bold text-center text-3-dark">Action Logs</h3>
              <textarea readOnly rows={5} placeholder="Action Logs"></textarea>
              <button className="btn-primary">End Battle</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

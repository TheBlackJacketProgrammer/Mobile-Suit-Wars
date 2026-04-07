

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getMSLineUp } from "@/lib/getMSLineUp";
import Image from "next/image";
import BtnChangeUnit from "./buttons/BtnChangeUnit";
export default async function Hanger() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const data = await getMSLineUp(Number(userId));

  return (
    <>
    <section className="full-bleed hanger-section">
      <div className="hanger-container">
        {data.map((item) => (
          <div key={item.mid} className="hanger-item">
            <div className="flex flex-col gap-2">
              <div className="hanger-item-image-container">
                <div className="hanger-item-image">
                  <Image src={item.pic} alt={item.name} width={100} height={100} />
                </div>
              </div>
              <BtnChangeUnit ms_mid={item.mid} />
            </div>
            
            <div className="hanger-item-information">
              <h4 className="hanger-item-information-title">{item.name}</h4>
              <div className="grid grid-cols-4 gap-2 w-full mb-4">
                <div>
                  <p className="text-3-dark mb-1 font-bold p-base">Model Id</p>
                  <p className="text-5-mid m-0 p-base">{item.mid}</p>
                </div>
                <div>
                  <p className="text-3-dark mb-1 font-bold p-base">Level</p>
                  <p className="text-5-mid m-0 p-base">{item.level}</p>
                </div>
                <div>
                  <p className="text-3-dark mb-1 font-bold p-base">Exp</p>
                  <p className="text-5-mid m-0 p-base">{item.exp}</p>
                </div>
                <div>
                  <p className="text-3-dark mb-1 font-bold p-base">Armor</p>
                  <p className="text-5-mid m-0 p-base">{item.armor}</p>
                </div>
              </div>
              <h6 className="hanger-item-information-subtitle">Skill Sets</h6>
              <div className="flex flex-row gap-2 w-full items-center justify-between">
                <p className="text-3-dark m-0 font-bold p-base">{item.skill1}</p>
                <p className="text-5-mid m-0 p-base"><b>DMG:</b> {item.skill1dmg}</p>
              </div>
              <div className="flex flex-row gap-2 w-full items-center justify-between">
                <p className="text-3-dark m-0 font-bold p-base">{item.skill2}</p>
                <p className="text-5-mid m-0 p-base"><b>DMG:</b> {item.skill2dmg}</p>
              </div>
              <div className="flex flex-row gap-2 w-full items-center justify-between">
                <p className="text-3-dark m-0 font-bold p-base">{item.skill3}</p>
                <p className="text-5-mid m-0 p-base"><b>DMG:</b> {item.skill3dmg}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}

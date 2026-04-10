"use client"


import { mobile_suits } from "../generated/prisma/client";
import ImageComponent from "./ImageComponent";
import FieldLabelComponent from "./FieldLabelComponent";
import { useState } from "react";
import { setNewPlayerLineup } from "../actions/setNewPlayerLineup";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Props = {
  propsMSList: mobile_suits[];
};



export default function ChooseMSContainer( {propsMSList} : Props) {
  const router = useRouter();
  type MobileSuitType = {
    id: number;
    mid: string | null;
    name: string | null;
    pic: string | null;
    cost: number | null;
    armor: number | null;
    level: number | null;
    exp: number | null;
    atk1: string | null;
    atk2: string | null;
    atk3: string | null;
    basicAtkdmg: number | null;
    atk1dmg: number | null;
    atk2dmg: number | null;
    atk3dmg: number | null;
    atk1Eff: string | null;
    atk2Eff: string | null;
    atk3Eff: string | null;
  };

  const msContainer = {
    id: 0,
    mid: "",
    name: "",
    pic: "",
    cost: 0,
    armor: 0,
    level: 0,
    exp: 0,
    atk1: "",
    atk2: "",
    atk3: "",
    basicAtkdmg: 0,
    atk1dmg: 0,
    atk2dmg: 0,
    atk3dmg: 0,
    atk1Eff: "",
    atk2Eff: "",
    atk3Eff: "",
  };

  function mapToMobileSuitType(ms: mobile_suits): MobileSuitType {
    return {
      id: ms.ms_id,
      mid: ms.ms_mid,
      name: ms.ms_name,
      pic: ms.ms_pic,
      cost: ms.ms_cost,
      armor: ms.ms_armor,
      level: ms.ms_level,
      exp: ms.ms_exp,
      atk1: ms.ms_atk1,
      atk2: ms.ms_atk2,
      atk3: ms.ms_atk3,
      basicAtkdmg: ms.ms_basicAtkdmg,
      atk1dmg: ms.ms_atk1dmg,
      atk2dmg: ms.ms_atk2dmg,
      atk3dmg: ms.ms_atk3dmg,
      atk1Eff: ms.ms_atk1Eff,
      atk2Eff: ms.ms_atk2Eff,
      atk3Eff: ms.ms_atk3Eff,
    };
  }

  const [formData, setFormData] = useState<MobileSuitType>(msContainer);

  const [selected, setSelected] = useState<(string | null)[]>([null, null, null,]);
  
  const handleToggle = (unit: string) => {
    setSelected(prev => {
      // remove if already selected
      if (prev.includes(unit)) {
        return prev.map(u => (u === unit ? null : u));
      }
  
      // find empty slot
      const emptyIndex = prev.findIndex(u => u === null);
  
      // if full → do nothing (or replace logic optional)
      if (emptyIndex === -1) return prev;
  
      // insert into slot
      const updated = [...prev];
      updated[emptyIndex] = unit;
  
      return updated;
    });
  };

  const handleDoneBtn = async () => {
    const cleanedSelected = selected.filter(
      (item): item is string => item !== null
    );
  
    const result = await setNewPlayerLineup(cleanedSelected);

    if (result.success) {
      toast.success("You have now a Team!");
      router.refresh();
      router.push("/dashboard");
    }
  };

  return (
    <>
      <section className="main-container">
        <div className="grid grid-cols-5 gap-4 items-center justify-center">
          {propsMSList.map((ms) => 
            {
              const isSelected = selected.includes(ms.ms_mid);
              return (
                <div className="col-span-1" key={ms.ms_mid} onClick={() => {setFormData(mapToMobileSuitType(ms))}}>
                  <div className="img-container" style={{ border: isSelected ? "10px solid green" : "1px solid gray",}}>
                    <ImageComponent ms_image={ms.ms_pic ?? "/images/logo.png"} />
                  </div>
                </div>
              );
            })
          }
        </div>
        <div className="form-container mt-4">
          <h2 className="m-0 font-extrabold text-2xl text-3-dark border-b-2">Unit Details</h2>
          <FieldLabelComponent label={"Mobile Suit Name"} data={formData.name ?? ""} />
          <div className="grid lg:grid-cols-3 grid-col-1">
            <FieldLabelComponent label={"Mobile Suit ID"} data={formData.mid ?? ""} />
            <FieldLabelComponent label={"Mobile Suit Exp"} data={(formData.exp ?? 0).toString()} />
            <FieldLabelComponent label={"Mobile Suit Armor"} data={(formData.armor ?? 0).toString()} />
          </div>
          <FieldLabelComponent label={"Basic Attack Damage"} data={(formData.basicAtkdmg ?? 0).toString()} />
          <h2 className="m-0 font-extrabold text-2xl text-3-dark border-b-2">Skill Set</h2>
          <div className="flex flex-row justify-between">
            <FieldLabelComponent label={"Skill 1"} data={formData.atk1 ?? ""} />
            <FieldLabelComponent label={"Damage"} data={(formData.atk1dmg ?? 0).toString()} />
          </div>
          <div className="flex flex-row justify-between">
            <FieldLabelComponent label={"Skill 2"} data={formData.atk2 ?? ""} />
            <FieldLabelComponent label={"Damage"} data={(formData.atk2dmg ?? 0).toString()} />
          </div>
          <div className="flex flex-row justify-between">
            <FieldLabelComponent label={"Skill 3"} data={formData.atk3 ?? ""} />
            <FieldLabelComponent label={"Damage"} data={(formData.atk3dmg ?? 0).toString()} />
          </div>
          <div className="flex justify-end w-full mt-2 border-t-2 text-3-dark pt-4">
            <button className="btn-primary" onClick={() => handleToggle(formData.mid ?? "")}>{selected.includes(formData.mid) ? "Unselect Unit" : "Select Unit"}</button>
            {selected.filter(Boolean).length === 3 && (
              <button className="btn-secondary ml-2" onClick={() => handleDoneBtn()}>
                Done
              </button>
            )}
          </div>
        </div>
        
      </section>
    </>
  );
}

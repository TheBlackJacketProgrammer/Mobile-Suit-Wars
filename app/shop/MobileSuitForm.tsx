"use client";

import type { mobile_suits } from "../generated/prisma/client";
import { useState} from "react";
import Image from "next/image";
import { pictureToImageSrc } from "@/lib/pictureToImgSrc";
import { buyMobileSuit } from "@/app/actions/buyMobileSuit";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

function emptyMobileSuit(): mobile_suits {
  return {
    ms_id: 0,
    ms_mid: "",
    ms_name: "",
    ms_pic: "",
    ms_cost: 0,
    ms_armor: 0,
    ms_level: 1,
    ms_exp: 0,
    ms_basicAtkdmg: 0,
    ms_atk1: "",
    ms_atk2: "",
    ms_atk3: "",
    ms_atk1dmg: 0,
    ms_atk2dmg: 0,
    ms_atk3dmg: 0,
    ms_atk1Eff: null,
    ms_atk2Eff: null,
    ms_atk3Eff: null,
  } as mobile_suits;
}


export default function MobileSuitForm({selectedMS, onClearSelection,}: {
  selectedMS: mobile_suits | null;
  onClearSelection: () => void;
}) {
  const router = useRouter();

  const [formData, setFormData] = useState<mobile_suits>(() =>
    selectedMS ?? emptyMobileSuit()
  );

  const imageSrc = pictureToImageSrc(formData.ms_pic ?? "");
  const hasImageSrc = imageSrc != null;

  async function handleBuyMobileSuit(ms: mobile_suits) {
    const result = await buyMobileSuit(ms.ms_id);
    if ("success" in result) {
      toast.success(result.success);
      onClearSelection();
    } 
    else {
      toast.error(result.error);
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 form-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
            <div className="col-span-1 img-container">
                {hasImageSrc ? (
                <Image
                  src={imageSrc}
                  alt={(formData.ms_name ?? "") || "Mobile suit"}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
                ) : (
                <div className="flex h-[350px] w-full items-center justify-center rounded border border-dashed border-border-color text-sm opacity-70">
                  No image
                </div>
                )}
            </div>
            <div className="col-span-1 flex flex-col gap-2">
                <div className="form-group">
                    <label htmlFor="ms_name" className="px-2 mb-1 font-bold">Mobile Suit Name</label>
                    <input type="text" value={formData.ms_name ?? ""} onChange={(e) => setFormData({ ...formData, ms_name: e.target.value })} placeholder="Mobile Suit Name" disabled={!!selectedMS} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_mid" className="px-2 mb-1 font-bold">MS Code</label>
                        <input type="text" value={formData.ms_mid ?? ""} onChange={(e) => setFormData({ ...formData, ms_mid: e.target.value })} placeholder="Mobile Suit MID" disabled={!!selectedMS} />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_cost" className="px-2 mb-1 font-bold">Cost</label>
                        <input type="number" value={formData.ms_cost ?? 0} onChange={(e) => setFormData({ ...formData, ms_cost: Number(e.target.value) })} placeholder="Mobile Suit Cost" disabled={!!selectedMS} />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_armor" className="px-2 mb-1 font-bold">Armor</label>
                        <input type="number" value={formData.ms_armor ?? 0} onChange={(e) => setFormData({ ...formData, ms_armor: Number(e.target.value) })} placeholder="Mobile Suit Armor" disabled={!!selectedMS} />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_level" className="px-2 mb-1 font-bold">Level</label>
                        <input type="number" value={formData.ms_level ?? 1} onChange={(e) => setFormData({ ...formData, ms_level: Number(e.target.value) })} placeholder="Mobile Suit Level" disabled={!!selectedMS} />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_exp" className="px-2 mb-1 font-bold">Exp</label>
                        <input type="number" value={formData.ms_exp ?? 0} onChange={(e) => setFormData({ ...formData, ms_exp: Number(e.target.value) })} placeholder="Mobile Suit Experience" disabled={!!selectedMS} />
                    </div>
                </div>
                <div className="form-group col-span-1">
                    <label htmlFor="ms_basicAtkdmg" className="px-2 mb-1 font-bold">Basic Atk Dmg</label>
                    <input type="number" value={formData.ms_basicAtkdmg ?? 0} onChange={(e) => setFormData({ ...formData, ms_basicAtkdmg: Number(e.target.value) })} placeholder="Mobile Suit Basic Atk DMG" disabled={!!selectedMS} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="form-group col-span-2">
                        <label htmlFor="ms_atk1" className="px-2 mb-1 font-bold">Skill 1</label>
                        <input type="text" value={formData.ms_atk1 ?? ""} onChange={(e) => setFormData({ ...formData, ms_atk1: e.target.value })} placeholder="Mobile Suit Skill 1" disabled={!!selectedMS} />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_atk2" className="px-2 mb-1 font-bold">Dmg</label>
                        <input type="number" value={formData.ms_atk1dmg ?? 0} onChange={(e) => setFormData({ ...formData, ms_atk1dmg: Number(e.target.value) })} placeholder="Mobile Suit Skill 1 DMG" disabled={!!selectedMS} />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="form-group col-span-2">
                        <label htmlFor="ms_atk2" className="px-2 mb-1 font-bold">Skill 2</label>
                        <input type="text" value={formData.ms_atk2 ?? ""} onChange={(e) => setFormData({ ...formData, ms_atk2: e.target.value })} placeholder="Mobile Suit Skill 2" disabled={!!selectedMS} />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_atk2dmg" className="px-2 mb-1 font-bold">Dmg</label>
                        <input type="number" value={formData.ms_atk2dmg ?? 0} onChange={(e) => setFormData({ ...formData, ms_atk2dmg: Number(e.target.value) })} placeholder="Mobile Suit Skill 2 DMG" disabled={!!selectedMS} />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="form-group col-span-2">
                        <label htmlFor="ms_atk3" className="px-2 mb-1 font-bold">Skill 3</label>
                        <input type="text" value={formData.ms_atk3 ?? ""} onChange={(e) => setFormData({ ...formData, ms_atk3: e.target.value })} placeholder="Mobile Suit Skill 3" disabled={!!selectedMS} />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_atk3dmg" className="px-2 mb-1 font-bold">Dmg</label>
                        <input type="number" value={formData.ms_atk3dmg ?? 0} onChange={(e) => setFormData({ ...formData, ms_atk3dmg: Number(e.target.value) })} placeholder="Mobile Suit Skill 3 DMG" disabled={!!selectedMS} />
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col gap-2 mt-2 border-t border-border-color pt-4">
            <button type="button" className="btn-primary" onClick={() => handleBuyMobileSuit(formData)}>Buy</button>
        </div>
    </div>
    
  );
}
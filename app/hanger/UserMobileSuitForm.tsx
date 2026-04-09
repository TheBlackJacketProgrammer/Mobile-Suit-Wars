"use client";

import { useState} from "react";
import { pictureToImageSrc } from "@/lib/pictureToImgSrc";
import { changeUnit } from "@/app/actions/changeUnit";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { UserMobileSuit } from "./types";

function emptyUserMobileSuit(): UserMobileSuit {
    return {
        mid: "",
        name: "",
        pic: "",
        armor: 0,
        level: 0,
        exp: 0,
        basicAtkdmg: 0,
        atk1: "",
        atk2: "",
        atk3: "",
        atk1dmg: 0,
        atk2dmg: 0,
        atk3dmg: 0,
        isOnLineup: "",
    } as UserMobileSuit;
}

export default function UserMobileSuitForm({
    selectedMS,
    onClearSelection,
    onChangeUnitSuccess,
}: {
    selectedMS: UserMobileSuit | null;
    onClearSelection: () => void;
    onChangeUnitSuccess?: () => void;
}) {
    
    const [formData, setFormData] = useState<UserMobileSuit>(() =>
        selectedMS ?? emptyUserMobileSuit()
    );

    const imageSrc = pictureToImageSrc(formData.pic);
    const hasImageSrc = imageSrc != null;
    const router = useRouter();
    
    async function handleChangeUnit(ms: UserMobileSuit) {
        const currentMS = document.getElementById("modalChangeUnit")?.getAttribute("data-ms-mid");
        const result = await changeUnit(currentMS ?? "", ms.mid);
        if ("success" in result) {
            toast.success(result.success);
            onClearSelection();
            onChangeUnitSuccess?.();
            document.getElementById("modalChangeUnit")?.classList.remove("flex");
            document.getElementById("modalChangeUnit")?.classList.remove("justify-start");
            document.getElementById("modalChangeUnit")?.classList.remove("items-center");
            document.getElementById("modalChangeUnit")?.classList.remove("flex-col");
            document.getElementById("modalChangeUnit")?.classList.add("hidden");
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
                      alt={formData.pic || "Mobile suit"}
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
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Mobile Suit Name" disabled={!!selectedMS} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        <div className="form-group col-span-1">
                            <label htmlFor="ms_mid" className="px-2 mb-1 font-bold">MS Code</label>
                            <input type="text" value={formData.mid} onChange={(e) => setFormData({ ...formData, mid: e.target.value })} placeholder="Mobile Suit MID" disabled={!!selectedMS} />
                        </div>
                        <div className="form-group col-span-1">
                            <label htmlFor="armor" className="px-2 mb-1 font-bold">Armor</label>
                            <input type="number" value={formData.armor} onChange={(e) => setFormData({ ...formData, armor: Number(e.target.value) })} placeholder="Mobile Suit Armor" disabled={!!selectedMS} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        <div className="form-group col-span-1">
                            <label htmlFor="ms_level" className="px-2 mb-1 font-bold">Level</label>
                            <input type="number" value={formData.level} onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })} placeholder="Mobile Suit Level" disabled={!!selectedMS} />
                        </div>
                        <div className="form-group col-span-1">
                            <label htmlFor="exp" className="px-2 mb-1 font-bold">Exp</label>
                            <input type="number" value={formData.exp} onChange={(e) => setFormData({ ...formData, exp: Number(e.target.value) })} placeholder="Mobile Suit Experience" disabled={!!selectedMS} />
                        </div>
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="basicAtkdmg" className="px-2 mb-1 font-bold">Basic Atk Dmg</label>
                        <input type="number" value={formData.basicAtkdmg} onChange={(e) => setFormData({ ...formData, basicAtkdmg: Number(e.target.value) })} placeholder="Mobile Suit Basic Atk DMG" disabled={!!selectedMS} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        <div className="form-group col-span-2">
                            <label htmlFor="atk1" className="px-2 mb-1 font-bold">Skill 1</label>
                            <input type="text" value={formData.atk1} onChange={(e) => setFormData({ ...formData, atk1: e.target.value })} placeholder="Mobile Suit Skill 1" disabled={!!selectedMS} />
                        </div>
                        <div className="form-group col-span-1">
                            <label htmlFor="atk1dmg" className="px-2 mb-1 font-bold">Dmg</label>
                            <input type="number" value={formData.atk1dmg} onChange={(e) => setFormData({ ...formData, atk1dmg: Number(e.target.value) })} placeholder="Mobile Suit Skill 1 DMG" disabled={!!selectedMS} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        <div className="form-group col-span-2">
                            <label htmlFor="atk2" className="px-2 mb-1 font-bold">Skill 2</label>
                            <input type="text" value={formData.atk2} onChange={(e) => setFormData({ ...formData, atk2: e.target.value })} placeholder="Mobile Suit Skill 2" disabled={!!selectedMS} />
                        </div>
                        <div className="form-group col-span-1">
                            <label htmlFor="atk2dmg" className="px-2 mb-1 font-bold">Dmg</label>
                            <input type="number" value={formData.atk2dmg} onChange={(e) => setFormData({ ...formData, atk2dmg: Number(e.target.value) })} placeholder="Mobile Suit Skill 2 DMG" disabled={!!selectedMS} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        <div className="form-group col-span-2">
                            <label htmlFor="atk3" className="px-2 mb-1 font-bold">Skill 3</label>
                            <input type="text" value={formData.atk3} onChange={(e) => setFormData({ ...formData, atk3: e.target.value })} placeholder="Mobile Suit Skill 3" disabled={!!selectedMS} />
                        </div>
                        <div className="form-group col-span-1">
                            <label htmlFor="atk3dmg" className="px-2 mb-1 font-bold">Dmg</label>
                            <input type="number" value={formData.atk3dmg} onChange={(e) => setFormData({ ...formData, atk3dmg: Number(e.target.value) })} placeholder="Mobile Suit Skill 3 DMG" disabled={!!selectedMS} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2 mt-2 border-t border-border-color pt-4">
                <button type="button" className="btn-primary" onClick={() => handleChangeUnit(formData)}>Change Unit</button>
            </div>
        </div>
    );
}
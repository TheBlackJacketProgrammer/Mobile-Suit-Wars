"use client";

import { mobile_suits } from "../generated/prisma/client";
import { saveMobileSuit } from "@/app/actions/saveMobileSuit";
import { useRouter } from "next/navigation";
import {
  useState,
  useRef,
  useTransition,
  useCallback,
  type ChangeEvent,
} from "react";
import Image from "next/image";
import { pictureToImageSrc } from "@/lib/pictureToImgSrc";

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

type UploadApiResponse = { url?: string; error?: string };

export default function FormMobileSuit({
  selectedMS,
  onClearSelection,
}: {
  selectedMS: mobile_suits | null;
  onClearSelection: () => void;
}) {
  const [formData, setFormData] = useState<mobile_suits>(() =>
    selectedMS ?? emptyMobileSuit()
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isSavePending, startSaveTransition] = useTransition();
  const imageSrc = pictureToImageSrc(formData.ms_pic ?? "");
  const hasImageSrc = imageSrc != null;

  const resetAfterSuccessfulSave = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadError(null);
    onClearSelection();
    setFormData(emptyMobileSuit());
    router.refresh();
  }, [onClearSelection, router]);

  const handleImageUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as UploadApiResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }
      const url = data.url;
      if (!url) {
        throw new Error("Upload did not return a URL");
      }
      setFormData((prev) => ({ ...prev, ms_pic: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, []);

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
                <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={handleImageUpload}
                />
                {uploadError ? (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {uploadError}
                  </p>
                ) : null}
                <button
                type="button"
                className="btn-primary w-full mt-2"
                disabled={isUploading || isSavePending}
                onClick={() => fileInputRef.current?.click()}
                >
                {isUploading ? "Uploading…" : "Upload Image"}
                </button>
            </div>
            <div className="col-span-1 flex flex-col gap-2">
                <div className="form-group">
                    <label htmlFor="ms_name" className="px-2 mb-1 font-bold">Mobile Suit Name</label>
                    <input type="text" value={formData.ms_name ?? ""} onChange={(e) => setFormData({ ...formData, ms_name: e.target.value })} placeholder="Mobile Suit Name" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_mid" className="px-2 mb-1 font-bold">MS Code</label>
                        <input type="text" value={formData.ms_mid ?? ""} onChange={(e) => setFormData({ ...formData, ms_mid: e.target.value })} placeholder="Mobile Suit MID" />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_cost" className="px-2 mb-1 font-bold">Cost</label>
                        <input
                          type="number"
                          value={formData.ms_cost ?? 0}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ms_cost: Number(e.target.value),
                            })
                          }
                          placeholder="Mobile Suit Cost"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_armor" className="px-2 mb-1 font-bold">Armor</label>
                        <input type="number" value={formData.ms_armor ?? 0} onChange={(e) => setFormData({ ...formData, ms_armor: Number(e.target.value) })} placeholder="Mobile Suit Armor" />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_level" className="px-2 mb-1 font-bold">Level</label>
                        <input type="number" value={formData.ms_level ?? 1} onChange={(e) => setFormData({ ...formData, ms_level: Number(e.target.value) })} placeholder="Mobile Suit Level" />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_exp" className="px-2 mb-1 font-bold">Exp</label>
                        <input type="number" value={formData.ms_exp ?? 0} onChange={(e) => setFormData({ ...formData, ms_exp: Number(e.target.value) })} placeholder="Mobile Suit Experience" />
                    </div>
                </div>
                <div className="form-group col-span-1">
                    <label htmlFor="ms_basicAtkdmg" className="px-2 mb-1 font-bold">Basic Atk Dmg</label>
                    <input type="number" value={formData.ms_basicAtkdmg ?? 0} onChange={(e) => setFormData({ ...formData, ms_basicAtkdmg: Number(e.target.value) })} placeholder="Mobile Suit Basic Atk DMG" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="form-group col-span-2">
                        <label htmlFor="ms_atk1" className="px-2 mb-1 font-bold">Skill 1</label>
                        <input type="text" value={formData.ms_atk1 ?? ""} onChange={(e) => setFormData({ ...formData, ms_atk1: e.target.value })} placeholder="Mobile Suit Skill 1" />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_atk2" className="px-2 mb-1 font-bold">Dmg</label>
                        <input type="number" value={formData.ms_atk1dmg ?? 0} onChange={(e) => setFormData({ ...formData, ms_atk1dmg: Number(e.target.value) })} placeholder="Mobile Suit Skill 1 DMG" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="form-group col-span-2">
                        <label htmlFor="ms_atk2" className="px-2 mb-1 font-bold">Skill 2</label>
                        <input type="text" value={formData.ms_atk2 ?? ""} onChange={(e) => setFormData({ ...formData, ms_atk2: e.target.value })} placeholder="Mobile Suit Skill 2" />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_atk2dmg" className="px-2 mb-1 font-bold">Dmg</label>
                        <input type="number" value={formData.ms_atk2dmg ?? 0} onChange={(e) => setFormData({ ...formData, ms_atk2dmg: Number(e.target.value) })} placeholder="Mobile Suit Skill 2 DMG" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="form-group col-span-2">
                        <label htmlFor="ms_atk3" className="px-2 mb-1 font-bold">Skill 3</label>
                        <input type="text" value={formData.ms_atk3 ?? ""} onChange={(e) => setFormData({ ...formData, ms_atk3: e.target.value })} placeholder="Mobile Suit Skill 3" />
                    </div>
                    <div className="form-group col-span-1">
                        <label htmlFor="ms_atk3dmg" className="px-2 mb-1 font-bold">Dmg</label>
                        <input type="number" value={formData.ms_atk3dmg ?? 0} onChange={(e) => setFormData({ ...formData, ms_atk3dmg: Number(e.target.value) })} placeholder="Mobile Suit Skill 3 DMG" />
                    </div>
                </div>
            </div>
        </div>
        <div className="flex flex-col gap-2 mt-2 border-t border-border-color pt-4">
            {saveError ? (
              <p className="text-sm text-red-600" role="alert">
                {saveError}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={isSavePending}
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.value = "";
                setSaveError(null);
                setUploadError(null);
                onClearSelection();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={isSavePending}
              onClick={() => {
                setSaveError(null);
                startSaveTransition(async () => {
                  const result = await saveMobileSuit(formData);
                  if (!result.ok) {
                    setSaveError(result.error);
                    return;
                  }
                  resetAfterSuccessfulSave();
                });
              }}
            >
              {isSavePending ? "Saving…" : "Save"}
            </button>
            </div>
        </div>
    </div>
    
  );
}
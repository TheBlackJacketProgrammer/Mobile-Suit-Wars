"use client";

export default function BtnGStageSettings() {
    return (
        <button className="btn-primary" onClick={() => document.getElementById("modalGStageSettings")?.classList.remove("hidden")}>G-Stage Settings</button>
    );
}
"use client";

export default function BtnGStageSettings() {

    function handleToggleModal() {
        document.getElementById("modalGStageSettings")?.classList.remove("hidden");
        document.getElementById("modalGStageSettings")?.classList.add("flex");
        document.getElementById("modalGStageSettings")?.classList.add("justify-start");
        document.getElementById("modalGStageSettings")?.classList.add("items-center");
        document.getElementById("modalGStageSettings")?.classList.add("flex-col");
        document.querySelector("body")?.classList.add("modal-open");
    }

    return (
        <button className="btn-primary" onClick={handleToggleModal}>G-Stage Settings</button>
    );
}
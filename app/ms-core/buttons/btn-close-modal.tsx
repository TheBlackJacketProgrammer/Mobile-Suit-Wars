"use client";

export default function BtnCloseModal() {

    function handleCloseModal() {
        document.getElementById("modalGStageSettings")?.classList.remove("flex");
        document.getElementById("modalGStageSettings")?.classList.remove("justify-start");
        document.getElementById("modalGStageSettings")?.classList.remove("items-center");
        document.getElementById("modalGStageSettings")?.classList.remove("flex-col");
        document.getElementById("modalGStageSettings")?.classList.remove("flex-col");
        document.getElementById("modalGStageSettings")?.classList.add("hidden");
        document.querySelector("body")?.classList.remove("modal-open");
    }

    return (
        <button type="button" className="btn-close text-3-dark" onClick={handleCloseModal}>
            <span className="sr-only">Close</span>
            <span aria-hidden="true">&times;</span>
        </button>
    );
}
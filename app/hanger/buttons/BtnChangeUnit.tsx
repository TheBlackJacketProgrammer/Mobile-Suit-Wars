"use client";

export default function BtnChangeUnit( { ms_mid }: { ms_mid: string } ) {
    function handleToggleModal() {
        document.getElementById("modalChangeUnit")?.classList.remove("hidden");
        document.getElementById("modalChangeUnit")?.classList.add("flex");
        document.getElementById("modalChangeUnit")?.classList.add("justify-start");
        document.getElementById("modalChangeUnit")?.classList.add("items-center");
        document.getElementById("modalChangeUnit")?.classList.add("flex-col");
        document.getElementById("modalChangeUnit")?.setAttribute("data-ms-mid", ms_mid.toString());
    }

    return (
        <button type="button" className="btn-secondary" onClick={handleToggleModal}>
            <p className="p-base">Change Unit</p>
        </button>
    );
}

"use client";

export default function BtnDelete({ ms_mid }: { ms_mid: string }) {
    function handleDelete(ms_mid: string) {
        console.log(ms_mid);
    }
    return (
        <button className="btn-secondary" onClick={() => handleDelete(ms_mid)}>Delete</button>
    );
}
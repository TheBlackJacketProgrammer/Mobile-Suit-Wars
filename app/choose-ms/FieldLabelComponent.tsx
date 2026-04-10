"use client"

type Props = {
    label: string;
    data: string;
};

export default function ImageComponent({label, data} : Props) {
    
    return (
        <>
            <div className="flex flex-row items-start justify-start gap-2">
                <label className="text-3-dark font-bold m-0">{label ?? ""}</label>
                <p className="text-3-dark m-0">{data ?? ""}</p>
            </div>
        </>
    );
}
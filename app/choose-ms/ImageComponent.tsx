"use client"

import Image from "next/image";

type Props = {
    ms_image: string;
};

export default function ImageComponent({ms_image} : Props) {
    
    return (
        <>
            <Image src={ms_image} width={100} height={100} alt="MS Image" />
        </>
    );
}
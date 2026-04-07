"use client";

import { useState } from "react";
import type { mobile_suits } from "../generated/prisma/client";
import MobileSuitTable from "./MobileSuitTable";
import FormMobileSuit from "./FormMobileSuit";

// Props for the MSCoreClient component
type Props = {
  mobileSuits: mobile_suits[];
  page: number;
  total: number;
};

export default function MSCoreClient({ mobileSuits, page, total }: Props) { // Destructure the props

  // State to store the selected mobile suit for editing
  const [selectedMS, setSelectedMS] = useState<mobile_suits | null>(null);

  return (
    <>
      <MobileSuitTable
        mobileSuits={mobileSuits}
        page={page}
        total={total}
        onEdit={setSelectedMS}
      />
      <FormMobileSuit
        key={selectedMS ? `${selectedMS.ms_id}-${selectedMS.ms_mid}` : "draft"}
        selectedMS={selectedMS}
        onClearSelection={() => setSelectedMS(null)}
      />
    </>
  );
}

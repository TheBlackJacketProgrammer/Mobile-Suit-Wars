import MSCoreClient from "./MSCoreClient";
import prisma from "@/lib/prisma";
import BtnGStageSettings from "./buttons/btn-gstage-settings";
import ModalGStageSettings from "./modals/ModalGStageSettings";

const PAGE_SIZE = 10;

type MsCoreSearchParams = {
    page?: string;
    search?: string;
};

export default async function MSCore({searchParams}: {searchParams: MsCoreSearchParams;}) {
  const { page: pageParam, search: searchParam } = await searchParams;
  const search = searchParam ?? "";
  const page = Math.max(1, Number(pageParam) || 1);

  const where = search
  ? {
      ms_name: {
        contains: search,
      },
    }
  : {};

  const mobileSuits = await prisma.mobile_suits.findMany({
    where,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const total = await prisma.mobile_suits.count({ where });
  return (
    <section className="full-bleed ms-core-section">
      <div className="flex flex-row items-start justify-start gap-4 mb-4 p-4 bg-white rounded-sm shadow">
        <BtnGStageSettings />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start justify-start">
        <MSCoreClient mobileSuits={mobileSuits} page={page} total={total} />
      </div>
      <ModalGStageSettings />
    </section>
  );
}
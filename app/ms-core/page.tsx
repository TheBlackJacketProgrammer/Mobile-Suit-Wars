import MSCoreClient from "./MSCoreClient";
import prisma from "@/lib/prisma";
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start justify-start">
            <MSCoreClient mobileSuits={mobileSuits} page={page} total={total} />
        </div>
    </section>
  );
}
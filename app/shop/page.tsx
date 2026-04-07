import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getMSLineUp } from "@/lib/getMSLineUp";
import { getUserGPoints } from "@/app/actions/getUserGPoints";
import Image from "next/image";
import ShopContainer from "./ShopContainer";
import prisma from "@/lib/prisma";
const PAGE_SIZE = 10;

type ShopSearchParams = {
    page?: string;
    search?: string;
};


export default async function Shop({searchParams}: {searchParams: ShopSearchParams;}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const gPoints = await getUserGPoints(Number(userId));

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
    <section className="full-bleed shop-section">
      <div className="shop-container">
        <div className="flex flex-row gap-2 items-center justify-center g-points-container">
          <label htmlFor="G-Points" className="text-3-dark">G-Points</label>
          <input type="number" id="G-Points" name="G-Points" className="txtbox-gpoints" readOnly value={gPoints} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start justify-start mt-4">
          <ShopContainer mobileSuits={mobileSuits} page={page} total={total} />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";

export default function Pagination({ page, total }: { page: number, total: number }) {
  const router = useRouter();
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="flex justify-center items-center gap-2">
      {Array.from({ length: totalPages }).map((_, i) => {
        const pageNum = i + 1;
        const isActive = page === pageNum;
        return (
        <button
          type="button"
          className={`btn-pagination${isActive ? " btn-pagination--active" : ""}`}
          key={pageNum}
          aria-current={isActive ? "page" : undefined}
          onClick={() => router.push(`/ms-core?page=${pageNum}`)}
        >
          {pageNum}
        </button>
        );
      })}
    </div>
  );
}
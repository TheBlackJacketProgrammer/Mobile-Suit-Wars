"use client";

import { mobile_suits } from "../generated/prisma/client";

import Pagination from "./Pagination";
import BtnEdit from "./buttons/btn-edit";
import BtnDelete from "./buttons/btn-delete";

export default function MobileSuitTable({mobileSuits, page, total, onEdit}: {
  mobileSuits: mobile_suits[];
  page: number;
  total: number;
  onEdit: (ms: mobile_suits) => void;
}) {

    return (
        <div className="table-container">
            <table className="w-full table-auto mb-2">
                <thead>
                    <tr>
                        <th>MS ID</th>
                        <th>Name</th>
                        <th>Cost</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {mobileSuits.map((ms: mobile_suits) => (
                        <tr key={ms.ms_mid ?? String(ms.ms_id)}>
                            <td>{ms.ms_mid ?? ""}</td>
                            <td>{ms.ms_name ?? ""}</td>
                            <td>{ms.ms_cost ?? 0}</td>
                            <td>
                                <div className="flex gap-2 justify-center items-center">
                                    <BtnEdit onEdit={() => onEdit(ms)} />
                                    <BtnDelete ms_mid={ms.ms_mid ?? ""} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination page={page} total={total} />
        </div>
    );
}
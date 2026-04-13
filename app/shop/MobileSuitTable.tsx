"use client";

import { mobile_suits } from "../generated/prisma/client";

import Pagination from "./Pagination";
import BtnView from "./buttons/btn-view";

export default function MobileSuitTable({mobileSuits, page, total, onView}: {
  mobileSuits: mobile_suits[];
  page: number;
  total: number;
  onView: (ms: mobile_suits) => void;
}) {

    return (
        <div className="table-container">
            <table className="w-full table-auto mb-2">
                <thead>
                    <tr>
                        <th id="col-msid">MS ID</th>
                        <th>Name</th>
                        <th>Cost</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {mobileSuits.map((ms: mobile_suits) => (
                        <tr key={ms.ms_mid}>
                            <td id="row-msid">{ms.ms_mid}</td>
                            <td>{ms.ms_name}</td>
                            <td>{ms.ms_cost}</td>
                            <td>
                                <div className="flex gap-2 justify-center items-center">
                                    <BtnView onView={() => onView(ms)} />
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
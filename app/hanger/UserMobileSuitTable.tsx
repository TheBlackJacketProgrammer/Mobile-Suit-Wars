"use client";

import Pagination from "./Pagination";
import BtnView from "./buttons/BtnView";

type UserMobileSuit = {
    mid: string;
    name: string;
    pic: string;
    armor: number;
    level: number;
    exp: number;
    atk1: string;
    atk2: string;
    atk3: string;
    atk1dmg: number;
    atk2dmg: number;
    atk3dmg: number;
    isOnLineup: string;
};

export default function UserMobileSuitTable({userMobileSuits, page, total, onView}: {
    userMobileSuits: UserMobileSuit[];
    page: number;
    total: number;
    onView: (ms: UserMobileSuit) => void;
}) {
    return (
        <>
            <div className="table-container">
                <table className="w-full table-auto mb-2">
                    <thead>
                        <tr>
                            <th>MS ID</th>
                            <th>Name</th>
                            <th>Level</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userMobileSuits.map((userMobileSuit: UserMobileSuit) => (
                            <tr key={userMobileSuit.mid}>
                                <td>{userMobileSuit.mid}</td>
                                <td>{userMobileSuit.name}</td>
                                <td>{userMobileSuit.level}</td>
                                <td>
                                    <BtnView onView={() => onView(userMobileSuit)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Pagination page={page} total={total} />
            </div>
        </>
    );
}


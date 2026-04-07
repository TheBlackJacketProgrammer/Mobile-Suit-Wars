"use client";

import { useState, useEffect, useCallback } from "react";
import UserMobileSuitTable from "./UserMobileSuitTable";
import { getUserMobileSuits } from "../actions/getUserMobileSuits";
import UserMobileSuitForm from "./UserMobileSuitForm";

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

export default function TableFormContainer() {
    const [selectedMS, setSelectedMS] = useState<UserMobileSuit | null>(null);
    const [userMobileSuits, setUserMobileSuits] = useState<UserMobileSuit[]>([]);
    const [loading, setLoading] = useState(true);

    const page = 1;

    const loadSuits = useCallback(async (opts?: { silent?: boolean }) => {
        if (!opts?.silent) setLoading(true);
        try {
            const data = await getUserMobileSuits();
            setUserMobileSuits(data);
        } finally {
            if (!opts?.silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSuits();
    }, [loadSuits]);

    const total = userMobileSuits.length;

    if (loading && userMobileSuits.length === 0) {
        return <p className="text-3-dark p-base">Loading suits…</p>;
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <UserMobileSuitTable
                    userMobileSuits={userMobileSuits}
                    page={page}
                    total={total}
                    onView={setSelectedMS}
                />
                <UserMobileSuitForm
                    key={selectedMS ? `${selectedMS.mid}-${selectedMS.name}` : "draft"}
                    selectedMS={selectedMS}
                    onClearSelection={() => setSelectedMS(null)}
                    onChangeUnitSuccess={() => loadSuits({ silent: true })}
                />
            </div>
        </>
    );
}

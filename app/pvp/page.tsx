"use client";

import MainNavbar from "@/components/MainNavbar";
import { useState } from "react";
import { searchUsername } from "../actions/searchUsername";
import { setPvpEnemy } from "../actions/setPvpEnemy";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function PvP() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const handleSearch = async () => {
        if (!username || username.trim() === "") {
            toast.error(`Please enter a username to search.`);
            return;
        }

        try {
            const result = await searchUsername(username);
            if (result) {
                await setPvpEnemy(result);
                router.push("/battle-arena");
            } 
            else {
                toast.error(`User "${username}" not found.`);
            }
        } 
        catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <MainNavbar />
            <section className="pvp-container">
                <div className="flex flex-col search-player-card">
                    <div className="card-header">
                        <h3 className="m-0 text-white font-bold text-xl text-center">Search for Opponent</h3>
                    </div>
                    <div className="card-body flex flex-col items-center justify-center gap-4">
                        <div className="w-full flex items-center justify-center">
                            <input type="text" id="search_username" className="txt-search" placeholder="Input Username here. . . " value={username} onChange={(e) => setUsername(e.target.value)}    />
                        </div>
                        <div className="w-full lg:w-auto">
                            <button className="btn btn-primary w-full lg:w-auto" onClick={() => { void handleSearch(); }}>
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

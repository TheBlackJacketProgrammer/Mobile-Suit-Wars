"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { playHoverSound, playSound } from "@/lib/playSound";

const BTN_SOUND = "/sounds/bgm-btn-clicked.wav";
const HOVER_SOUND = "/sounds/bgm-btn-hover.wav";



function handleLogout() {
    playSound(BTN_SOUND, { volume: 0.55 });
    void signOut({ callbackUrl: "/", redirect: true });
}

export default function MainNavbar() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.type === "Admin";

    return (
        <header id="main-navbar">
            <section>
                <nav className="site-nav">
                    <div className="site-logo">
                        <Link href="/">
                            <Image src="/images/logo.png" alt="Logo" width={100} height={100} />
                        </Link>
                    </div>

                    <div className="site-nav-links">
                        <Link href="/battle-arena" onMouseEnter={() => playHoverSound(HOVER_SOUND)} onClick={() => playSound(BTN_SOUND, { volume: 0.55 })}>
                            Battle Arena
                        </Link>
                        <Link href="/hanger" onMouseEnter={() => playHoverSound(HOVER_SOUND)} onClick={() => playSound(BTN_SOUND, { volume: 0.55 })}>
                            Hanger
                        </Link>
                        <Link href="/shop" onMouseEnter={() => playHoverSound(HOVER_SOUND)} onClick={() => playSound(BTN_SOUND, { volume: 0.55 })}>
                            Shop
                        </Link>
                        {isAdmin ? (
                            <Link href="/ms-core" onMouseEnter={() => playHoverSound(HOVER_SOUND)} onClick={() => playSound(BTN_SOUND, { volume: 0.55 })}>
                                MS Core
                            </Link>
                        ) : null}
                        <Link href="/leaderboard" onMouseEnter={() => playHoverSound(HOVER_SOUND)} onClick={() => playSound(BTN_SOUND, { volume: 0.55 })}>
                            Leaderboard
                        </Link>
                        <button
                            type="button"
                            onMouseEnter={() => playHoverSound(HOVER_SOUND)}
                            onClick={() => {
                                playSound(BTN_SOUND, { volume: 0.55 });
                                void handleLogout();
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </section>
        </header>
    );
}
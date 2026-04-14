"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleNavClick = () => {
        setMobileMenuOpen(false);
        playSound(BTN_SOUND, { volume: 0.55 });
    };

    const handleLogoutClick = () => {
        setMobileMenuOpen(false);
        handleLogout();
    };

    return (
        <header id="main-navbar">
            <section>
                <nav className="site-nav">
                    <div className="site-logo">
                        <Link href="/">
                            <Image src="/images/logo.png" alt="Logo" width={100} height={100} />
                        </Link>
                    </div>

                    {/* Hamburger Menu Button */}
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => {
                            setMobileMenuOpen(!mobileMenuOpen);
                            playSound(BTN_SOUND, { volume: 0.55 });
                        }}
                        aria-label="Toggle menu"
                    >
                        <span className="hamburger-icon text-white"></span>
                        <span className="hamburger-icon text-white"></span>
                        <span className="hamburger-icon text-white"></span>
                    </button>

                    {/* Desktop Navigation */}
                    <div className={`site-nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
                        <Link 
                            href="/battle-arena" 
                            onMouseEnter={() => playHoverSound(HOVER_SOUND)} 
                            onClick={() => handleNavClick()}
                        >
                            Battle Arena
                        </Link>
                        <Link 
                            href="/hanger" 
                            onMouseEnter={() => playHoverSound(HOVER_SOUND)} 
                            onClick={() => handleNavClick()}
                        >
                            Hanger
                        </Link>
                        <Link 
                            href="/shop" 
                            onMouseEnter={() => playHoverSound(HOVER_SOUND)} 
                            onClick={() => handleNavClick()}
                        >
                            Shop
                        </Link>
                        {isAdmin ? (
                            <Link 
                                href="/ms-core" 
                                onMouseEnter={() => playHoverSound(HOVER_SOUND)} 
                                onClick={() => handleNavClick()}
                            >
                                MS Core
                            </Link>
                        ) : null}
                        <Link 
                            href="/pvp" 
                            onMouseEnter={() => playHoverSound(HOVER_SOUND)} 
                            onClick={() => handleNavClick()}
                        >
                            PvP
                        </Link>
                        <Link 
                            href="/leaderboard" 
                            onMouseEnter={() => playHoverSound(HOVER_SOUND)} 
                            onClick={() => handleNavClick()}
                        >
                            Leaderboard
                        </Link>
                        <button
                            type="button"
                            onMouseEnter={() => playHoverSound(HOVER_SOUND)}
                            onClick={() => handleLogoutClick()}
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </section>
        </header>
    );
}
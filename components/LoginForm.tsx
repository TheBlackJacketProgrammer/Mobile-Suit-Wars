"use client";

import { signIn } from "next-auth/react";
import { playHoverSound, playSound } from "@/lib/playSound";

const BTN_SOUND = "/sounds/bgm-btn-clicked.wav";
const HOVER_SOUND = "/sounds/bgm-btn-hover.wav";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  async function handleLogin() {
    if (!username.trim() || !password) {
      toast.error("Enter username and password.");
      return;
    }
    setPending(true);
    try {
      const res = await signIn("credentials", {
        username: username.trim(),
        password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Invalid username or password.");
        return;
      }
      // toast.success("Signed in successfully.");
      router.refresh();
      router.push("/dashboard");
      setIsLoggedIn(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={`full-bleed ${isLoggedIn ? "hidden" : ""}`}>
      <div className="login-container">
        <div>
          <h2 className="text-3-dark">Login</h2>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            id="username"
            name="username"
            className="py-2 px-3 textbox"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="flex flex-col">
          <input
            type="password"
            id="password"
            name="password"
            className="py-2 px-3 textbox"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            className="btn-primary"
            type="button"
            onMouseEnter={() => {
              if (!pending) playHoverSound(HOVER_SOUND);
            }}
            onClick={() => {
              playSound(BTN_SOUND, { volume: 0.55 });
              void handleLogin();
            }}
            disabled={pending}
          >
            {pending ? "Signing in…" : "Login"}
          </button>
          <Link href="/register" className="btn-secondary">Register</Link>
        </div>
      </div>
    </section>
  );
}

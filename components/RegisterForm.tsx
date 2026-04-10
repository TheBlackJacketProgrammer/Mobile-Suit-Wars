"use client";

import { playHoverSound, playSound } from "@/lib/playSound";
import { signIn } from "next-auth/react";

const BTN_SOUND = "/sounds/bgm-btn-clicked.wav";
const HOVER_SOUND = "/sounds/bgm-btn-hover.wav";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

type RegisterPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleRegister() {
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedUsername || !trimmedEmail || !password) {
      toast.error("Please fill out all fields.");
      return;
    }
    setPending(true);
    try {
      const payload: RegisterPayload = {
        name: trimmedName,
        username: trimmedUsername,
        email: trimmedEmail,
        password
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        toast.error(data?.error || "Registration failed.");
        console.error(res);
        return;
      }

      // Auto-login after successful registration
      const signInRes = await signIn("credentials", {
        username: trimmedUsername,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        toast.success("Registered successfully. Please log in.");
        router.push("/");
        return;
      }

      router.refresh();
      router.push("/choose-ms");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="full-bleed">
      <div className="login-container">
        <div>
          <h2 className="text-3-dark">Register</h2>
        </div>
        <div className="flex flex-col">
          <input
            type="text"
            id="name"
            name="name"
            className="py-2 px-3 textbox"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
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
            type="email"
            id="email"
            name="email"
            className="py-2 px-3 textbox"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
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
            autoComplete="new-password"
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
              void handleRegister();
            }}
            disabled={pending}
          >
            {pending ? "Creating account…" : "Register"}
          </button>
          <Link href="/" className="btn-secondary">
            Back to login
          </Link>
        </div>
      </div>
    </section>
  );
}

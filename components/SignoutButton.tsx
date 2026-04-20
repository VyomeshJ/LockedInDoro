"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
    onClick={() => signOut({ callbackUrl: "/" })}
    className="absolute top-6 left-6 px-4 py-2 rounded bg-[#2c3c3f] text-white font-pixel hover:bg-[#3a4d50]"
    >
    Sign out
    </button>
  );
}
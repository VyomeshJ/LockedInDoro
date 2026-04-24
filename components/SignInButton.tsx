"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function SignInButton() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isLoggedIn = !!session?.user;

  return (
    <div className="relative">
      {isLoggedIn ? (
        <div className="relative">
          <Image
            src={session.user.image || "/Images/default-avatar.png"}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-md cursor-pointer border-2 border-[#2c3c3f]"
            onClick={() => setOpen((prev) => !prev)}
          />

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-[#2c3c3f] rounded-xl shadow-lg p-3 flex flex-col gap-2 font-pixel">
              <span className="text-sm opacity-80 truncate">
                {session.user.name}
              </span>
              <span className="text-xs opacity-60 truncate">
                {session.user.email}
              </span>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mt-2 px-3 py-2 rounded bg-white hover:bg-[#dddddd] text-[#2c3c3f]"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="px-4 py-2 rounded bg-white text-[#2c3c3f] font-pixel hover:bg-[#dddddd] whitespace-nowrap"
        >
          Sign in
        </button>
      )}
    </div>
  );
}
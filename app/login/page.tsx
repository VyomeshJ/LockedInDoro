"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    signIn("google", {
      callbackUrl: "/",
      prompt: "select_account",
    });
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center font-pixel text-xl">
      Redirecting to Google...
    </div>
  );
}
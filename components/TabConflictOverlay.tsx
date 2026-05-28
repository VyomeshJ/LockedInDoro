"use client";

import { useEffect, useRef, useState } from "react";

type TabConflictOverlayProps = {
  isLoggedIn: boolean;
  userId?: string | null;
};

type PresenceResponse = {
  activeCount?: number;
};

const HEARTBEAT_MS = 2500;
const PRESENCE_URL = "/api/presence";

function createTabId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function sendPresence(tabId: string, action: "heartbeat" | "close") {
  const response = await fetch(PRESENCE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, tabId }),
    keepalive: action === "close",
  });

  if (!response.ok) return null;

  return (await response.json()) as PresenceResponse;
}

function sendCloseBeacon(tabId: string) {
  const payload = JSON.stringify({ action: "close", tabId });

  if (navigator.sendBeacon) {
    const body = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon(PRESENCE_URL, body)) return;
  }

  void fetch(PRESENCE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
    keepalive: true,
  });
}

export default function TabConflictOverlay({
  isLoggedIn,
  userId,
}: TabConflictOverlayProps) {
  const tabIdRef = useRef<string | null>(null);
  const [hasConflict, setHasConflict] = useState(false);
  const presenceKey = isLoggedIn && userId ? userId : null;

  useEffect(() => {
    if (!presenceKey) {
      return;
    }

    tabIdRef.current = tabIdRef.current ?? createTabId();
    const tabId = tabIdRef.current;
    let isActive = true;

    const heartbeat = async () => {
      const result = await sendPresence(tabId, "heartbeat");
      if (!isActive || !result) return;

      setHasConflict((result.activeCount ?? 0) > 1);
    };

    const handlePageHide = () => {
      isActive = false;
      sendCloseBeacon(tabId);
    };

    const initialHeartbeatId = window.setTimeout(() => {
      void heartbeat();
    }, 0);
    const intervalId = window.setInterval(() => {
      void heartbeat();
    }, HEARTBEAT_MS);

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      isActive = false;
      window.clearTimeout(initialHeartbeatId);
      window.clearInterval(intervalId);
      window.removeEventListener("pagehide", handlePageHide);
      sendCloseBeacon(tabId);
    };
  }, [presenceKey]);

  if (!presenceKey || !hasConflict) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#182229]/95 px-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-lg bg-[#2c3c3f] p-6 text-white shadow-2xl">
        <h1 className="font-pixel text-[clamp(2.25rem,12vw,3.75rem)] leading-none">
          Close one tab
        </h1>

        <p className="font-pixel text-[clamp(1.25rem,6vw,1.5rem)] leading-tight">
          This account is already open on another tab or device.
        </p>
      </div>
    </div>
  );
}

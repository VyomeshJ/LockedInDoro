"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TabConflictOverlayProps = {
  isLoggedIn: boolean;
  userId?: string | null;
};

type TabPresenceRecord = {
  id: string;
  lastSeen: number;
};

const HEARTBEAT_MS = 1500;
const ACTIVE_WINDOW_MS = 5000;
const STORAGE_PREFIX = "lockedindoro:open-tabs:";
const CHANNEL_NAME = "lockedindoro-tab-presence";

function createTabId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readPresenceRecords(storageKey: string): TabPresenceRecord[] {
  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) return [];

    const value: unknown = JSON.parse(rawValue);
    if (!Array.isArray(value)) return [];

    return value.filter(
      (record): record is TabPresenceRecord =>
        typeof record === "object" &&
        record !== null &&
        "id" in record &&
        "lastSeen" in record &&
        typeof record.id === "string" &&
        typeof record.lastSeen === "number"
    );
  } catch {
    return [];
  }
}

function writePresenceRecords(
  storageKey: string,
  records: TabPresenceRecord[]
) {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

export default function TabConflictOverlay({
  isLoggedIn,
  userId,
}: TabConflictOverlayProps) {
  const tabIdRef = useRef<string | null>(null);
  const [hasConflict, setHasConflict] = useState(false);

  const storageKey = useMemo(() => {
    if (!isLoggedIn || !userId) return null;
    return `${STORAGE_PREFIX}${encodeURIComponent(userId)}`;
  }, [isLoggedIn, userId]);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    tabIdRef.current = tabIdRef.current ?? createTabId();
    const tabId = tabIdRef.current;
    const channel =
      "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;

    const refreshPresence = () => {
      const now = Date.now();
      const activeRecords = readPresenceRecords(storageKey).filter(
        (record) => now - record.lastSeen < ACTIVE_WINDOW_MS
      );
      const otherRecords = activeRecords.filter((record) => record.id !== tabId);
      const nextRecords = [...otherRecords, { id: tabId, lastSeen: now }];

      writePresenceRecords(storageKey, nextRecords);
      setHasConflict(nextRecords.length > 1);
      channel?.postMessage({ storageKey });
    };

    const removePresence = () => {
      const nextRecords = readPresenceRecords(storageKey).filter(
        (record) => record.id !== tabId
      );

      writePresenceRecords(storageKey, nextRecords);
      channel?.postMessage({ storageKey });
    };

    const syncPresence = () => {
      const now = Date.now();
      const activeRecords = readPresenceRecords(storageKey).filter(
        (record) => now - record.lastSeen < ACTIVE_WINDOW_MS
      );

      if (activeRecords.length === 0) {
        setHasConflict(false);
        return;
      }

      writePresenceRecords(storageKey, activeRecords);
      setHasConflict(activeRecords.length > 1);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) syncPresence();
    };

    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data?.storageKey === storageKey) syncPresence();
    };

    const initialSyncId = window.setTimeout(refreshPresence, 0);
    const intervalId = window.setInterval(refreshPresence, HEARTBEAT_MS);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("pagehide", removePresence);
    channel?.addEventListener("message", handleBroadcastMessage);

    return () => {
      window.clearTimeout(initialSyncId);
      window.clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("pagehide", removePresence);
      channel?.removeEventListener("message", handleBroadcastMessage);
      removePresence();
      channel?.close();
    };
  }, [storageKey]);

  if (!storageKey || !hasConflict) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#182229]/95 px-6 text-center">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-lg bg-[#2c3c3f] p-6 text-white shadow-2xl">
        <h1 className="font-pixel text-[clamp(2.25rem,12vw,3.75rem)] leading-none">
          Close one tab
        </h1>

        <p className="font-pixel text-[clamp(1.25rem,6vw,1.5rem)] leading-tight">
          This account is already open in another tab.
        </p>
      </div>
    </div>
  );
}

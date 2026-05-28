"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type TimerProps = {
  isLoggedIn: boolean;
  initialStudyMinutes: number;
  initialBreakMinutes: number;
};

const APP_TITLE = "LockedInDoro";

function formatTimerTitle(seconds: number, mode: "Study" | "Break") {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")} ${mode} | ${APP_TITLE}`;
}

export default function Timer({
  isLoggedIn,
  initialStudyMinutes,
  initialBreakMinutes,
}: TimerProps) {
  const bellRef = useRef<HTMLAudioElement | null>(null);
  const minuteAccumulatorRef = useRef(0);
  const activeDeadlineRef = useRef<number | null>(null);
  const studyProgressSyncedAtRef = useRef<number | null>(null);
  const finishHandledRef = useRef(false);
  const router = useRouter();

  const [defaultStudyingTime, setDefaultStudyingTime] = useState(
    initialStudyMinutes * 60
  );
  const [defaultBreakTime, setDefaultBreakTime] = useState(
    initialBreakMinutes * 60
  );

  const [stateStudying, setStateStudying] = useState(true);

  const [studyingTime, setStudyingTime] = useState(initialStudyMinutes * 60);
  const [studyingIsRunning, setStudyingIsRunning] = useState(false);

  const [breakTime, setBreakTime] = useState(initialBreakMinutes * 60);
  const [breakIsRunning, setBreakIsRunning] = useState(false);

  const studying_minutes = Math.floor(studyingTime / 60);
  const studying_seconds = studyingTime % 60;

  const break_minutes = Math.floor(breakTime / 60);
  const break_seconds = breakTime % 60;

  const updateDocumentTitle = useCallback((seconds: number, mode: "Study" | "Break") => {
    document.title = formatTimerTitle(seconds, mode);
  }, []);

  async function saveTimerSettings(studyMinutes: number, breakMinutes: number) {
    if (!isLoggedIn) return;

    await fetch("/api/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        default_study_minutes: studyMinutes,
        default_break_minutes: breakMinutes,
      }),
    });
  }

  const recordStudySession = useCallback(async (seconds: number) => {
    if (!isLoggedIn) return;
    if (seconds <= 0) return;

    const res = await fetch("/api/study/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        seconds,
        date: new Date().toLocaleDateString("en-CA"),
      }),
    });

    if (res.ok) {
      router.refresh();
    }
  }, [isLoggedIn, router]);

  const flushStudyAccumulator = useCallback(async () => {
    if (minuteAccumulatorRef.current > 0) {
      const secondsToSave = minuteAccumulatorRef.current;
      minuteAccumulatorRef.current = 0;
      await recordStudySession(secondsToSave);
    }
  }, [recordStudySession]);

  const addStudySeconds = useCallback((seconds: number) => {
    if (seconds <= 0) return;

    minuteAccumulatorRef.current += seconds;

    while (minuteAccumulatorRef.current >= 60) {
      minuteAccumulatorRef.current -= 60;
      void recordStudySession(60);
    }
  }, [recordStudySession]);

  const syncStudyProgress = useCallback((now = Date.now()) => {
    const deadline = activeDeadlineRef.current;
    const syncedAt = studyProgressSyncedAtRef.current;

    if (deadline === null || syncedAt === null) return;

    const cappedNow = Math.min(now, deadline);
    const elapsedSeconds = Math.floor((cappedNow - syncedAt) / 1000);

    if (elapsedSeconds <= 0) return;

    addStudySeconds(elapsedSeconds);
    studyProgressSyncedAtRef.current = syncedAt + elapsedSeconds * 1000;
  }, [addStudySeconds]);

  const clearActiveClock = useCallback(() => {
    activeDeadlineRef.current = null;
    studyProgressSyncedAtRef.current = null;
    finishHandledRef.current = false;
  }, []);

  const pauseStudyTimer = useCallback(async () => {
    syncStudyProgress();
    clearActiveClock();
    setStudyingIsRunning(false);
    await flushStudyAccumulator();
  }, [clearActiveClock, flushStudyAccumulator, syncStudyProgress]);

  useEffect(() => {
    if (!studyingIsRunning || !stateStudying) return;

    const updateRemaining = () => {
      syncStudyProgress();

      const deadline = activeDeadlineRef.current;
      if (deadline === null) return;

      const secondsLeft = Math.max(Math.ceil((deadline - Date.now()) / 1000), 0);

      updateDocumentTitle(secondsLeft, "Study");
      setStudyingTime(secondsLeft);
    };

    updateRemaining();

    const interval = setInterval(updateRemaining, 1000);
    window.addEventListener("visibilitychange", updateRemaining);
    window.addEventListener("focus", updateRemaining);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", updateRemaining);
      window.removeEventListener("focus", updateRemaining);
    };
  }, [studyingIsRunning, stateStudying, syncStudyProgress, updateDocumentTitle]);

  useEffect(() => {
    if (!breakIsRunning || stateStudying) return;

    const updateRemaining = () => {
      const deadline = activeDeadlineRef.current;
      if (deadline === null) return;

      const secondsLeft = Math.max(Math.ceil((deadline - Date.now()) / 1000), 0);

      updateDocumentTitle(secondsLeft, "Break");
      setBreakTime(secondsLeft);
    };

    updateRemaining();

    const interval = setInterval(updateRemaining, 1000);
    window.addEventListener("visibilitychange", updateRemaining);
    window.addEventListener("focus", updateRemaining);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", updateRemaining);
      window.removeEventListener("focus", updateRemaining);
    };
  }, [breakIsRunning, stateStudying, updateDocumentTitle]);

  useEffect(() => {
    if (stateStudying) {
      updateDocumentTitle(studyingTime, "Study");
    } else {
      updateDocumentTitle(breakTime, "Break");
    }

    return () => {
      document.title = APP_TITLE;
    };
  }, [breakTime, stateStudying, studyingTime, updateDocumentTitle]);

  useEffect(() => {
    if (!studyingIsRunning || !stateStudying || studyingTime !== 0) return;
    if (finishHandledRef.current) return;

    finishHandledRef.current = true;

    void (async () => {
      syncStudyProgress();
      bellRef.current?.play();

      await flushStudyAccumulator();

      clearActiveClock();
      setStudyingIsRunning(false);
      setStateStudying(false);
      setStudyingTime(defaultStudyingTime);
      setBreakTime(defaultBreakTime);
    })();
  }, [
    studyingTime,
    studyingIsRunning,
    stateStudying,
    defaultStudyingTime,
    defaultBreakTime,
    clearActiveClock,
    flushStudyAccumulator,
    syncStudyProgress,
  ]);

  useEffect(() => {
    if (!breakIsRunning || stateStudying || breakTime !== 0) return;
    if (finishHandledRef.current) return;

    finishHandledRef.current = true;
    bellRef.current?.play();
    clearActiveClock();
    setBreakIsRunning(false);
    setStateStudying(true);
    setBreakTime(defaultBreakTime);
    setStudyingTime(defaultStudyingTime);
  }, [
    breakTime,
    breakIsRunning,
    stateStudying,
    defaultBreakTime,
    defaultStudyingTime,
    clearActiveClock,
  ]);

  const changeStudyMinutes = async (amount: number) => {
    if (stateStudying && studyingIsRunning) {
      await pauseStudyTimer();
    }

    minuteAccumulatorRef.current = 0;
    clearActiveClock();

    const currentMinutes = defaultStudyingTime / 60;
    const newMinutes = Math.min(60, Math.max(5, currentMinutes + amount));
    const newTime = newMinutes * 60;

    setDefaultStudyingTime(newTime);

    if (stateStudying) {
      setStudyingTime(newTime);
    }

    await saveTimerSettings(newMinutes, defaultBreakTime / 60);
  };

  const changeBreakMinutes = async (amount: number) => {
    if (!stateStudying && breakIsRunning) {
      clearActiveClock();
    }

    setBreakIsRunning(false);

    const currentMinutes = defaultBreakTime / 60;
    const newMinutes = Math.min(60, Math.max(1, currentMinutes + amount));
    const newTime = newMinutes * 60;

    setDefaultBreakTime(newTime);

    if (!stateStudying) {
      setBreakTime(newTime);
    }

    await saveTimerSettings(defaultStudyingTime / 60, newMinutes);
  };

  const handleSwitchToStudying = async () => {
    if (stateStudying) return;

    clearActiveClock();
    setBreakIsRunning(false);
    setStateStudying(true);
    setBreakTime(defaultBreakTime);
    setStudyingTime(defaultStudyingTime);
    minuteAccumulatorRef.current = 0;
  };

  const handleSwitchToBreak = async () => {
    if (!stateStudying) return;

    if (studyingIsRunning) {
      await pauseStudyTimer();
    }

    clearActiveClock();
    setStateStudying(false);
    setStudyingTime(defaultStudyingTime);
    setBreakTime(defaultBreakTime);
    minuteAccumulatorRef.current = 0;
  };

  const handleStartPause = async () => {
    if (stateStudying) {
      if (studyingIsRunning) {
        await pauseStudyTimer();
      } else {
        const now = Date.now();

        activeDeadlineRef.current = now + studyingTime * 1000;
        studyProgressSyncedAtRef.current = now;
        finishHandledRef.current = false;
        setBreakIsRunning(false);
        setStudyingIsRunning(true);
      }
    } else {
      setStudyingIsRunning(false);

      if (breakIsRunning) {
        clearActiveClock();
        setBreakIsRunning(false);
      } else {
        activeDeadlineRef.current = Date.now() + breakTime * 1000;
        finishHandledRef.current = false;
        setBreakIsRunning(true);
      }
    }
  };

  const handleReset = async () => {
    if (stateStudying) {
      if (studyingIsRunning) {
        await pauseStudyTimer();
      }

      clearActiveClock();
      setStudyingTime(defaultStudyingTime);
      minuteAccumulatorRef.current = 0;
    } else {
      clearActiveClock();
      setBreakIsRunning(false);
      setBreakTime(defaultBreakTime);
    }
  };

  return (
    <div className="w-full h-full min-h-0 overflow-y-auto">
      <div className="w-full min-h-full flex flex-col justify-center items-center px-3 sm:px-6 py-4 gap-[clamp(1.25rem,5svh,2.5rem)]">
        <h1 className="font-pixel leading-none text-[clamp(4.75rem,23vw,8rem)] shrink-0 text-center translate-x-[2px] tabular-nums">
          {stateStudying
            ? `${studying_minutes}:${studying_seconds
                .toString()
                .padStart(2, "0")}`
            : `${break_minutes}:${break_seconds.toString().padStart(2, "0")}`}
        </h1>

        <div className="w-full max-w-sm grid grid-cols-2 justify-center items-center shrink-0">
          <div
            className={`px-2 py-2 rounded-md flex flex-row justify-center items-center ${
              stateStudying ? "bg-[#182229]" : "bg-transparent"
            }`}
          >
            <button
              className="font-pixel text-[clamp(1.55rem,8vw,2rem)] leading-none relative"
              onClick={() => {
                void handleSwitchToStudying();
              }}
            >
              Studyingg
            </button>
          </div>

          <div
            className={`px-2 py-2 rounded-md flex flex-row justify-center items-center ${
              !stateStudying ? "bg-[#182229]" : "bg-transparent"
            }`}
          >
            <button
              className="font-pixel text-[clamp(1.55rem,8vw,2rem)] leading-none relative"
              onClick={() => {
                void handleSwitchToBreak();
              }}
            >
              Break
            </button>
          </div>
        </div>

        <div className="w-full max-w-sm grid grid-cols-2 max-[380px]:grid-cols-1 gap-4 font-pixel text-[clamp(1.25rem,6vw,1.5rem)] shrink-0">
          <div className="flex flex-col items-center gap-2 min-w-0">
            <span className="whitespace-nowrap">Study: {defaultStudyingTime / 60}m</span>

            <div className="flex gap-2">
              <button
                className="min-w-11 px-3 py-1 rounded bg-[#182229]"
                onClick={() => {
                  void changeStudyMinutes(-5);
                }}
              >
                -
              </button>

              <button
                className="min-w-11 px-3 py-1 rounded bg-[#182229]"
                onClick={() => {
                  void changeStudyMinutes(5);
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 min-w-0">
            <span className="whitespace-nowrap">Break: {defaultBreakTime / 60}m</span>

            <div className="flex gap-2">
              <button
                className="min-w-11 px-3 py-1 rounded bg-[#182229]"
                onClick={() => {
                  void changeBreakMinutes(-1);
                }}
              >
                -
              </button>

              <button
                className="min-w-11 px-3 py-1 rounded bg-[#182229]"
                onClick={() => {
                  void changeBreakMinutes(1);
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-center items-center gap-2 shrink-0">
          <div
            className={`p-3 sm:p-4 rounded-xl flex justify-center items-center ${
              studyingIsRunning || breakIsRunning
                ? "bg-[#182229]"
                : "bg-transparent"
            }`}
          >
            <button
              className="font-pixel text-3xl relative"
              onClick={() => {
                void handleStartPause();
              }}
            >
              <Image
                loading="eager"
                width={48}
                height={48}
                alt="Start or pause"
                src={
                  studyingIsRunning || breakIsRunning
                    ? "/Images/PauseButton.png"
                    : "/Images/StartButton.png"
                }
                className="w-11 h-11 sm:w-12 sm:h-12 object-contain [image-rendering:pixelated]"
              />
            </button>
          </div>

          <div className="p-3 sm:p-4 rounded-xl flex justify-center items-center">
            <button
              className="font-pixel text-3xl"
              onClick={() => {
                void handleReset();
              }}
            >
              <Image
                loading="eager"
                width={48}
                height={48}
                alt="Reset"
                src="/Images/ResetButton.png"
                className="w-11 h-11 sm:w-12 sm:h-12 object-contain [image-rendering:pixelated]"
              />
            </button>
          </div>
        </div>

        <audio ref={bellRef} src="/Sounds/bell.mp3" preload="auto" />
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type TimerProps = {
  isLoggedIn: boolean;
  initialStudyMinutes: number;
  initialBreakMinutes: number;
};

export default function Timer({
  isLoggedIn,
  initialStudyMinutes,
  initialBreakMinutes,
}: TimerProps) {
  const bellRef = useRef<HTMLAudioElement | null>(null);
  const minuteAccumulatorRef = useRef(0);
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

  async function saveTimerSettings(
    studyMinutes: number,
    breakMinutes: number
  ) {
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

  async function recordStudySession(seconds: number) {
    if (!isLoggedIn) return;
    if (seconds <= 0) return;

    const res = await fetch("/api/study/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        seconds,
      }),
    });

    if (res.ok) {
      router.refresh();
    }
  }

  async function flushStudyAccumulator() {
    if (minuteAccumulatorRef.current > 0) {
      const secondsToSave = minuteAccumulatorRef.current;
      minuteAccumulatorRef.current = 0;
      await recordStudySession(secondsToSave);
    }
  }

  useEffect(() => {
    setDefaultStudyingTime(initialStudyMinutes * 60);
    setDefaultBreakTime(initialBreakMinutes * 60);
    setStudyingTime(initialStudyMinutes * 60);
    setBreakTime(initialBreakMinutes * 60);
    setStudyingIsRunning(false);
    setBreakIsRunning(false);
    setStateStudying(true);
    minuteAccumulatorRef.current = 0;
  }, [initialStudyMinutes, initialBreakMinutes]);

  useEffect(() => {
    if (!studyingIsRunning) return;

    const interval = setInterval(() => {
      setStudyingTime((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [studyingIsRunning]);

  useEffect(() => {
    if (!breakIsRunning) return;

    const interval = setInterval(() => {
      setBreakTime((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [breakIsRunning]);

  useEffect(() => {
    if (!studyingIsRunning || !stateStudying) return;
    if (studyingTime <= 0) return;

    minuteAccumulatorRef.current += 1;

    if (minuteAccumulatorRef.current >= 60) {
      void recordStudySession(60);
      minuteAccumulatorRef.current = 0;
    }
  }, [studyingTime, studyingIsRunning, stateStudying, isLoggedIn]);

  useEffect(() => {
    if (!studyingIsRunning || !stateStudying || studyingTime !== 0) return;

    void (async () => {
      bellRef.current?.play();

      await flushStudyAccumulator();

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
  ]);

  useEffect(() => {
    if (!breakIsRunning || stateStudying || breakTime !== 0) return;

    bellRef.current?.play();
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
  ]);

  const changeStudyMinutes = async (amount: number) => {
    if (stateStudying && studyingIsRunning) {
      setStudyingIsRunning(false);
      await flushStudyAccumulator();
    }

    minuteAccumulatorRef.current = 0;

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

    setBreakIsRunning(false);
    setStateStudying(true);
    setBreakTime(defaultBreakTime);
    setStudyingTime(defaultStudyingTime);
    minuteAccumulatorRef.current = 0;
  };

  const handleSwitchToBreak = async () => {
    if (!stateStudying) return;

    if (studyingIsRunning) {
      setStudyingIsRunning(false);
      await flushStudyAccumulator();
    }

    setStateStudying(false);
    setStudyingTime(defaultStudyingTime);
    setBreakTime(defaultBreakTime);
    minuteAccumulatorRef.current = 0;
  };

  const handleStartPause = async () => {
    if (stateStudying) {
      if (studyingIsRunning) {
        setStudyingIsRunning(false);
        await flushStudyAccumulator();
      } else {
        setBreakIsRunning(false);
        setStudyingIsRunning(true);
      }
    } else {
      setStudyingIsRunning(false);
      setBreakIsRunning((prev) => !prev);
    }
  };

  const handleReset = async () => {
    if (stateStudying) {
      if (studyingIsRunning) {
        setStudyingIsRunning(false);
        await flushStudyAccumulator();
      }
      setStudyingTime(defaultStudyingTime);
      minuteAccumulatorRef.current = 0;
    } else {
      setBreakIsRunning(false);
      setBreakTime(defaultBreakTime);
    }
  };

  return (
    <div className="w-full h-full min-h-0 overflow-y-auto">
      <div className="w-full min-h-full flex flex-col justify-center items-center px-3 sm:px-4 md:px-6 py-2 sm:py-4 gap-6 sm:gap-8 md:gap-10">
        <div className="shrink-0">
          <h1 className="font-pixel leading-none text-[clamp(4rem,11vw,7rem)]">
            {stateStudying
              ? `${studying_minutes}:${studying_seconds
                  .toString()
                  .padStart(2, "0")}`
              : `${break_minutes}:${break_seconds.toString().padStart(2, "0")}`}
          </h1>
        </div>

        <div className="flex flex-row justify-center items-center shrink-0">
          <div
            className={`px-2 py-2 w-28 sm:w-32 md:w-36 rounded-md flex flex-row justify-center items-center ${
              stateStudying ? "bg-[#182229]" : "bg-transparent"
            }`}
          >
            <button
              className="font-pixel text-lg sm:text-2xl md:text-3xl relative"
              onClick={() => {
                void handleSwitchToStudying();
              }}
            >
              Studying
            </button>
          </div>

          <div
            className={`px-2 py-2 w-28 sm:w-32 md:w-36 rounded-md flex flex-row justify-center items-center ${
              !stateStudying ? "bg-[#182229]" : "bg-transparent"
            }`}
          >
            <button
              className="font-pixel text-lg sm:text-2xl md:text-3xl relative"
              onClick={() => {
                void handleSwitchToBreak();
              }}
            >
              Break
            </button>
          </div>
        </div>

        <div className="flex flex-row justify-center items-start gap-4 sm:gap-6 md:gap-8 font-pixel text-sm sm:text-xl md:text-2xl shrink-0">
          <div className="flex flex-col items-center gap-2">
            <span>Study: {defaultStudyingTime / 60}m</span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-[#182229]"
                onClick={() => {
                  void changeStudyMinutes(-5);
                }}
              >
                -
              </button>
              <button
                className="px-3 py-1 rounded bg-[#182229]"
                onClick={() => {
                  void changeStudyMinutes(5);
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span>Break: {defaultBreakTime / 60}m</span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-[#182229]"
                onClick={() => {
                  void changeBreakMinutes(-1);
                }}
              >
                -
              </button>
              <button
                className="px-3 py-1 rounded bg-[#182229]"
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
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain [image-rendering:pixelated]"
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
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain [image-rendering:pixelated]"
              />
            </button>
          </div>
        </div>

        <audio ref={bellRef} src="/Sounds/bell.mp3" preload="auto" />
      </div>
    </div>
  );
}
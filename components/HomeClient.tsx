"use client";

import Image from "next/image";
import { useState } from "react";
import Timer from "@/components/Timer";
import Music from "@/components/Music";
import Stats from "@/components/Stats";
import SignInButton from "@/components/SignInButton";

type HomeClientProps = {
  isLoggedIn: boolean;
  initialStudyMinutes: number;
  initialBreakMinutes: number;
  initialMasterVolume: number;
  initialRainVolume: number;
  initialFireplaceVolume: number;
  initialBirdsVolume: number;
  initialWaterVolume: number;
  totalMinutes: number;
  todayMinutes: number;
  weekStats: {
    label: string;
    minutes: number;
  }[];
};

export default function HomeClient({
  isLoggedIn,
  initialStudyMinutes,
  initialBreakMinutes,
  initialMasterVolume,
  initialRainVolume,
  initialFireplaceVolume,
  initialBirdsVolume,
  initialWaterVolume,
  totalMinutes,
  todayMinutes,
  weekStats,
}: HomeClientProps) {
  const [colSelected, setColSelected] = useState(0);

  return (
    <div className="bg-[#182229] w-full min-h-[100svh] px-4 py-6 sm:px-6 sm:py-8 flex justify-center items-center relative overflow-hidden">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <SignInButton />
      </div>

      <div
        className="
          w-[min(92vw,640px)]
          h-[min(78svh,860px)]
          min-h-[620px]
          max-h-[860px]
          bg-[#2c3c3f]
          rounded-xl
          flex flex-col
          items-center
          p-4 sm:p-5 md:p-6
          overflow-hidden
        "
      >
        <div className="w-full flex flex-row gap-4 sm:gap-8 md:gap-12 justify-between items-center px-2 sm:px-4 md:px-6 shrink-0">
          <div
            className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 rounded-md flex flex-row justify-center items-center ${
              colSelected === 0 ? "bg-[#182229]" : "bg-transparent"
            }`}
          >
            <button
              className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 relative"
              onClick={() => setColSelected(0)}
              aria-label="Timer"
            >
              <Image
                loading="eager"
                sizes="48px"
                alt="Timer"
                src="/Images/HomeIcon.png"
                fill
                className="object-contain [image-rendering:pixelated]"
              />
            </button>
          </div>

          <div
            className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 rounded-md flex flex-row justify-center items-center ${
              colSelected === 1 ? "bg-[#182229]" : "bg-transparent"
            }`}
          >
            <button
              className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 relative"
              onClick={() => setColSelected(1)}
              aria-label="Music"
            >
              <Image
                loading="eager"
                sizes="48px"
                alt="Music"
                src="/Images/MusicIcon.png"
                fill
                className="object-contain [image-rendering:pixelated]"
              />
            </button>
          </div>

          <div
            className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 rounded-md flex flex-row justify-center items-center ${
              colSelected === 2 ? "bg-[#182229]" : "bg-transparent"
            }`}
          >
            <button
              className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 relative"
              onClick={() => setColSelected(2)}
              aria-label="Stats"
            >
              <Image
                loading="eager"
                sizes="48px"
                alt="Stats"
                src="/Images/StatsIcon.png"
                fill
                className="object-contain [image-rendering:pixelated]"
              />
            </button>
          </div>
        </div>

        <div className="w-full flex-1 min-h-0 pt-3 sm:pt-4">
          <div
            className={
              colSelected === 0
                ? "w-full h-full min-h-0 flex flex-col justify-center items-center"
                : "hidden"
            }
          >
            <Timer
              isLoggedIn={isLoggedIn}
              initialStudyMinutes={initialStudyMinutes}
              initialBreakMinutes={initialBreakMinutes}
            />
          </div>

          <div className={colSelected === 1 ? "w-full h-full min-h-0" : "hidden"}>
            <Music
              initialMasterVolume={initialMasterVolume}
              initialRainVolume={initialRainVolume}
              initialFireplaceVolume={initialFireplaceVolume}
              initialBirdsVolume={initialBirdsVolume}
              initialWaterVolume={initialWaterVolume}
            />
          </div>

          <div className={colSelected === 2 ? "w-full h-full min-h-0" : "hidden"}>
            <Stats
              isLoggedIn={isLoggedIn}
              totalMinutes={totalMinutes}
              todayMinutes={todayMinutes}
              weekStats={weekStats}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
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
    <div className="bg-[#182229] w-[100svw] h-[100svh] p-12 flex justify-center items-center relative">
      <SignInButton />

      <div className="w-full md:w-[60%] h-[90%] md:h-[70%] max-w-2xl bg-[#2c3c3f] rounded-xl flex flex-col items-center p-6 overflow-hidden">
        <div className="w-full flex flex-row gap-12 justify-between items-center px-6 shrink-0">
          <div
            className={`px-4 py-4 rounded-md flex flex-row justify-center items-center ${
              colSelected === 0 ? "bg-[#182229]" : "bg-transparent"
            }`}
          >
            <button
              className="font-pixel text-3xl w-12 h-12 relative"
              onClick={() => setColSelected(0)}
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
            className={`px-4 py-4 rounded-md flex flex-row justify-center items-center ${
              colSelected === 1 ? "bg-[#182229]" : "bg-transparent"
            }`}
          >
            <button
              className="font-pixel text-3xl w-12 h-12 relative"
              onClick={() => setColSelected(1)}
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
            className={`px-4 py-4 rounded-md flex flex-row justify-center items-center ${
              colSelected === 2 ? "bg-[#182229]" : "bg-transparent"
            }`}
          >
            <button
              className="font-pixel text-3xl w-12 h-12 relative"
              onClick={() => setColSelected(2)}
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

        <div className="w-full flex-1 min-h-0">
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

          <div
            className={
              colSelected === 1
                ? "w-full h-full min-h-0"
                : "hidden"
            }
          >
            <Music
              initialMasterVolume={initialMasterVolume}
              initialRainVolume={initialRainVolume}
              initialFireplaceVolume={initialFireplaceVolume}
              initialBirdsVolume={initialBirdsVolume}
              initialWaterVolume={initialWaterVolume}
            />
          </div>

          <div
            className={
              colSelected === 2
                ? "w-full h-full min-h-0"
                : "hidden"
            }
          >
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
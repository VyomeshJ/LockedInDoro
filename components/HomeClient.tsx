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
    <div className="bg-[#182229] w-full min-h-[100svh] flex flex-col relative overflow-hidden p-4">
      <div className="w-full flex justify-end shrink-0 mb-4">
        <SignInButton />
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-[440px] h-[calc(100svh-96px)] max-h-[660px] min-h-[520px] bg-[#2c3c3f] rounded-xl flex flex-col items-center p-4 md:p-6 overflow-hidden">
          <div className="w-full flex flex-row justify-between items-center gap-2 md:gap-12 px-0 md:px-6 shrink-0">
            <NavButton
              selected={colSelected === 0}
              onClick={() => setColSelected(0)}
              label="Timer"
              src="/Images/HomeIcon.png"
            />

            <NavButton
              selected={colSelected === 1}
              onClick={() => setColSelected(1)}
              label="Music"
              src="/Images/MusicIcon.png"
            />

            <NavButton
              selected={colSelected === 2}
              onClick={() => setColSelected(2)}
              label="Stats"
              src="/Images/StatsIcon.png"
            />
          </div>

          <div className="w-full flex-1 min-h-0 pt-4">
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
                colSelected === 1 ? "w-full h-full min-h-0" : "hidden"
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
                colSelected === 2 ? "w-full h-full min-h-0" : "hidden"
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
    </div>
  );
}

type NavButtonProps = {
  selected: boolean;
  onClick: () => void;
  label: string;
  src: string;
};

function NavButton({ selected, onClick, label, src }: NavButtonProps) {
  return (
    <div
      className={`p-3 md:px-4 md:py-4 rounded-md flex justify-center items-center ${
        selected ? "bg-[#182229]" : "bg-transparent"
      }`}
    >
      <button
        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
        onClick={onClick}
        aria-label={label}
      >
        <div className="relative w-7 h-7 md:w-8 md:h-8">
          <Image
            loading="eager"
            sizes="32px"
            alt={label}
            src={src}
            fill
            className="object-contain [image-rendering:pixelated]"
          />
        </div>
      </button>
    </div>
  );
}
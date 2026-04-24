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
    <div className="bg-[#182229] w-full min-h-[100svh] flex justify-center items-center relative overflow-hidden p-4">
      <div className="absolute top-4 right-4 z-20">
        <SignInButton />
      </div>

      <div className="origin-center scale-[min(1,calc((100vw-32px)/640),calc((100svh-32px)/860))]">
        <div className="w-[440px] h-[660px] bg-[#2c3c3f] rounded-xl flex flex-col items-center p-6 overflow-hidden">
          <div className="w-full flex flex-row gap-12 justify-between items-center px-6 shrink-0">
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
      className={`px-4 py-4 rounded-md flex flex-row justify-center items-center ${
        selected ? "bg-[#182229]" : "bg-transparent"
      }`}
    >
      <button
        className="w-12 h-12 relative"
        onClick={onClick}
        aria-label={label}
      >
        <Image
          loading="eager"
          sizes="48px"
          alt={label}
          src={src}
          fill
          className="object-contain [image-rendering:pixelated]"
        />
      </button>
    </div>
  );
}
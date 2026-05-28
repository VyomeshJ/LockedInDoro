"use client";

import { useEffect, useRef, useState } from "react";

type MusicProps = {
  initialMasterVolume: number;
  initialRainVolume: number;
  initialFireplaceVolume: number;
  initialBirdsVolume: number;
  initialWaterVolume: number;
};

export default function Music({
  initialMasterVolume,
  initialRainVolume,
  initialFireplaceVolume,
  initialBirdsVolume,
  initialWaterVolume,
}: MusicProps) {
  const [masterVolume, setMasterVolume] = useState(initialMasterVolume);

  const [rainVolume, setRainVolume] = useState(initialRainVolume);
  const [fireplaceVolume, setFireplaceVolume] = useState(
    initialFireplaceVolume
  );
  const [birdsVolume, setBirdsVolume] = useState(initialBirdsVolume);
  const [waterVolume, setWaterVolume] = useState(initialWaterVolume);

  const [rainPlaying, setRainPlaying] = useState(false);
  const [fireplacePlaying, setFireplacePlaying] = useState(false);
  const [birdsPlaying, setBirdsPlaying] = useState(false);
  const [waterPlaying, setWaterPlaying] = useState(false);

  const rainRef = useRef<HTMLAudioElement | null>(null);
  const fireplaceRef = useRef<HTMLAudioElement | null>(null);
  const birdsRef = useRef<HTMLAudioElement | null>(null);
  const waterRef = useRef<HTMLAudioElement | null>(null);

  async function saveMusicSettings(
    newMasterVolume: number,
    newRainVolume: number,
    newFireplaceVolume: number,
    newBirdsVolume: number,
    newWaterVolume: number
  ) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        master_volume: newMasterVolume,
        rain_volume: newRainVolume,
        fireplace_volume: newFireplaceVolume,
        birds_volume: newBirdsVolume,
        water_volume: newWaterVolume,
      }),
    });
  }

  useEffect(() => {
    if (rainRef.current) {
      rainRef.current.volume = (rainVolume / 100) * (masterVolume / 100);
    }
  }, [rainVolume, masterVolume]);

  useEffect(() => {
    if (fireplaceRef.current) {
      fireplaceRef.current.volume =
        (fireplaceVolume / 100) * (masterVolume / 100);
    }
  }, [fireplaceVolume, masterVolume]);

  useEffect(() => {
    if (birdsRef.current) {
      birdsRef.current.volume = (birdsVolume / 100) * (masterVolume / 100);
    }
  }, [birdsVolume, masterVolume]);

  useEffect(() => {
    if (waterRef.current) {
      waterRef.current.volume = (waterVolume / 100) * (masterVolume / 100);
    }
  }, [waterVolume, masterVolume]);

  const toggleAudio = (
    ref: React.RefObject<HTMLAudioElement | null>,
    isPlaying: boolean,
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!ref.current) return;

    if (isPlaying) {
      ref.current.pause();
      setIsPlaying(false);
    } else {
      ref.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col justify-start items-center px-3 sm:px-6 gap-4 overflow-y-auto">
      <h1 className="font-pixel text-[clamp(3.25rem,16vw,4.5rem)] leading-none shrink-0">
        Sounds
      </h1>

      <div className="w-full max-w-xl flex flex-col gap-4 font-pixel text-[clamp(1.25rem,5vw,1.5rem)] flex-1 min-h-0">
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex justify-between items-center">
            <span>Master Volume</span>
            <span className="font-pixel-number">{masterVolume}</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={async (e) => {
              const newMasterVolume = Number(e.target.value);
              setMasterVolume(newMasterVolume);

              await saveMusicSettings(
                newMasterVolume,
                rainVolume,
                fireplaceVolume,
                birdsVolume,
                waterVolume
              );
            }}
            className="w-full accent-white"
          />
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2">
          <SoundRow
            label="Rain"
            volume={rainVolume}
            setVolume={async (value) => {
              setRainVolume(value);

              await saveMusicSettings(
                masterVolume,
                value,
                fireplaceVolume,
                birdsVolume,
                waterVolume
              );
            }}
            isPlaying={rainPlaying}
            onToggle={() => toggleAudio(rainRef, rainPlaying, setRainPlaying)}
          />

          <SoundRow
            label="Fireplace"
            volume={fireplaceVolume}
            setVolume={async (value) => {
              setFireplaceVolume(value);

              await saveMusicSettings(
                masterVolume,
                rainVolume,
                value,
                birdsVolume,
                waterVolume
              );
            }}
            isPlaying={fireplacePlaying}
            onToggle={() =>
              toggleAudio(fireplaceRef, fireplacePlaying, setFireplacePlaying)
            }
          />

          <SoundRow
            label="Birds"
            volume={birdsVolume}
            setVolume={async (value) => {
              setBirdsVolume(value);

              await saveMusicSettings(
                masterVolume,
                rainVolume,
                fireplaceVolume,
                value,
                waterVolume
              );
            }}
            isPlaying={birdsPlaying}
            onToggle={() =>
              toggleAudio(birdsRef, birdsPlaying, setBirdsPlaying)
            }
          />

          <SoundRow
            label="Water"
            volume={waterVolume}
            setVolume={async (value) => {
              setWaterVolume(value);

              await saveMusicSettings(
                masterVolume,
                rainVolume,
                fireplaceVolume,
                birdsVolume,
                value
              );
            }}
            isPlaying={waterPlaying}
            onToggle={() =>
              toggleAudio(waterRef, waterPlaying, setWaterPlaying)
            }
          />
        </div>
      </div>

      <audio ref={rainRef} loop src="/Sounds/rain.mp3" />
      <audio ref={fireplaceRef} loop src="/Sounds/fireplace.mp3" />
      <audio ref={birdsRef} loop src="/Sounds/birds.mp3" />
      <audio ref={waterRef} loop src="/Sounds/water.mp3" />
    </div>
  );
}

type SoundRowProps = {
  label: string;
  volume: number;
  setVolume: (value: number) => void | Promise<void>;
  isPlaying: boolean;
  onToggle: () => void;
};

function SoundRow({
  label,
  volume,
  setVolume,
  isPlaying,
  onToggle,
}: SoundRowProps) {
  return (
    <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-lg bg-[#182229] shrink-0">
      <div className="flex justify-between items-center gap-3 sm:gap-4">
        <span>{label}</span>

        <button onClick={onToggle} className="min-w-18 px-3 py-1 rounded-md bg-[#24323b]">
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      <div className="flex justify-between items-center gap-3 sm:gap-4">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-white"
        />

        <span className="font-pixel-number w-12 text-right shrink-0">{volume}</span>
      </div>
    </div>
  );
}

"use client";

type WeekDayStat = {
  label: string;
  minutes: number;
};

type StatsProps = {
  isLoggedIn: boolean;
  totalMinutes: number;
  todayMinutes: number;
  weekStats: WeekDayStat[];
};

function formatStudyDuration(minutes: number, includeDays = false) {
  if (includeDays && minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    const hrs = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    const parts = [`${days}d`];

    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);

    return parts.join(" ");
  }

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export default function Stats({
  isLoggedIn,
  totalMinutes,
  todayMinutes,
  weekStats,
}: StatsProps) {
  if (!isLoggedIn) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-start px-3 sm:px-6 gap-4 sm:gap-6 text-center overflow-y-auto">
        <h1 className="font-pixel text-[clamp(3.25rem,16vw,4.5rem)] leading-none shrink-0">
          Stats
        </h1>

        <div className="max-w-xl w-full p-4 sm:p-6 rounded-lg bg-[#182229] flex flex-col items-center gap-4">
          <span className="font-pixel text-[clamp(1.35rem,6vw,1.5rem)]">
            Want to see your stats?
          </span>

          <span className="font-pixel text-[clamp(1rem,4vw,1.125rem)] opacity-80">
            Please log in to view your study history and weekly progress.
          </span>
        </div>
      </div>
    );
  }

  const maxMinutes = Math.max(...weekStats.map((day) => day.minutes), 1);

  return (
    <div className="w-full h-full min-h-0 flex flex-col items-center px-3 sm:px-6 gap-4 sm:gap-6 overflow-y-auto">
      <h1 className="font-pixel text-[clamp(3.25rem,16vw,4.5rem)] leading-none shrink-0">
        Stats
      </h1>

      <div className="w-full max-w-xl flex flex-col gap-4 sm:gap-6 font-pixel text-[clamp(1.25rem,5vw,1.5rem)] flex-1 min-h-0">
        <div className="grid grid-cols-2 max-[520px]:grid-cols-1 gap-3 sm:gap-4 shrink-0">
          <div className="flex flex-col gap-1 sm:gap-2 p-3 sm:p-4 rounded-lg bg-[#182229] min-w-0">
            <span className="text-[clamp(1rem,4vw,1.125rem)] opacity-80">Total Studied</span>
            <span className="text-[clamp(1.5rem,7vw,1.875rem)] leading-tight whitespace-nowrap">
              {formatStudyDuration(totalMinutes, true)}
            </span>
          </div>

          <div className="flex flex-col gap-1 sm:gap-2 p-3 sm:p-4 rounded-lg bg-[#182229] min-w-0">
            <span className="text-[clamp(1rem,4vw,1.125rem)] opacity-80">Today</span>
            <span className="text-[clamp(1.5rem,7vw,1.875rem)] leading-tight whitespace-nowrap">
              {formatStudyDuration(todayMinutes)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-[#182229] flex-1 min-h-[220px]">
          <div className="flex justify-between items-center shrink-0 gap-3">
            <span className="text-[clamp(1.35rem,6vw,1.5rem)]">This Week</span>

            <span className="text-[clamp(0.95rem,4vw,1.125rem)] opacity-80 text-right">
              Minutes studied
            </span>
          </div>

          <div className="flex-1 min-h-[150px] max-h-[360px] flex items-end justify-between gap-2 sm:gap-3">
            {weekStats.map((day, index) => {
              const heightPercent = (day.minutes / maxMinutes) * 100;

              return (
                <div
                  key={`${day.label}-${index}`}
                  className="flex-1 h-full flex flex-col justify-end items-center gap-2 sm:gap-3 min-w-0"
                >
                  <span className="text-xs sm:text-sm opacity-80 h-4 sm:h-5">
                    {day.minutes > 0 ? day.minutes : ""}
                  </span>

                  <div className="w-full h-full flex items-end">
                    <div
                      className="w-full rounded-md bg-[#3d5960] min-h-[6px]"
                      style={{
                        height: `${Math.max(
                          heightPercent,
                          day.minutes > 0 ? 4 : 0
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="text-base sm:text-lg leading-none">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

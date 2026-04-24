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

function formatMinutes(minutes: number) {
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
      <div className="w-full h-full flex flex-col items-center justify-center px-6 gap-6 text-center">
        <h1 className="font-pixel text-[clamp(3rem,8vw,4.5rem)] shrink-0">Stats</h1>
        <div className="max-w-xl w-full p-6 rounded-xl bg-[#182229] flex flex-col items-center gap-4">
          <span className="font-pixel text-xl sm:text-2xl">Want to see your stats?</span>
          <span className="font-pixel text-base sm:text-lg opacity-80">
            Please log in to view your study history and weekly progress.
          </span>
        </div>
      </div>
    );
  }

  const maxMinutes = Math.max(...weekStats.map((day) => day.minutes), 1);

  return (
    <div className="w-full h-full min-h-0 flex flex-col items-center px-3 sm:px-4 md:px-6 gap-4 sm:gap-6 min-h-0 overflow-hidden">
      <h1 className="font-pixel text-[clamp(3rem,8vw,4.5rem)] shrink-0">Stats</h1>

      <div className="w-full max-w-xl flex flex-col gap-4 sm:gap-6 font-pixel text-lg sm:text-xl md:text-2xl flex-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#182229] min-w-0">
            <span className="text-sm sm:text-lg opacity-80">Total Studied</span>
            <span className="text-2xl sm:text-3xl">{formatMinutes(totalMinutes)}</span>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#182229] min-w-0">
            <span className="text-sm sm:text-lg opacity-80">Today</span>
            <span className="text-2xl sm:text-3xl">{formatMinutes(todayMinutes)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4 rounded-xl bg-[#182229] flex-1 min-h-0 overflow-hidden">
          <div className="flex justify-between items-center shrink-0 gap-4">
            <span className="text-xl sm:text-2xl">This Week</span>
            <span className="text-xs sm:text-lg opacity-80 text-right">
              Minutes studied
            </span>
          </div>

          <div className="flex-1 min-h-[220px] flex items-end justify-between gap-2 sm:gap-3">
            {weekStats.map((day, index) => {
              const heightPercent = (day.minutes / maxMinutes) * 100;

              return (
                <div
                  key={`${day.label}-${index}`}
                  className="flex-1 h-full flex flex-col justify-end items-center gap-2 sm:gap-3 min-w-0"
                >
                  <span className="text-[10px] sm:text-sm opacity-80 h-5">
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

                  <span className="text-xs sm:text-lg">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
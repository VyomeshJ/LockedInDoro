import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <HomeClient
        isLoggedIn={false}
        initialStudyMinutes={25}
        initialBreakMinutes={5}
        initialMasterVolume={100}
        initialRainVolume={50}
        initialFireplaceVolume={50}
        initialBirdsVolume={50}
        initialWaterVolume={50}
        totalMinutes={0}
        todayMinutes={0}
        weekStats={[
          { label: "Tue", minutes: 0 },
          { label: "Wed", minutes: 0 },
          { label: "Thu", minutes: 0 },
          { label: "Fri", minutes: 0 },
          { label: "Sat", minutes: 0 },
          { label: "Sun", minutes: 0 },
          { label: "Mon", minutes: 0 },
        ]}
      />
    );
  }

  await pool.query(
    `INSERT INTO user_settings (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [session.user.id]
  );

  await pool.query(
    `INSERT INTO study_totals (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [session.user.id]
  );

  const settingsRes = await pool.query(
    `SELECT default_study_minutes,
            default_break_minutes,
            master_volume,
            rain_volume,
            fireplace_volume,
            birds_volume,
            water_volume
     FROM user_settings
     WHERE user_id = $1`,
    [session.user.id]
  );

  const totalsRes = await pool.query(
    `SELECT total_seconds
     FROM study_totals
     WHERE user_id = $1`,
    [session.user.id]
  );

  const todayRes = await pool.query(
    `SELECT seconds_studied
     FROM study_daily
     WHERE user_id = $1
       AND study_date = CURRENT_DATE`,
    [session.user.id]
  );

  const weekRes = await pool.query(
    `SELECT study_date, seconds_studied
     FROM study_daily
     WHERE user_id = $1
       AND study_date >= CURRENT_DATE - INTERVAL '6 days'
     ORDER BY study_date ASC`,
    [session.user.id]
  );

  const settings = settingsRes.rows[0] ?? {
    default_study_minutes: 25,
    default_break_minutes: 5,
    master_volume: 100,
    rain_volume: 50,
    fireplace_volume: 50,
    birds_volume: 50,
    water_volume: 50,
  };

  const totalMinutes = Math.floor((totalsRes.rows[0]?.total_seconds ?? 0) / 60);
  const todayMinutes = Math.floor((todayRes.rows[0]?.seconds_studied ?? 0) / 60);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekMap = new Map<string, { label: string; minutes: number }>();

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const key = formatLocalDateKey(date);

    weekMap.set(key, {
      label: dayLabels[date.getDay()],
      minutes: 0,
    });
  }

  for (const row of weekRes.rows) {
    const date = new Date(row.study_date);
    date.setHours(12, 0, 0, 0);

    const key = formatLocalDateKey(date);

    if (weekMap.has(key)) {
      weekMap.set(key, {
        label: dayLabels[date.getDay()],
        minutes: Math.floor(row.seconds_studied / 60),
      });
    }
  }

  const weekStats = Array.from(weekMap.values());

  return (
    <HomeClient
      isLoggedIn={true}
      initialStudyMinutes={settings.default_study_minutes}
      initialBreakMinutes={settings.default_break_minutes}
      initialMasterVolume={settings.master_volume}
      initialRainVolume={settings.rain_volume}
      initialFireplaceVolume={settings.fireplace_volume}
      initialBirdsVolume={settings.birds_volume}
      initialWaterVolume={settings.water_volume}
      totalMinutes={totalMinutes}
      todayMinutes={todayMinutes}
      weekStats={weekStats}
    />
  );
}
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { seconds, date } = await req.json();

  if (!seconds || seconds <= 0) {
    return NextResponse.json({ error: "Invalid seconds" }, { status: 400 });
  }

  if (!date) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  await pool.query(
    `INSERT INTO study_totals (user_id, total_seconds)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET
       total_seconds = study_totals.total_seconds + EXCLUDED.total_seconds,
       updated_at = NOW()`,
    [session.user.id, seconds]
  );

  await pool.query(
    `INSERT INTO study_daily (user_id, study_date, seconds_studied)
     VALUES ($1, $2::date, $3)
     ON CONFLICT (user_id, study_date)
     DO UPDATE SET
       seconds_studied = study_daily.seconds_studied + EXCLUDED.seconds_studied`,
    [session.user.id, date, seconds]
  );

  return NextResponse.json({ ok: true });
}
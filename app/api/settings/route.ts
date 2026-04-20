import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    default_study_minutes,
    default_break_minutes,
    master_volume,
    rain_volume,
    fireplace_volume,
    birds_volume,
    water_volume,
  } = await req.json();

  await pool.query(
    `UPDATE user_settings
     SET default_study_minutes = COALESCE($1, default_study_minutes),
         default_break_minutes = COALESCE($2, default_break_minutes),
         master_volume = COALESCE($3, master_volume),
         rain_volume = COALESCE($4, rain_volume),
         fireplace_volume = COALESCE($5, fireplace_volume),
         birds_volume = COALESCE($6, birds_volume),
         water_volume = COALESCE($7, water_volume),
         updated_at = NOW()
     WHERE user_id = $8`,
    [
      default_study_minutes ?? null,
      default_break_minutes ?? null,
      master_volume ?? null,
      rain_volume ?? null,
      fireplace_volume ?? null,
      birds_volume ?? null,
      water_volume ?? null,
      session.user.id,
    ]
  );

  return NextResponse.json({ ok: true });
}
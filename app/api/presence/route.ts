import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

const ACTIVE_WINDOW_SECONDS = 8;
const MAX_TAB_ID_LENGTH = 128;

let ensuredPresenceTable = false;

async function ensurePresenceTable() {
  if (ensuredPresenceTable) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tab_presence (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tab_id TEXT NOT NULL,
      last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, tab_id)
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS tab_presence_last_seen_idx
      ON tab_presence (last_seen)
  `);

  ensuredPresenceTable = true;
}

type PresencePayload = {
  action: "heartbeat" | "close";
  tabId: string;
};

async function getPresencePayload(req: Request): Promise<PresencePayload | null> {
  const rawBody = await req.text();
  if (!rawBody) return null;

  try {
    const body: unknown = JSON.parse(rawBody);

    if (
      typeof body === "object" &&
      body !== null &&
      "tabId" in body &&
      typeof body.tabId === "string" &&
      body.tabId.length > 0 &&
      body.tabId.length <= MAX_TAB_ID_LENGTH
    ) {
      return {
        action:
          "action" in body && body.action === "close" ? "close" : "heartbeat",
        tabId: body.tabId,
      };
    }
  } catch {
    if (rawBody.length <= MAX_TAB_ID_LENGTH) {
      return {
        action: "heartbeat",
        tabId: rawBody,
      };
    }
  }

  return null;
}

async function deleteStalePresence() {
  await pool.query(
    `DELETE FROM tab_presence
     WHERE last_seen < NOW() - ($1::text)::interval`,
    [`${ACTIVE_WINDOW_SECONDS} seconds`]
  );
}

async function getActiveCount(userId: string) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS active_count
     FROM tab_presence
     WHERE user_id = $1
       AND last_seen >= NOW() - ($2::text)::interval`,
    [userId, `${ACTIVE_WINDOW_SECONDS} seconds`]
  );

  return result.rows[0]?.active_count ?? 0;
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await getPresencePayload(req);

  if (!payload) {
    return NextResponse.json({ error: "Invalid tab id" }, { status: 400 });
  }

  await ensurePresenceTable();

  if (payload.action === "close") {
    await pool.query(
      `DELETE FROM tab_presence
       WHERE user_id = $1
         AND tab_id = $2`,
      [session.user.id, payload.tabId]
    );
  } else {
    await pool.query(
      `INSERT INTO tab_presence (user_id, tab_id, last_seen)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, tab_id)
       DO UPDATE SET last_seen = NOW()`,
      [session.user.id, payload.tabId]
    );
  }

  await deleteStalePresence();

  return NextResponse.json({
    activeCount: await getActiveCount(session.user.id),
  });
}

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await getPresencePayload(req);

  if (!payload) {
    return NextResponse.json({ error: "Invalid tab id" }, { status: 400 });
  }

  await ensurePresenceTable();

  await pool.query(
    `DELETE FROM tab_presence
     WHERE user_id = $1
       AND tab_id = $2`,
    [session.user.id, payload.tabId]
  );

  await deleteStalePresence();

  return NextResponse.json({
    activeCount: await getActiveCount(session.user.id),
  });
}

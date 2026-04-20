import pg from "pg";

const { Pool } = pg;

declare global {
  var pgPool: pg.Pool | undefined;
}

export const pool =
  global.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.pgPool = pool;
}
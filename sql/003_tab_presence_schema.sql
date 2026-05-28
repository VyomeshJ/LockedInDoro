CREATE TABLE IF NOT EXISTS tab_presence (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tab_id TEXT NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, tab_id)
);

CREATE INDEX IF NOT EXISTS tab_presence_last_seen_idx
  ON tab_presence (last_seen);

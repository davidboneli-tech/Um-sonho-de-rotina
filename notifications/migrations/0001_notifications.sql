CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  subscription TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  last_test INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE reminders (
  device TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  at INTEGER NOT NULL,
  body TEXT NOT NULL,
  is_test INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  retry_at INTEGER NOT NULL DEFAULT 0,
  lease TEXT,
  PRIMARY KEY (device, id)
);
CREATE INDEX idx_reminders_due ON reminders(state, retry_at, at);
CREATE INDEX idx_reminders_at ON reminders(at);

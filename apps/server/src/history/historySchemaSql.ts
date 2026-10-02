export const HISTORY_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS metric_samples (
  component TEXT NOT NULL, key TEXT NOT NULL, value REAL NOT NULL, at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS metric_samples_key ON metric_samples (component, key, at);
CREATE INDEX IF NOT EXISTS metric_samples_at ON metric_samples (at);
CREATE TABLE IF NOT EXISTS launchd_observations (
  label TEXT NOT NULL, pid INTEGER, runs INTEGER, last_exit INTEGER, at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS launchd_observations_label ON launchd_observations (label, at);
CREATE TABLE IF NOT EXISTS metric_rollups (
  component TEXT NOT NULL, key TEXT NOT NULL, hour INTEGER NOT NULL,
  min REAL NOT NULL, max REAL NOT NULL, sum REAL NOT NULL, count INTEGER NOT NULL,
  PRIMARY KEY (component, key, hour)
);
CREATE TABLE IF NOT EXISTS runs (started INTEGER PRIMARY KEY, stopped INTEGER NOT NULL);
`

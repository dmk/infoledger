CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  entityId TEXT NOT NULL,
  data TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  previousHash TEXT NOT NULL,
  timestampProof TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  verified BOOLEAN NOT NULL DEFAULT FALSE
);

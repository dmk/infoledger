#!/usr/bin/env bash

cp db.sqlite backup-db.sqlite
git add backup-db.sqlite

TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
LAST_ENTRY=$(sqlite3 db.sqlite "SELECT id, entityId, timestamp FROM ledger_entries ORDER BY timestamp DESC LIMIT 1")

git commit -m "Automated backup at $TIMESTAMP. Last entry: $LAST_ENTRY"
git push

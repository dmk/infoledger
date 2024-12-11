import db from "../db";
import { createHash, randomUUID } from "crypto";
import { createBitcoinAnchor } from "../lib/anchors/providers/bitcoin";
import { LedgerEntry } from "./types";

// Initialize Bitcoin anchor
const bitcoinAnchor = createBitcoinAnchor({
  mode: 'regtest',
  rpcHost: '127.0.0.1',
  rpcPort: 18443,
  rpcAuth: {
    username: 'bitcoin',
    password: 'bitcoin'
  },
  blocksRequired: 50
});

export async function addEntry(entityId: string, dataObj: LedgerEntry): Promise<LedgerEntry> {
  // Get the last entry first (for previousHash)
  const lastEntry = db
    .query("SELECT * FROM ledger_entries ORDER BY rowid DESC LIMIT 1")
    .get() as LedgerEntry | undefined;

  const previousHash = lastEntry ? lastEntry.hash : "GENESIS";
  const ts = Date.now();

  // Prepare the entry
  const entryWithoutHash = {
    id: randomUUID(),
    entityId,
    data: JSON.stringify(dataObj),
    timestamp: ts,
    previousHash,
  };

  const hash = createHash("sha256")
    .update(JSON.stringify(entryWithoutHash))
    .digest("hex");

  console.log('hash', hash);

  try {
    // Create Bitcoin anchor proof
    const proof = await bitcoinAnchor.anchor(hash);
 
    console.log('proof', proof);

    // Prepare the complete entry
    const entry: LedgerEntry = { 
      ...entryWithoutHash,
      hash,
      timestampProof: JSON.stringify({
        type: 'bitcoin',
        proof
      })
    };

    // Store everything in a single transaction
    db.transaction(() => {
      db.run(
        "INSERT INTO ledger_entries (id, entityId, data, timestamp, previousHash, hash, timestampProof, verified) VALUES (?,?,?,?,?,?,?,?)",
        [
          entry.id,
          entry.entityId,
          entry.data,
          entry.timestamp,
          entry.previousHash,
          entry.hash,
          entry.timestampProof as string,
          false
        ]
      );
    })();

    console.log('entry', entry);

    return entry;
  } catch (error) {
    console.error('Failed to create Bitcoin anchor:', error);
    throw new Error('Failed to create timestamp proof');
  }
}

export async function verifyEntry(hash: string): Promise<boolean> {
  if (!hash) {
    return false;
  }

  const entry = db.query("SELECT timestampProof FROM ledger_entries WHERE hash = ?").get(hash) as LedgerEntry;
  if (!entry || !entry.timestampProof) {
    return false;
  }

  try {
    const { proof } = JSON.parse(entry.timestampProof);
    return await bitcoinAnchor.verify(proof);
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}

export function getEntries(): { [entityId: string]: LedgerEntry[] } {
  const entries = db.query("SELECT * FROM ledger_entries ORDER BY entityId, timestamp").all() as LedgerEntry[];
  
  return entries.reduce((acc, entry) => {
    if (!acc[entry.entityId]) {
      acc[entry.entityId] = [];
    }
    acc[entry.entityId].push(entry);
    return acc;
  }, {} as { [entityId: string]: LedgerEntry[] });
}

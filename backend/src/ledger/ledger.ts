import db from "../db/index.js";
import { createHash, randomUUID } from "crypto";
import {
  read, write,
  verify, verifiers,
  submit,
} from '@lacrypta/typescript-opentimestamps';

export interface LedgerEntry {
  id: string;
  entityId: string;
  data: string;
  timestamp: number;
  previousHash: string;
  hash: string;
  timestampProof?: string;  // Store the OpenTimestamps proof
  verified?: boolean;
}

// Example curl request to add an entry:
//curl -X POST http://localhost:4891/entries -H "Content-Type: application/json" -d '{"entityId": "user123","data": {"message": "Hello World","amount": 100,"recipient": "user456"}}'

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
    // Create OpenTimestamps proof using the typescript-opentimestamps library
    const { timestamp } = await submit('sha256', Buffer.from(hash, 'hex'));
 
    console.log('timestamp', write(timestamp))

    // Prepare the complete entry
    const entry: LedgerEntry = { 
      ...entryWithoutHash,
      hash,
      timestampProof: JSON.stringify({
        version: timestamp.version,
        fileHash: {
          algorithm: timestamp.fileHash.algorithm,
          value: Buffer.from(write(timestamp)).toString('base64')
        }
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
    console.error('Failed to create OpenTimestamps proof:', error);
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
    const parsedProof = JSON.parse(entry.timestampProof);
    const timestamp = read(Buffer.from(parsedProof.fileHash.value, 'base64'));

    const result = await verify(timestamp, verifiers);

    return Object.keys(result.attestations).length > 0;
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}

export function getEntries(): LedgerEntry[] {
  return db.query("SELECT * FROM ledger_entries").all() as LedgerEntry[];
}

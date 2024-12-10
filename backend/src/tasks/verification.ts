import db from "../db/index.js";
import { LedgerEntry, verifyEntry } from "../ledger/ledger.js";

export async function startVerificationTask(intervalMinutes: number = 15) {
  // Initial check
  await checkUnverifiedEntries();

  // Schedule periodic checks
  setInterval(checkUnverifiedEntries, intervalMinutes * 60 * 1000);
}

async function checkUnverifiedEntries() {
  console.log("Checking unverified entries...");

  try {
    // Get all unverified entries
    const unverifiedEntries = db
      .query("SELECT * FROM ledger_entries WHERE verified = 0")
      .all() as LedgerEntry[];

    console.log(`Found ${unverifiedEntries.length} unverified entries`);

    // Check each entry
    for (const entry of unverifiedEntries) {
      try {
        const isVerified = await verifyEntry(entry.hash);
        if (isVerified) {
          console.log(`Entry ${entry.hash} is now verified`);
          db.run(
            "UPDATE ledger_entries SET verified = 1 WHERE hash = ?",
            [entry.hash]
          );
        } else {
          console.log(`Entry ${entry.hash} is not verified yet`);
        }
      } catch (error) {
        console.error(`Error verifying entry ${entry.hash}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in verification task:", error);
  }
}

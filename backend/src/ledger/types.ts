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

// get-opreturn.ts
import Client from 'bitcoin-core';

const client = new Client({
  network: 'regtest',
  host: '127.0.0.1',
  port: 18443,
  username: 'bitcoin',
  password: 'bitcoin'
});

async function getOpReturnData(txid: string) {
  try {
    // Get the full transaction data
    const tx = await client.getRawTransaction(txid, true);
    
    // Look through outputs (vout) for OP_RETURN
    const outputs = tx.vout || [];
    const opReturnOutput = outputs.find(
      output => output.scriptPubKey?.type === 'nulldata'
    );

    if (!opReturnOutput) {
      console.log('No OP_RETURN output found in this transaction');
      return;
    }

    // Get the hex data
    const hex = opReturnOutput.scriptPubKey.hex;
    
    // Remove the OP_RETURN opcode (0x6a) and data length byte
    const data = hex.slice(4);
    
    console.log('Transaction:', txid);
    console.log('OP_RETURN data (hex):', data);
    
    // Try to convert hex to ASCII if possible
    try {
      const ascii = Buffer.from(data, 'hex').toString('utf8');
      console.log('OP_RETURN data (ASCII):', ascii);
    } catch (e) {
      console.log('Could not convert to ASCII');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Get txid from command line argument
const txid = process.argv[2];
if (!txid) {
  console.log('Please provide a transaction ID');
  console.log('Usage: bun run get-opreturn.ts <txid>');
  process.exit(1);
}

getOpReturnData(txid);

import Client from 'bitcoin-core';

async function generateBlocks(numBlocks: number = 1) {
  const client = new Client({
    network: 'regtest',
    host: 'localhost',
    port: 18443,
    username: 'bitcoin',
    password: 'bitcoin'
  });

  try {
    // Get a new address to receive the block rewards
    const address = await client.getNewAddress();
    console.log('Generating', numBlocks, 'blocks to address:', address);

    // Generate blocks
    const blockHashes = await client.generateToAddress(numBlocks, address);
    console.log('Generated blocks:', blockHashes);

    // Get current block count
    const blockCount = await client.getBlockCount();
    console.log('Current block height:', blockCount);

    return blockHashes;
  } catch (error) {
    console.error('Error generating blocks:', error);
    throw error;
  }
}

// Get number of blocks from command line argument, default to 1
const numBlocks = parseInt(process.argv[2] || '1', 10);
generateBlocks(numBlocks);

import Client from 'bitcoin-core';

async function setupBitcoinRegtest() {
  const client = new Client({
    network: 'regtest',
    host: 'localhost',
    port: 18443,
    username: 'bitcoin',
    password: 'bitcoin'
  });

  try {
    console.log('Creating wallet...');
    try {
      await client.createWallet('default');
      console.log('Wallet created successfully');
    } catch (error) {
      if (error.message.includes('Database already exists')) {
        console.log('Wallet already exists, loading it...');
        await client.loadWallet('default');
      } else {
        throw error;
      }
    }

    console.log('Getting new address...');
    const address = await client.getNewAddress();
    console.log('Mining initial blocks to address:', address);
    
    // Generate 101 blocks (needed for coins to be spendable)
    await client.generateToAddress(101, address);
    console.log('Generated 101 blocks');

    // Verify balance
    const balance = await client.getBalance();
    console.log('Wallet balance:', balance);

    console.log('Bitcoin regtest environment is ready!');

    if (await testTransaction(client)) {
      console.log('Transaction test passed - environment is fully operational');
    } else {
      console.log('Transaction test failed - please check the error messages above');
    }
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

async function testTransaction(client: Client) {
  console.log('Testing transaction creation...');
  
  try {
    // Create a test OP_RETURN transaction
    // Convert test string to hex
    const testData = Buffer.from('test').toString('hex');
    console.log('Test data (hex):', testData);

    console.log('Creating raw transaction...');
    const rawTx = await client.createRawTransaction([], { data: testData });
    console.log('Raw transaction created');

    console.log('Funding transaction...');
    const fundedTx = await client.fundRawTransaction(rawTx);
    console.log('Transaction funded');

    console.log('Signing transaction...');
    const signedTx = await client.signRawTransactionWithWallet(fundedTx.hex);
    if (!signedTx.complete) {
      throw new Error('Failed to sign transaction');
    }
    console.log('Transaction signed');

    console.log('Sending transaction...');
    const txid = await client.sendRawTransaction(signedTx.hex);
    console.log('Test transaction created:', txid);
    
    // Generate a block to confirm it
    console.log('Generating confirmation block...');
    const confirmAddress = await client.getNewAddress();
    await client.generateToAddress(1, confirmAddress);
    console.log('Transaction confirmed');
    
    return true;
  } catch (error) {
    console.error('Test transaction failed:', error);
    return false;
  }
}

setupBitcoinRegtest(); 
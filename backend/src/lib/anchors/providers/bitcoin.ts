import Client from 'bitcoin-core';
import { Anchor, createAnchor } from '../core';

type BitcoinConfig = {
  mode: 'mainnet' | 'testnet' | 'regtest';
  rpcHost: string;
  rpcPort: number;
  rpcAuth: {
    username: string;
    password: string;
  };
  blocksRequired?: number; // Number of confirmations required for verification
};

export const createBitcoinAnchor = (config: BitcoinConfig): Anchor => {
  const client = new Client({
    network: config.mode,
    host: config.rpcHost,
    port: config.rpcPort,
    username: config.rpcAuth.username,
    password: config.rpcAuth.password,
  });

  // Default to 1 confirmation if not specified
  const requiredConfirmations = config.blocksRequired || 1;

  const anchor = async (hash: string) => {
    try {
      // Get a funded address
      const address = await client.getNewAddress();
      
      // Create outputs object
      const outputs = {};
      
      // Add OP_RETURN output with the hash directly (it's already in hex format)
      outputs['data'] = hash;
      
      // Add change output
      outputs[address] = 0.0001;

      // Create and fund the transaction
      const rawTx = await client.createRawTransaction([], outputs);
      const fundedTx = await client.fundRawTransaction(rawTx);
      
      // Sign and send
      const signedTx = await client.signRawTransactionWithWallet(fundedTx.hex);
      const txid = await client.sendRawTransaction(signedTx.hex);

      // Generate confirmation block in regtest
      if (config.mode === 'regtest') {
        await client.generateToAddress(1, address);
      }

      return `btc:${config.mode}:${txid}`;
    } catch (error) {
      console.error('Bitcoin anchoring failed:', error);
      throw error;
    }
  };

  const verify = async (proof: string) => {
    console.log('Verifying proof:', proof);
    if (!proof) {
      console.log('Proof is empty');
      return false;
    }
    
    const [protocol, mode, txid] = proof.split(':');
    console.log('Parsed proof:', { protocol, mode, txid });
    
    if (protocol !== 'btc' || mode !== config.mode || !txid) {
      console.log('Invalid proof format');
      return false;
    }

    try {
      // Get the transaction details
      console.log('Fetching transaction:', txid);
      const tx = await client.getRawTransaction(txid, true);
      console.log('Transaction details:', tx);

      // Check if transaction has enough confirmations
      if (tx.confirmations >= requiredConfirmations) {
        console.log('Transaction is confirmed with', tx.confirmations, 'confirmations (required:', requiredConfirmations, ')');
        return true;
      }

      console.log('Transaction has', tx.confirmations, 'confirmations, but', requiredConfirmations, 'are required');
      return false;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  };

  return createAnchor(anchor, verify);
};
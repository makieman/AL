import {
  Transaction,
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
const PAYMENT_AMOUNT = 0.1 * LAMPORTS_PER_SOL; // 100,000,000 lamports

/**
 * Create a referral on Solana using the Memo Program
 * @param {import('@solana/web3.js').Connection} connection
 * @param {Function} sendTransaction - from useWallet
 * @param {import('../types/referral').Referral} referral
 * @param {import('@solana/web3.js').PublicKey} payerPublicKey
 * @returns {Promise<string>} transaction signature
 */
export async function createReferral(connection, sendTransaction, referral, payerPublicKey) {
  const memoData = JSON.stringify(referral);
  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: payerPublicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoData, 'utf-8'),
  });

  const transaction = new Transaction().add(memoInstruction);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payerPublicKey;

  const signature = await sendTransaction(transaction, connection);

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed'
  );

  return signature;
}

/**
 * Fetch and parse a referral from a Solana transaction signature
 * @param {import('@solana/web3.js').Connection} connection
 * @param {string} signature
 * @returns {Promise<import('../types/referral').Referral | null>}
 */
export async function getReferral(connection, signature) {
  try {
    const tx = await connection.getParsedTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.transaction || !tx.transaction.message) {
      return null;
    }

    const instructions = tx.transaction.message.instructions;

    for (const ix of instructions) {
      // Check if this is a memo instruction
      const programId = ix.programId?.toBase58?.() || ix.programId;
      if (programId === MEMO_PROGRAM_ID.toBase58()) {
        // Parsed memo instructions have a 'parsed' field
        let memoText = null;
        if (ix.parsed) {
          memoText = typeof ix.parsed === 'string' ? ix.parsed : JSON.stringify(ix.parsed);
        } else if (ix.data) {
          // Raw instruction data — base58 encoded
          memoText = Buffer.from(ix.data, 'base64').toString('utf-8');
        }

        if (memoText) {
          try {
            const referral = JSON.parse(memoText);
            if (referral.app === 'afyalink') {
              if (!referral.referralId) {
                referral.referralId = signature;
              }
              return referral;
            }
          } catch {
            // Not valid JSON, continue
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching referral:', error);
    return null;
  }
}

/**
 * Send 0.1 SOL payment to a hospital wallet
 * @param {import('@solana/web3.js').Connection} connection
 * @param {Function} sendTransaction
 * @param {string} toWalletAddress
 * @param {import('@solana/web3.js').PublicKey} payerPublicKey
 * @returns {Promise<string>} payment signature
 */
export async function sendPayment(connection, sendTransaction, toWalletAddress, payerPublicKey) {
  const toPublicKey = new PublicKey(toWalletAddress);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payerPublicKey,
      toPubkey: toPublicKey,
      lamports: PAYMENT_AMOUNT,
    })
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payerPublicKey;

  const signature = await sendTransaction(transaction, connection);

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed'
  );

  return signature;
}

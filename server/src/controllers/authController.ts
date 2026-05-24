import { Request, Response } from 'express';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify';

interface NonceEntry {
  nonce: string;
  expiresAt: number;
}

// In-memory cache for storing nonces (address -> NonceEntry)
const nonceCache = new Map<string, NonceEntry>();

const NONCE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generates a challenge nonce for off-chain cryptographic wallet authentication.
 */
export const getNonceController = async (req: Request, res: Response) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: 'Wallet address parameter is required.' });
  }

  // Create a randomized challenge string
  const randomSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const nonce = `SuiLens AI Verification Challenge: ${randomSuffix}`;
  const expiresAt = Date.now() + NONCE_EXPIRY_MS;

  nonceCache.set(address.trim().toLowerCase(), { nonce, expiresAt });

  return res.json({ nonce });
};

/**
 * Verifies the cryptographic signature from a client's connected Sui wallet.
 */
export const verifySignatureController = async (req: Request, res: Response) => {
  const { address, signature, bytes } = req.body;
  
  if (!address || !signature || !bytes) {
    return res.status(400).json({ error: 'Address, Signature, and Bytes parameters are required.' });
  }

  const cleanAddress = address.trim().toLowerCase();
  const cached = nonceCache.get(cleanAddress);

  if (!cached) {
    return res.status(400).json({ error: 'Nonce session expired or not found. Please request a new verification code.' });
  }

  if (Date.now() > cached.expiresAt) {
    nonceCache.delete(cleanAddress);
    return res.status(400).json({ error: 'Verification challenge has expired. Please request a new one.' });
  }

  try {
    // 1. Decode the Base64 message bytes sent by the wallet
    const messageBytes = Uint8Array.from(Buffer.from(bytes, 'base64'));

    // 2. Decode the bytes to verify they match the exact challenge text we generated
    const decodedMessage = new TextDecoder().decode(messageBytes);
    
    if (!decodedMessage.includes(cached.nonce)) {
      return res.status(400).json({ error: 'Challenge message content mismatch.' });
    }

    // 3. Perform cryptographic verification against the expected Sui wallet address
    console.log(`[Cryptographic Auth] Verifying signature for address: ${address}`);
    
    const publicKey = await verifyPersonalMessageSignature(messageBytes, signature, {
      address: address.trim(),
    });

    if (!publicKey) {
      throw new Error('Signature verification returned an invalid public key.');
    }

    // Clean up cache to prevent replay attacks
    nonceCache.delete(cleanAddress);

    return res.json({ 
      success: true, 
      verified: true,
      address: address.trim() 
    });
  } catch (err: any) {
    console.error('[Cryptographic Verification Failure]', err);
    return res.status(401).json({ 
      error: err.message || 'Signature verification failed. Please check your credentials.' 
    });
  }
};

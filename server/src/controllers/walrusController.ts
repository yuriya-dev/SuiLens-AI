import { Request, Response } from 'express';
import { serverSavedAnalyses, generateMockWallet, mockWallets } from '../services/mockDb';

/**
 * Retrieves a published JSON report directly from the public Walrus Aggregator gateway.
 */
export const getWalrusBlobController = async (req: Request, res: Response) => {
  const { blobId } = req.params;
  if (!blobId) {
    return res.status(400).json({ error: 'Blob ID parameter is required.' });
  }

  // Intercept mock/simulated blob IDs
  if (blobId.startsWith('walrus-blob-')) {
    console.log(`[Walrus Gateway Mock Interceptor] Intercepted mock blobId: ${blobId}`);
    
    // Find the saved analysis in local memory to retrieve the associated address
    const saved = serverSavedAnalyses.find(a => a.blobId === blobId);
    const targetAddress = saved?.address || '0xde202f5a6b0c2eef9ba7582eb7bc3696f0188889a'; // fallback address
    
    // Get or generate target wallet data
    const walletData = mockWallets[targetAddress.toLowerCase()] || generateMockWallet(targetAddress);
    
    return res.json({
      blobId,
      gatewayUrl: `http://localhost:${process.env.PORT || 3001}/api/walrus/blob/${blobId}`,
      data: walletData
    });
  }

  try {
    console.log(`[Walrus Gateway] Fetching blob ${blobId} from public aggregator...`);
    const gatewayUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;
    
    const response = await fetch(gatewayUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to retrieve blob from Walrus aggregator: ${response.statusText}`);
    }

    const blobData = await response.json();
    return res.json({
      blobId,
      gatewayUrl,
      data: blobData
    });
  } catch (err: any) {
    console.error('[Walrus Gateway Error]', err);
    return res.status(500).json({ 
      error: err.message || 'Failed to fetch blob from decentralized gateway.' 
    });
  }
};

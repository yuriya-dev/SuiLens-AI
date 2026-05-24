import { Request, Response } from 'express';

/**
 * Retrieves a published JSON report directly from the public Walrus Aggregator gateway.
 */
export const getWalrusBlobController = async (req: Request, res: Response) => {
  const { blobId } = req.params;
  if (!blobId) {
    return res.status(400).json({ error: 'Blob ID parameter is required.' });
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

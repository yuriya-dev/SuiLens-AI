import { SavedAnalysis, serverSavedAnalyses } from './mockDb';
import { prisma, isDbActive } from './dbService';

export class WalrusService {
  /**
   * Uploads structured JSON report snapshot to Walrus decentralized storage publisher nodes.
   * Resolves content addressable hash proofs.
   */
  static async uploadReport(
    address: string,
    riskScore: number,
    reportData: any,
    simulateMode: boolean,
    walrusPublisher: string
  ): Promise<SavedAnalysis> {
    const randomHash = Math.random().toString(36).substring(2, 12);
    const size = JSON.stringify(reportData).length || 15000;
    
    let blobId = `walrus-blob-sui-lens-${randomHash}`;
    const port = process.env.PORT || 3001;
    let walrusUrl = `http://localhost:${port}/api/walrus/blob/${blobId}`;

    // If live mode is enabled, try uploading to actual Walrus publisher node
    if (!simulateMode && walrusPublisher) {
      try {
        console.log(`[Walrus Storage] Uploading decentralized report to ${walrusPublisher}...`);
        
        const response = await fetch(`${walrusPublisher}/v1/blobs?epochs=1`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData)
        });

        if (response.ok) {
          const resJson = await response.json();
          // Handle both brand-new blobs and pre-certified existing blobs
          if (resJson?.newlyCreated?.blobObject?.blobId) {
            blobId = resJson.newlyCreated.blobObject.blobId;
            console.log(`[Walrus Upload Success] Brand New Blob ID: ${blobId}`);
          } else if (resJson?.alreadyCertified?.blobId) {
            blobId = resJson.alreadyCertified.blobId;
            console.log(`[Walrus Upload Success] Pre-Existing Blob ID: ${blobId}`);
          }
          walrusUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;
        }
      } catch (err) {
        console.error('[Walrus Service Error] Fallback triggered:', err);
      }
    }

    const newSave: SavedAnalysis = {
      address,
      timestamp: new Date().toISOString(),
      riskScore,
      blobId,
      walrusUrl,
      sizeBytes: size
    };

    // Store in our database memory list
    const existsIdx = serverSavedAnalyses.findIndex(a => a.address.toLowerCase() === address.toLowerCase());
    if (existsIdx > -1) {
      serverSavedAnalyses[existsIdx] = newSave;
    } else {
      serverSavedAnalyses.unshift(newSave);
    }

    // Persist in Supabase Postgres when active
    if (isDbActive) {
      try {
        console.log(`[Database] Persisting report for ${address} in Supabase...`);
        const cleanAddress = address.toLowerCase();
        
        // 1. Ensure user exists
        await prisma.user.upsert({
          where: { address: cleanAddress },
          update: {},
          create: { address: cleanAddress }
        });

        // 2. Create/upsert the report mapping
        await prisma.report.upsert({
          where: { blobId },
          update: {
            riskScore,
            sizeBytes: size
          },
          create: {
            address: cleanAddress,
            riskScore,
            blobId,
            sizeBytes: size
          }
        });
        console.log(`[Database Success] Report mapped to user ${cleanAddress} in Postgres.`);
      } catch (dbErr) {
        console.error('[Database Error] Failed to persist report in Postgres:', dbErr);
      }
    }

    return newSave;
  }

  static getHistory(): SavedAnalysis[] {
    return serverSavedAnalyses;
  }
}

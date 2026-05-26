import { Request, Response } from 'express';
import { TatumService } from '../services/tatumService';
import { WalrusService } from '../services/walrusService';
import { AIService } from '../services/aiService';
import { serverWhaleFeed, generateMockWallet, mockWallets } from '../services/mockDb';
import { prisma, isDbActive } from '../services/dbService';

// Validate address inputs using Regex patterns for Sui standards (supports 40-char demo, 64-char standard addresses, and package::module::struct token types)
const validateSuiAddress = (addr: string): boolean => {
  const cleanAddr = addr.trim();
  const suiAddressRegex = /^0x[a-fA-F0-9]{40}$|^0x[a-fA-F0-9]{64}$/;
  const suiNameRegex = /^[a-zA-Z0-9_-]+\.sui$/;
  const suiTokenTypeRegex = /^0x[a-fA-F0-9]{40,64}::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/;
  return suiAddressRegex.test(cleanAddr) || suiNameRegex.test(cleanAddr) || suiTokenTypeRegex.test(cleanAddr);
};

export const analyzeWalletController = async (req: Request, res: Response) => {
  const { address, settings } = req.body;
  if (!address) {
    return res.status(400).json({ error: 'Address parameters are required.' });
  }

  // Address sanitization
  if (!validateSuiAddress(address)) {
    return res.status(400).json({
      error: 'Invalid address or format. Standard addresses must be a 40 or 64-character hexadecimal string starting with 0x, or end in .sui. Token structs must follow the pattern: packageId::module::struct.'
    });
  }

  const simulateMode = settings?.simulateMode !== false; // defaults to true
  
  // Secure server-side fallbacks for credentials
  const tatumApiKey = settings?.tatumApiKey || process.env.TATUM_API_KEY || '';
  const walrusPublisher = settings?.walrusPublisher || process.env.WALRUS_PUBLISHER_URL || 'https://publisher.walrus.storage';

  try {
    // 1. Fetch blockchain features via Tatum Service
    const walletData = await TatumService.getWalletData(address, simulateMode, tatumApiKey);
    
    // 2. Upload structured JSON snapshot asynchronously/synchronously to Walrus storage
    await WalrusService.uploadReport(
      walletData.address,
      walletData.riskScore,
      walletData,
      simulateMode,
      walrusPublisher
    );

    return res.json(walletData);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Internal analysis failure.' });
  }
};

export const historyController = async (req: Request, res: Response) => {
  try {
    if (isDbActive) {
      console.log('[Database] Fetching report snapshots from Supabase Postgres...');
      const dbHistory = await prisma.report.findMany({
        orderBy: { timestamp: 'desc' }
      });
      
      const historyList = dbHistory.map((r: any) => ({
        address: r.address,
        timestamp: r.timestamp.toISOString(),
        riskScore: r.riskScore,
        blobId: r.blobId,
        walrusUrl: r.blobId.startsWith('walrus-blob-')
          ? `http://localhost:${process.env.PORT || 3001}/api/walrus/blob/${r.blobId}`
          : `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${r.blobId}`,
        sizeBytes: r.sizeBytes
      }));
      return res.json(historyList);
    } else {
      const historyList = WalrusService.getHistory();
      return res.json(historyList);
    }
  } catch (err: any) {
    console.error('[History Controller Error]', err);
    return res.status(500).json({ error: 'Failed to fetch history logs.' });
  }
};

export const whalesController = (req: Request, res: Response) => {
  try {
    // Return mock whale feed list
    return res.json(serverWhaleFeed);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch whale feed.' });
  }
};

export const chatController = async (req: Request, res: Response) => {
  const { address, prompt, settings } = req.body;
  if (!address || !prompt) {
    return res.status(400).json({ error: 'Address and Prompt parameters are required.' });
  }

  // Address sanitization
  if (!validateSuiAddress(address)) {
    return res.status(400).json({
      error: 'Invalid address or format. Standard addresses must be a 40 or 64-character hexadecimal string starting with 0x, or end in .sui. Token structs must follow the pattern: packageId::module::struct.'
    });
  }

  const simulateMode = settings?.simulateMode !== false;
  
  // Secure server-side fallbacks for credentials
  const openaiApiKey = settings?.openaiApiKey || process.env.OPENAI_API_KEY || '';

  try {
    const aiText = await AIService.getChatReply(
      address,
      prompt,
      simulateMode,
      openaiApiKey,
      null
    );

    // Return HTTP 500 if AI reply is an API warning or error message
    if (aiText.includes('⚠️')) {
      return res.status(500).json({ error: aiText.replace(/⚠️/g, '').trim() });
    }

    // Save logs to Supabase if database is active
    if (isDbActive) {
      try {
        console.log(`[Database] Logging user and assistant messages for ${address} in Postgres...`);
        const cleanAddress = address.toLowerCase();
        
        await prisma.user.upsert({
          where: { address: cleanAddress },
          update: {},
          create: { address: cleanAddress }
        });

        await prisma.chat.create({
          data: {
            address: cleanAddress,
            role: 'user',
            content: prompt
          }
        });

        await prisma.chat.create({
          data: {
            address: cleanAddress,
            role: 'assistant',
            content: aiText
          }
        });
      } catch (dbErr) {
        console.error('[Database Error] Failed to persist chat log in Postgres:', dbErr);
      }
    }

    return res.json({ content: aiText });
  } catch (err: any) {
    return res.status(500).json({ error: 'AI reasoning failure.' });
  }
};

export const pricesController = async (req: Request, res: Response) => {
  try {
    const prices = await TatumService.getRealTimePrices();
    return res.json(prices);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch market prices.' });
  }
};

export const insightsController = async (req: Request, res: Response) => {
  const { settings } = req.body;
  const simulateMode = settings?.simulateMode !== false;
  const openaiApiKey = settings?.openaiApiKey || process.env.OPENAI_API_KEY || '';

  try {
    const insights = await AIService.getEcosystemInsights(simulateMode, openaiApiKey);
    return res.json(insights);
  } catch (err: any) {
    console.error('[Insights Controller Error]', err);
    return res.status(500).json({ error: 'Failed to generate ecosystem insights.' });
  }
};

export const telemetryController = async (req: Request, res: Response) => {
  const openaiApiKey = process.env.OPENAI_API_KEY || '';
  const walrusPublisher = process.env.WALRUS_PUBLISHER_URL || '';

  const ai = openaiApiKey && !openaiApiKey.includes('placeholder') ? 'ONLINE' : 'FALLBACK';
  const walrus = walrusPublisher && walrusPublisher.startsWith('http') ? 'SECURE' : 'OFFLINE';

  let sui: 'ACTIVE' | 'DEGRADED' | 'OFFLINE' = 'OFFLINE';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const rpcResponse = await fetch('https://fullnode.mainnet.sui.io:443', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sui_getLatestCheckpointSequenceNumber',
        params: []
      })
    });

    clearTimeout(timeout);
    sui = rpcResponse.ok ? 'ACTIVE' : 'DEGRADED';
  } catch {
    sui = 'OFFLINE';
  }

  return res.json({ ai, walrus, sui });
};

import { Request, Response } from 'express';
import { TatumService } from '../services/tatumService';
import { WalrusService } from '../services/walrusService';
import { AIService } from '../services/aiService';
import { serverWhaleFeed, generateMockWallet, mockWallets } from '../services/mockDb';

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

export const historyController = (req: Request, res: Response) => {
  try {
    const historyList = WalrusService.getHistory();
    return res.json(historyList);
  } catch (err: any) {
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

    return res.json({ content: aiText });
  } catch (err: any) {
    return res.status(500).json({ error: 'AI reasoning failure.' });
  }
};

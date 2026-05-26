export interface TokenAllocation {
  symbol: string;
  name: string;
  balance: number;
  valueUSD: number;
  percentage: number;
  color: string;
}

export interface TransactionActivity {
  id: string;
  type: 'swap' | 'transfer' | 'liquidity' | 'contract_call';
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: number;
  amountOut?: number;
  amountUSD: number;
  timestamp: string;
  status: 'success' | 'failed';
  hash: string;
  interactedWith: string;
  isSuspicious: boolean;
}

export interface RiskIndicator {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface WalletData {
  address: string;
  ensName?: string;
  portfolioValueUSD: number;
  riskScore: number;
  smartMoneyScore: number;
  whaleScore: number;
  scamExposureScore: number;
  personality: string;
  tag: string;
  summaryProfessional: string;
  summaryRoast: string;
  summaryExplainLike5: string;
  confidenceScore: number;
  tokenAllocations: TokenAllocation[];
  activityTimeline: TransactionActivity[];
  riskIndicators: RiskIndicator[];
}

export interface WhaleFeedItem {
  id: string;
  sender: string;
  senderName?: string;
  receiver: string;
  receiverName?: string;
  amount: number;
  token: string;
  amountUSD: number;
  type: 'transfer' | 'swap' | 'mint' | 'burn';
  timestamp: string;
  hash: string;
  isSuspicious: boolean;
}

export interface SavedAnalysis {
  address: string;
  timestamp: string;
  riskScore: number;
  blobId: string;
  walrusUrl: string;
  sizeBytes: number;
}

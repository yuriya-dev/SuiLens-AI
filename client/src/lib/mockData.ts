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

// ----------------------------------------------------
// Realistically detailed Mock Data
// ----------------------------------------------------

export const mockWallets: Record<string, WalletData> = {
  "0x7a8109d9f10be280b2a7582eb7bc3696f018888a": {
    address: "0x7a8109d9f10be280b2a7582eb7bc3696f018888a",
    ensName: "suilens.sui",
    portfolioValueUSD: 1450280.45,
    riskScore: 14,
    smartMoneyScore: 92,
    whaleScore: 88,
    scamExposureScore: 5,
    personality: "Smart Whale & Early Accumulator",
    tag: "Smart Whale",
    summaryProfessional: "This wallet demonstrates highly disciplined portfolio management characterized by long-term accumulation of blue-chip Sui ecosystem tokens. 72% of capital is deployed in SUI and liquid staking derivatives (LSTs). Transaction frequency is low but of large volume, primarily interacting with top-tier lending protocols like Scallop and Navi. Early buy-in patterns on emerging DEX tokens suggest strategic insider or sophisticated research alignment.",
    summaryRoast: "A mega-whale playing it safe. You are basically the institutional equivalent of a boring index fund investor who bought SUI at $0.40 and now spends their time counting dividends in yield farms. You're so risk-averse you probably verify smart contracts in your sleep. Where's the fun in a 14% risk score? Live a little, buy some memes.",
    summaryExplainLike5: "This wallet belongs to a very rich, smart digital dragon. Instead of buying silly toy coins that could disappear tomorrow, this dragon keeps their golden coins safe in the strongest digital castles. Sometimes, they let others borrow their coins in exchange for small interest coins, making their pile grow bigger every single day.",
    confidenceScore: 98,
    tokenAllocations: [
      { symbol: "SUI", name: "Sui Network", balance: 350000, valueUSD: 875000, percentage: 60.3, color: "#00d1ff" },
      { symbol: "haSUI", name: "Haedal Liquid Staked SUI", balance: 80000, valueUSD: 216000, percentage: 14.9, color: "#8b5cf6" },
      { symbol: "CETUS", name: "Cetus Token", balance: 120000, valueUSD: 156000, percentage: 10.8, color: "#6fe7ff" },
      { symbol: "USDC", name: "USD Coin", balance: 110000, valueUSD: 110000, percentage: 7.6, color: "#10b981" },
      { symbol: "DEEP", name: "DeepBook Token", balance: 290000, valueUSD: 93280.45, percentage: 6.4, color: "#f59e0b" }
    ],
    activityTimeline: [
      { id: "tx-1", type: "liquidity", amountUSD: 50000, timestamp: "2026-05-24T18:12:00Z", status: "success", hash: "0x3f5c...8b7d", interactedWith: "Cetus CLMM Pool", isSuspicious: false },
      { id: "tx-2", type: "swap", tokenIn: "USDC", tokenOut: "SUI", amountIn: 25000, amountOut: 10000, amountUSD: 25000, timestamp: "2026-05-23T14:05:00Z", status: "success", hash: "0x8e2b...4a1c", interactedWith: "Aggregator (7Capital)", isSuspicious: false },
      { id: "tx-3", type: "contract_call", amountUSD: 0, timestamp: "2026-05-21T09:30:00Z", status: "success", hash: "0x9d4a...3e5f", interactedWith: "Scallop Lending Protocol", isSuspicious: false },
      { id: "tx-4", type: "transfer", amountOut: 15000, tokenOut: "SUI", amountUSD: 37500, timestamp: "2026-05-18T11:22:00Z", status: "success", hash: "0x7c1f...9b8d", interactedWith: "0x981b...a24f", isSuspicious: false }
    ],
    riskIndicators: [
      { title: "High Stablecoin and Bluechip Ratio", description: "Over 80% of assets are in SUI, LSTs, or USDC, minimizing rapid downside exposure.", severity: "low" },
      { title: "Verified Smart Contract Interactors", description: "100% of transaction interactions are with audited and established protocols (Scallop, Navi, Cetus).", severity: "low" },
      { title: "Zero Low-Liquidity Token Holdings", description: "No exposure detected to tokens with under $50,000 in decentralized liquidity.", severity: "low" }
    ]
  },
  "0xde202f5a6b0c2eef9ba7582eb7bc3696f018889a": {
    address: "0xde202f5a6b0c2eef9ba7582eb7bc3696f018889a",
    ensName: "degentrader.sui",
    portfolioValueUSD: 24500.80,
    riskScore: 88,
    smartMoneyScore: 45,
    whaleScore: 12,
    scamExposureScore: 82,
    personality: "Degenerate Speculative Momentum Trader",
    tag: "High Degen",
    summaryProfessional: "This address exhibits classic speculative trading behaviors, showing rapid asset turnover and extreme concentration in high-volatility meme-assets. Over 90% of assets are deployed across newly minted tokens. The address actively swaps multiple times per hour, showing significant gas expenditures and high interaction with unverified token pools, resulting in a substantial 88% overall Risk Score.",
    summaryRoast: "You buy absolute garbage professionally. Your portfolio looks like a digital graveyard of tokens that will fall 99% before you even finish reading this roast. You spend more on SUI gas fees chasing 100x pump-and-dumps than your actual tokens are worth. Professional top-buyer. If there's an unverified contract deployed 2 minutes ago, you're signing that transaction with zero hesitation.",
    summaryExplainLike5: "This wallet belongs to a digital arcade player. Instead of buying good food or building a house, they spend all their allowances on highly unpredictable ticket drawings. Sometimes they win a teddy bear, but most of the time, they leave with empty pockets and a pocket full of glossy stickers that nobody wants.",
    confidenceScore: 91,
    tokenAllocations: [
      { symbol: "FROG", name: "Sui Frog Meme Token", balance: 450000000, valueUSD: 12250.40, percentage: 50.0, color: "#ef4444" },
      { symbol: "TURBO", name: "TurboSui", balance: 2500000, valueUSD: 6125.20, percentage: 25.0, color: "#f59e0b" },
      { symbol: "SUIPUMP", name: "SuiPump Coin", balance: 89000000, valueUSD: 4900.20, percentage: 20.0, color: "#8b5cf6" },
      { symbol: "SUI", name: "Sui Network", balance: 490, valueUSD: 1225.00, percentage: 5.0, color: "#00d1ff" }
    ],
    activityTimeline: [
      { id: "tx-d1", type: "swap", tokenIn: "SUI", tokenOut: "FROG", amountIn: 1200, amountOut: 150000000, amountUSD: 3000, timestamp: "2026-05-24T18:45:00Z", status: "success", hash: "0xda3f...a231", interactedWith: "Unverified Cetus Pool", isSuspicious: true },
      { id: "tx-d2", type: "swap", tokenIn: "SUIPUMP", tokenOut: "SUI", amountIn: 45000000, amountOut: 800, amountUSD: 2000, timestamp: "2026-05-24T18:22:00Z", status: "success", hash: "0xf11d...b24c", interactedWith: "BlueMove DEX", isSuspicious: false },
      { id: "tx-d3", type: "swap", tokenIn: "SUI", tokenOut: "TURBO", amountIn: 2500, amountOut: 1000000, amountUSD: 6250, timestamp: "2026-05-24T17:10:00Z", status: "success", hash: "0xc88e...44ff", interactedWith: "FlowX Finance", isSuspicious: true },
      { id: "tx-d4", type: "contract_call", amountUSD: 0, timestamp: "2026-05-24T16:05:00Z", status: "failed", hash: "0xb7c8...e11d", interactedWith: "Suspect Meme Presale Contract", isSuspicious: true }
    ],
    riskIndicators: [
      { title: "Interaction with Unverified Contracts", description: "Interacted with 5+ unverified smart contracts in the past 24 hours.", severity: "high" },
      { title: "Extreme Asset Concentration", description: "95% of total portfolio value is concentrated in highly illiquid memecoins.", severity: "high" },
      { title: "High Failure Rate of Transactions", description: "Frequent transaction failures (18% in last 100 tx) due to slippage or contract blocks.", severity: "medium" }
    ]
  },
  "0x3c2fa56b0c2eef9ba7582eb7bc3696f018882fd": {
    address: "0x3c2fa56b0c2eef9ba7582eb7bc3696f018882fd",
    ensName: "yieldfarmer.sui",
    portfolioValueUSD: 312050.00,
    riskScore: 28,
    smartMoneyScore: 78,
    whaleScore: 60,
    scamExposureScore: 15,
    personality: "Strategic DeFi Yield Farmer",
    tag: "DeFi Degen",
    summaryProfessional: "This address belongs to an optimized DeFi participant focused heavily on stable yield generation and liquidity provisioning. Assets are spread across yield-aggregators and stable pools, generating constant compounding interest. Over 40% of assets are in BUCK and USDC stablecoin positions, buffering the portfolio against broader market pullbacks.",
    summaryRoast: "You are the blockchain equivalent of a suburban dad wearing cargo shorts and clipping coupons. While others make or lose 100% in an hour, you celebrate a 12% APR stablecoin yield like you just won the lottery. You've read all 80 pages of every protocol's whitepaper and track your daily interest on an Excel sheet.",
    summaryExplainLike5: "This wallet belongs to a careful digital farmer. They don't plant dangerous magical weeds. Instead, they plant steady digital wheat and corn. Every day, they harvest a tiny bit of extra wheat, put it back in the ground, and watch their digital farm grow larger and safer day by day.",
    confidenceScore: 95,
    tokenAllocations: [
      { symbol: "BUCK", name: "Bucket Protocol Dollar", balance: 120000, valueUSD: 120000, percentage: 38.5, color: "#10b981" },
      { symbol: "USDC", name: "USD Coin", balance: 80000, valueUSD: 80000, percentage: 25.6, color: "#6fe7ff" },
      { symbol: "SUI", name: "Sui Network", balance: 25000, valueUSD: 62500, percentage: 20.0, color: "#00d1ff" },
      { symbol: "SCA", name: "Scallop Governance Token", balance: 65000, valueUSD: 49550, percentage: 15.9, color: "#8b5cf6" }
    ],
    activityTimeline: [
      { id: "tx-f1", type: "liquidity", amountUSD: 15000, timestamp: "2026-05-24T10:15:00Z", status: "success", hash: "0xa12b...b34f", interactedWith: "Bucket Stable Pool LP", isSuspicious: false },
      { id: "tx-f2", type: "contract_call", amountUSD: 0, timestamp: "2026-05-22T08:12:00Z", status: "success", hash: "0x89ee...45cc", interactedWith: "Navi Lending Supply", isSuspicious: false },
      { id: "tx-f3", type: "swap", tokenIn: "SUI", tokenOut: "BUCK", amountIn: 5000, amountOut: 12480, amountUSD: 12480, timestamp: "2026-05-20T16:22:00Z", status: "success", hash: "0xd13d...e44f", interactedWith: "Cetus StableSwap", isSuspicious: false }
    ],
    riskIndicators: [
      { title: "Stablecoin Dominance", description: "64% of total assets are stablecoins, shielding from cryptocurrency volatility.", severity: "low" },
      { title: "Smart Contract Dependency", description: "90% of assets are locked inside lending/LP smart contracts, introducing systemic smart-contract risk.", severity: "medium" }
    ]
  }
};

// Default fallback mock wallet for any newly entered search address
export const generateMockWallet = (address: string): WalletData => {
  const hashVal = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const calculatedRisk = (hashVal % 75) + 15; // Generates a stable pseudo-random risk score
  const isSuiName = address.endsWith('.sui');
  const shortAddress = isSuiName ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;

  let personality = "Moderate Multi-Asset Trader";
  let tag = "Active Trader";
  let summaryProfessional = `This wallet demonstrates active, moderate-risk trading habits within the Sui ecosystem. The wallet frequently balances SUI and standard DeFi tokens, with minor meme allocations. There are no critical signs of malicious honeypot creation, but consistent interaction with unverified DEX pairs adds slight systemic risk.`;
  let summaryRoast = `You're the absolute definition of an average retail trader. You're too scared to go full degen on microcaps, but too impatient to just hold SUI and earn staking yields. You buy things after they've pumped 20% and sell them at a 5% loss when you get bored. An average mid-wit wallet.`;
  let summaryExplainLike5 = `This wallet belongs to an ordinary digital storekeeper. They buy different types of digital fruits and sell them a few days later, hoping to make a tiny bit of profit. They are not extremely rich, but they are very careful not to lose all their toys.`;

  if (calculatedRisk > 70) {
    personality = "Aggressive Speculative Trader";
    tag = "High Risk Degen";
    summaryProfessional = `This wallet exhibits elevated risk parameters, characterized by recurrent purchases of recently launched, low-liquidity Sui tokens. A risk rating of ${calculatedRisk}% indicates high vulnerability to market manipulations or contract rug pulls.`;
    summaryRoast = `You buy tokens based purely on their logo design on Twitter. You probably have 45 different worthless tokens in your wallet and still tell your friends you're 'diversified'. Stop chasing green candles on 10k liquidity pools.`;
  } else if (calculatedRisk < 30) {
    personality = "Prudent Value Accumulator";
    tag = "Low Risk Holder";
    summaryProfessional = `This address focuses on safe, long-term capital preservation. High stablecoin ratios and active staking verify a conservative trading thesis. Smart contract engagements are limited exclusively to top-tier protocols.`;
    summaryRoast = `You're basically a crypto senior citizen. You treat the blockchain like a savings account. Wake up! Staking SUI for 4% is safe, but you're missing out on all the chaos. Your wallet's excitement level is absolute zero.`;
  }

  return {
    address: address.startsWith('0x') ? address : '0x' + address.slice(0, 40),
    ensName: isSuiName ? address : `${address.slice(0, 8)}.sui`,
    portfolioValueUSD: (hashVal * 123) % 450000 + 1200,
    riskScore: calculatedRisk,
    smartMoneyScore: (hashVal % 65) + 20,
    whaleScore: (hashVal % 70) + 10,
    scamExposureScore: (calculatedRisk * 0.9) | 0,
    personality,
    tag,
    summaryProfessional,
    summaryRoast,
    summaryExplainLike5,
    confidenceScore: 85,
    tokenAllocations: [
      { symbol: "SUI", name: "Sui Network", balance: (hashVal % 5000) + 10, valueUSD: ((hashVal % 5000) + 10) * 2.5, percentage: 55.0, color: "#00d1ff" },
      { symbol: "CETUS", name: "Cetus Token", balance: (hashVal % 8000), valueUSD: ((hashVal % 8000)) * 1.3, percentage: 25.0, color: "#6fe7ff" },
      { symbol: "USDC", name: "USD Coin", balance: (hashVal % 3000), valueUSD: (hashVal % 3000), percentage: 20.0, color: "#10b981" }
    ],
    activityTimeline: [
      { id: "tx-m1", type: "swap", tokenIn: "USDC", tokenOut: "SUI", amountIn: 500, amountOut: 200, amountUSD: 500, timestamp: "2026-05-24T12:00:00Z", status: "success", hash: `0x${hashVal}a...b89c`, interactedWith: "Aggregator (7Capital)", isSuspicious: false },
      { id: "tx-m2", type: "swap", tokenIn: "SUI", tokenOut: "CETUS", amountIn: 100, amountOut: 200, amountUSD: 250, timestamp: "2026-05-23T08:15:00Z", status: "success", hash: `0x${hashVal}c...d77e`, interactedWith: "Cetus CLMM", isSuspicious: false }
    ],
    riskIndicators: [
      { title: "Standard Protocol Usage", description: "Interacts primarily with main-tier DeFi primitives.", severity: calculatedRisk > 60 ? "medium" : "low" },
      { title: "Decentralized Liquidity Risk", description: "Exposure to mid-cap assets exposes the wallet to minor slippage.", severity: calculatedRisk > 60 ? "high" : "medium" }
    ]
  };
};

// ----------------------------------------------------
// Mock Whale Feed Data (Simulated live streams)
// ----------------------------------------------------

export const initialWhaleFeed: WhaleFeedItem[] = [
  { id: "w-1", sender: "0x7a8109d9f10be280b2a7582eb7bc3696f018888a", senderName: "suilens.sui", receiver: "0x3c2fa56b0c2eef9ba7582eb7bc3696f018882fd", receiverName: "yieldfarmer.sui", amount: 150000, token: "SUI", amountUSD: 375000, type: "transfer", timestamp: "2026-05-24T18:55:00Z", hash: "0xfa12...99bc", isSuspicious: false },
  { id: "w-2", sender: "0xab12...cde3", receiver: "Cetus Router Contract", amount: 500000, token: "CETUS", amountUSD: 650000, type: "swap", timestamp: "2026-05-24T18:52:12Z", hash: "0xbc3f...78da", isSuspicious: false },
  { id: "w-3", sender: "0xde202f5a6b0c2eef9ba7582eb7bc3696f018889a", senderName: "degentrader.sui", receiver: "0xf9b1...a231", amount: 85000000, token: "FROG", amountUSD: 23120, type: "transfer", timestamp: "2026-05-24T18:49:05Z", hash: "0x7d3f...ef91", isSuspicious: true },
  { id: "w-4", sender: "0x44ee...9900", receiver: "Bucket Protocol Vault", amount: 250000, token: "BUCK", amountUSD: 250000, type: "mint", timestamp: "2026-05-24T18:42:00Z", hash: "0x88ea...d45e", isSuspicious: false }
];

export const generateRandomWhaleTx = (): WhaleFeedItem => {
  const tokens = ["SUI", "haSUI", "CETUS", "BUCK", "USDC", "FROG", "DEEP"];
  const selectedToken = tokens[Math.floor(Math.random() * tokens.length)];
  const amount = Math.floor(Math.random() * 80000) + 5000;
  
  let rate = 1.0;
  if (selectedToken === "SUI" || selectedToken === "haSUI") rate = 2.5;
  else if (selectedToken === "CETUS") rate = 1.3;
  else if (selectedToken === "DEEP") rate = 0.32;
  else if (selectedToken === "FROG") rate = 0.0003;
  
  const valueUSD = amount * rate;
  const isSuspicious = selectedToken === "FROG" || Math.random() > 0.85;

  return {
    id: `w-rand-${Math.random().toString(36).slice(2, 9)}`,
    sender: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    receiver: Math.random() > 0.5 ? "DEX Aggregator" : `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    amount,
    token: selectedToken,
    amountUSD: Math.round(valueUSD * 100) / 100,
    type: Math.random() > 0.4 ? "swap" : "transfer",
    timestamp: new Date().toISOString(),
    hash: `0x${Math.random().toString(16).slice(2, 10)}...hash`,
    isSuspicious
  };
};

// ----------------------------------------------------
// Mock Walrus Storage Logs
// ----------------------------------------------------

export const initialSavedAnalyses: SavedAnalysis[] = [
  { address: "0x7a8109d9f10be280b2a7582eb7bc3696f018888a", timestamp: "2026-05-24T18:12:00Z", riskScore: 14, blobId: "walrus-blob-sui-lens-whale-9034", walrusUrl: "https://aggregator.walrus-testnet.walrus.space/v1/blobs/walrus-blob-sui-lens-whale-9034", sizeBytes: 15420 },
  { address: "0xde202f5a6b0c2eef9ba7582eb7bc3696f018889a", timestamp: "2026-05-24T18:45:00Z", riskScore: 88, blobId: "walrus-blob-sui-lens-degen-4122", walrusUrl: "https://aggregator.walrus-testnet.walrus.space/v1/blobs/walrus-blob-sui-lens-degen-4122", sizeBytes: 18910 },
  { address: "0x3c2fa56b0c2eef9ba7582eb7bc3696f018882fd", timestamp: "2026-05-24T10:15:00Z", riskScore: 28, blobId: "walrus-blob-sui-lens-farmer-5592", walrusUrl: "https://aggregator.walrus-testnet.walrus.space/v1/blobs/walrus-blob-sui-lens-farmer-5592", sizeBytes: 16212 }
];

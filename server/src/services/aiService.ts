import { WalletData, mockWallets, generateMockWallet } from './mockDb';

export class AIService {
  /**
   * Generates conversational AI copilot replies.
   * If live mode is enabled, connects to OpenAI, otherwise streams highly dynamic local contextual briefs.
   */
  static async getChatReply(
    address: string,
    prompt: string,
    simulateMode: boolean,
    openaiApiKey: string,
    currentWalletData: WalletData | null
  ): Promise<string> {
    const formattedAddress = address.trim().toLowerCase();
    
    // Resolve wallet dataset
    const wallet = currentWalletData || mockWallets[formattedAddress] || generateMockWallet(address);

    const cleanPrompt = prompt.toLowerCase();
    const isRoast = cleanPrompt.includes('roast') || cleanPrompt.includes('degenerate') || cleanPrompt.includes('roast me') || cleanPrompt.includes('roasting');
    const isEli5 = cleanPrompt.includes('5') || cleanPrompt.includes('five') || cleanPrompt.includes('eli5') || cleanPrompt.includes('child');
    const isRisk = cleanPrompt.includes('risk') || cleanPrompt.includes('vulnerabilit') || cleanPrompt.includes('security') || cleanPrompt.includes('scam') || cleanPrompt.includes('safe');

    // If live mode is enabled and OpenAI API Key is present, execute a real chat request to OpenAI
    if (!simulateMode && openaiApiKey && !openaiApiKey.includes('placeholder')) {
      try {
        console.log(`[OpenAI API] Creating chat prompt for ${address}...`);
        
        let systemPrompt = `You are SuiLens AI - a master Web3 researcher and elite onchain analyst. 
        You are analyzing the Sui wallet: ${wallet.address}. 
        Here is the wallet metadata:
        - Portfolio value: $${wallet.portfolioValueUSD}
        - Risk score: ${wallet.riskScore}%
        - Smart Money Score: ${wallet.smartMoneyScore}%
        - Personality description: ${wallet.personality}
        - Token Allocations: ${JSON.stringify(wallet.tokenAllocations)}
        - Risk warnings: ${JSON.stringify(wallet.riskIndicators)}
        
        Answer the user prompt cleanly in professional terminal text, using markdown formatting.`;

        if (isRoast) {
          systemPrompt += ` The user has requested ROAST MODE. Be extremely funny, sarcastic, and cynical about their trading choices and holdings.`;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          const aiText = resJson?.choices?.[0]?.message?.content;
          if (aiText) {
            return aiText;
          }
        }
      } catch (err) {
        console.error('[OpenAI API Error] Fallback triggered:', err);
      }
    }

    // --- Local Dynamic Web3 AI Analyst Engine (Zero-Config Mode) ---
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Extract wallet stats for highly personalized local outputs
    const value = wallet.portfolioValueUSD;
    const suiAlloc = wallet.tokenAllocations.find(t => t.symbol === 'SUI');
    const usdcAlloc = wallet.tokenAllocations.find(t => t.symbol === 'USDC');
    const stakedAlloc = wallet.tokenAllocations.find(t => t.symbol === 'Staked SUI');
    
    const suiBal = suiAlloc ? suiAlloc.balance : 0;
    const usdcBal = usdcAlloc ? usdcAlloc.balance : 0;
    const stakedBal = stakedAlloc ? stakedAlloc.balance : 0;
    const positions = wallet.tokenAllocations.length;
    const risk = wallet.riskScore;

    // 1. Savage Roast Mode
    if (isRoast) {
      let roastText = `🔥 **SuiLens AI Savage Roast Mode Activated:**\n\n`;
      roastText += `Well well, let's take a look at the on-chain disaster at address \`${wallet.address.slice(0, 10)}...\`!\n\n`;
      
      if (usdcBal > 2000) {
        roastText += `• **stablecoin Coward Alert:** You are holding **${usdcBal.toLocaleString()} USDC**. On a high-performance parallelized blockchain like Sui! Why are you treating this state-of-the-art tech like a dusty local credit union savings account? Are you afraid of green candles? Keeping over $5,000 in dollar-pegged koin while others are 100x-ing is peak risk-averse boomer energy.\n\n`;
      }
      
      if (suiBal > 0) {
        roastText += `• **Liquid SUI Stash:** You have **${suiBal.toFixed(2)} liquid SUI**. That's barely enough gas money to buy a single hyped memecoin before getting rugged by a dev who isn't even old enough to vote. At least stake it or supply it to lending pools instead of letting it sit idle under your digital pillow!\n\n`;
      }
      
      if (stakedBal > 0) {
        roastText += `• **Staked SUI:** You have **${stakedBal.toFixed(2)} SUI staked**. Wow, a whole 4% annual interest! You'll be able to buy a coffee with your staking rewards in about three years. Strategic genius right here!\n\n`;
      }

      if (risk > 50) {
        roastText += `• **High Risk Junkie:** Your risk index is a massive **${risk}%**. Your wallet has interacted with unverified contract objects and scam airdrops. You are literally one wrong signature away from sending all your USDC to a hacker's vault.\n\n`;
      } else {
        roastText += `• **Risk-Averse Coward:** A risk score of **${risk}%**? Do you read whitepapers before swapping $5? Where is the thrill? Buy some high-slippage memecoins or go back to Web2 bank transfers.\n\n`;
      }
      
      roastText += `**Verdict:** Your total portfolio is worth **$${value.toLocaleString()} USD**. It is neat, but you are playing it way too safe or chasing worthless airdrops. Step up your game or let our AI take over your trades!`;
      return roastText;
    }
    
    // 2. Explain Like I'm 5 (ELI5)
    if (isEli5) {
      let eli5Text = `👶 **Explain Like I'm 5 Mode:**\n\n`;
      eli5Text += `Imagine your wallet is a beautiful, shiny neon treasure box at address \`${wallet.address.slice(0, 8)}...\`!\n\n`;
      eli5Text += `• Inside your box, the digital scanner looked around and found **${positions} different kinds of toys**.\n`;
      
      if (usdcBal > 0) {
        eli5Text += `• The biggest, heaviest toy is a stack of green bricks called **USDC**, worth exactly **$${usdcBal.toLocaleString(undefined, {maximumFractionDigits: 2})} green papers**. These bricks are very safe and never change size, no matter what!\n`;
      }
      
      if (suiBal > 0) {
        eli5Text += `• You also have **${suiBal.toFixed(2)} shiny blue water droplets called SUI**. These droplets are magical—they let you pay the digital gatekeepers to move your toys around from room to room!\n`;
      }
      
      if (stakedBal > 0) {
        eli5Text += `• You have **${stakedBal.toFixed(2)} SUI droplets** locked in a magic garden where they grow bigger droplets every single day! Very smart farming!\n`;
      }
      
      eli5Text += `\nOverall, your treasure box has a total value of **$${value.toLocaleString()} USD**. It is a very nice, heavy, and extremely safe treasure box!`;
      return eli5Text;
    }
    
    // 3. Dynamic Security & Risk Report
    if (isRisk) {
      let riskText = `🚨 **SuiLens AI Security & Risk Analysis Report:**\n\n`;
      riskText += `Wallet Address: \`${wallet.address}\`\n`;
      riskText += `Calculated Risk Index: **${risk}%** (Confidence: 99%)\n\n`;
      
      riskText += `**Risk Indicator Breakdown:**\n`;
      wallet.riskIndicators.forEach((ind, i) => {
        const icon = ind.severity === 'high' ? '🔴' : ind.severity === 'medium' ? '🟡' : '🟢';
        riskText += `${i+1}. ${icon} **${ind.title}** (Severity: ${ind.severity.toUpperCase()})\n   └ ${ind.description}\n`;
      });
      
      if (wallet.scamExposureScore > 40) {
        riskText += `\n⚠️ **WARNING:** Elevated scam object exposure detected (**${wallet.scamExposureScore}%**). Your wallet holds unverified airdrop objects. Do **NOT** interact, call, or burn these objects as they may contain malicious Move entry points designed to drain your USDC.`;
      } else {
        riskText += `\n✅ **SECURITY STANDING:** Excellent. No active honeypots, malicious Move packages, or unverified ledger contracts have compromised your balances.`;
      }
      
      return riskText;
    }
    
    // 4. Dynamic Balances & Portfolio Queries
    if (cleanPrompt.includes('balance') || cleanPrompt.includes('how much') || cleanPrompt.includes('hold') || cleanPrompt.includes('portfolio') || cleanPrompt.includes('worth')) {
      let balText = `📊 **SuiLens On-Chain Portfolio Analysis:**\n\n`;
      balText += `Wallet Address: \`${wallet.address}\`\n`;
      balText += `Total Net Worth: **$${value.toLocaleString()} USD**\n\n`;
      
      balText += `**Token Holdings Breakdown:**\n`;
      wallet.tokenAllocations.forEach(tok => {
        balText += `• **${tok.symbol}** (${tok.name}):\n`;
        balText += `  └ Balance: \`${tok.balance.toLocaleString()}\` ${tok.symbol}\n`;
        balText += `  └ USD Value: \`$${tok.valueUSD.toLocaleString()}\` USD (${tok.percentage}% allocation)\n`;
      });
      
      if (stakedBal > 0) {
        balText += `\n💡 **Validator Staking Details:** You are delegating **${stakedBal.toLocaleString()} SUI** to native validator nodes. Staking validator rewards are accumulating directly into your delegation pools.`;
      }
      
      return balText;
    }

    // 5. Default Witty & Informative AI Response
    let defaultText = `🔮 **SuiLens AI Copilot Web3 Analyst Engine:**\n\n`;
    defaultText += `Greetings researcher. I have fully dissected the active ledger state of wallet \`${wallet.address.slice(0, 12)}...\` on Sui Mainnet.\n\n`;
    defaultText += `**Dissection Summary:**\n`;
    defaultText += `• Net Worth: **$${value.toLocaleString()} USD**\n`;
    defaultText += `• Unique Positions: **${positions} token assets**\n`;
    defaultText += `• Liquid SUI: **${suiBal.toLocaleString()} SUI**\n`;
    if (usdcBal > 0) defaultText += `• USD Coin (USDC): **${usdcBal.toLocaleString()} USDC**\n`;
    if (stakedBal > 0) defaultText += `• Validator Staked SUI: **${stakedBal.toLocaleString()} SUI**\n`;
    defaultText += `• Security Standing: **${risk}% Risk index**\n\n`;
    
    defaultText += `**Professional Recommendation:**\n`;
    if (usdcBal > 1000) {
      defaultText += `Your wallet holds a solid base of capital. Since you hold a significant stablecoin balance of **$${usdcBal.toLocaleString()} USDC**, I highly recommend checking yield aggregators like Cetus CLMM Pools, Scallop, or Navi lending pools to earn yield instead of letting it sit idle.\n\n`;
    } else {
      defaultText += `Your portfolio has a well-diversified on-chain profile. You are in a secure position with standard protocol exposures.\n\n`;
    }
    
    defaultText += `*Tip: Try asking me "roast my wallet" 🔥, "explain like I'm 5" 👶, or "risk analysis" 🚨 for customized cognitive views of your assets.*`;
    
    return defaultText;
  }
}

import { WalletData, mockWallets, generateMockWallet } from './mockDb';

export class AIService {
  /**
   * Generates conversational AI copilot replies.
   * If live mode is enabled, connects to OpenAI, otherwise streams preset contextual logs.
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

    const isRoast = prompt.toLowerCase().includes('roast') || prompt.toLowerCase().includes('degenerate');
    const isEli5 = prompt.toLowerCase().includes('5') || prompt.toLowerCase().includes('five');
    const isRisk = prompt.toLowerCase().includes('risk') || prompt.toLowerCase().includes('vulnerabilit');

    // If live mode is enabled, try executing a real chat request to OpenAI
    if (!simulateMode && openaiApiKey) {
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

    // Smart simulated responses (instant high-end demo)
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (isRoast) {
      return `🔥 AI ROAST INITIATED:\n\n"${wallet.summaryRoast}"\n\nGas spent on illiquid contracts: too high. Regrets: probably higher.`;
    } else if (isEli5) {
      return `👶 EXPLAINING LIKE YOU'RE 5:\n\n"${wallet.summaryExplainLike5}"`;
    } else if (isRisk) {
      return `🚨 RISK PROFILE METRIC DEEP-DIVE:\n\nOverall Risk Score is ${wallet.riskScore}%. Here is the breakdown:\n\n` + 
        wallet.riskIndicators.map((ind, i) => `${i+1}. **${ind.title}** (Severity: ${ind.severity.toUpperCase()})\n   └ ${ind.description}`).join('\n\n');
    } else {
      return `📊 PROFESSIONAL PORTFOLIO BRIEF:\n\n${wallet.summaryProfessional}\n\n**Holdings Allocation Breakdown:**\n` + 
        wallet.tokenAllocations.map(tok => `• **${tok.symbol}** (${tok.name}): ${tok.percentage}% allocation (~$${tok.valueUSD.toLocaleString()})`).join('\n') + 
        `\n\nIs there a specific contract or transaction hash you would like me to dissect further?`;
    }
  }
}

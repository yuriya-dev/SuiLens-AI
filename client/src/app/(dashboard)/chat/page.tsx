'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  Send, 
  Cpu, 
  User, 
  Database,
  Terminal,
  HelpCircle,
  TrendingUp,
  Brain,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

function ChatWindow() {
  const searchParams = useSearchParams();
  const addressParam = searchParams.get('address');

  const { 
    currentWalletData, 
    chatThreads, 
    addChatMessage, 
    analyzeWallet 
  } = useStore();

  const [input, setInput] = useState('');
  const [activeAddress, setActiveAddress] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set the default chat focus target
  useEffect(() => {
    if (addressParam) {
      setActiveAddress(addressParam.toLowerCase());
    } else if (currentWalletData) {
      setActiveAddress(currentWalletData.address.toLowerCase());
    } else {
      // Fallback default address
      setActiveAddress('0x7a8109d9f10be280b2a7582eb7bc3696f018888a');
    }
  }, [addressParam, currentWalletData]);

  // Retrieve current conversation thread
  const messages = chatThreads[activeAddress] || [];

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isReplying]);

  const presetQuestions = [
    { q: "Is this wallet a smart whale?", prompt: "Analyze if this wallet exhibits smart money buy-ins, low risk profile, or early entry positions. Answer thoroughly." },
    { q: "Explain the biggest risk factors here.", prompt: "Explain the biggest vulnerabilities in this wallet portfolio. Focus on token concentration and protocol exposure risks." },
    { q: "Roast this wallet's memecoin allocations.", prompt: "Unleash a savage AI roast regarding this wallet's meme coin exposure and degenerate trading patterns." },
    { q: "Explain like I am 5 years old.", prompt: "Explain the general behavior of this wallet using a simple kid-friendly story." }
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isReplying) return;

    // 1. Add User Message
    addChatMessage(activeAddress, { role: 'user', content: text });
    setInput('');
    setIsReplying(true);

    // 2. Simulate streaming reply delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 3. Assemble dynamic contextual AI response based on active wallet datasets
    let aiContent = "I have scanned the blockchain entries. The SUI ledger is currently synchronized.";
    const isRoast = text.toLowerCase().includes('roast') || text.toLowerCase().includes('degenerate');
    const isEli5 = text.toLowerCase().includes('5') || text.toLowerCase().includes('five');
    const isRisk = text.toLowerCase().includes('risk') || text.toLowerCase().includes('vulnerabilit');

    if (currentWalletData && currentWalletData.address.toLowerCase() === activeAddress) {
      if (isRoast) {
        aiContent = `🔥 AI ROAST INITIATED:\n\n"${currentWalletData.summaryRoast}"\n\nGas spent: high. Regrets: probably higher.`;
      } else if (isEli5) {
        aiContent = `👶 EXPLAINING LIKE YOU'RE 5:\n\n"${currentWalletData.summaryExplainLike5}"`;
      } else if (isRisk) {
        aiContent = `🚨 RISK PROFILE METRIC DEEP-DIVE:\n\nOverall Risk Score is ${currentWalletData.riskScore}%. Here is the breakdown:\n\n` + 
          currentWalletData.riskIndicators.map((ind, i) => `${i+1}. **${ind.title}** (Severity: ${ind.severity.toUpperCase()})\n   └ ${ind.description}`).join('\n\n');
      } else {
        aiContent = `📊 PROFESSIONAL PORTFOLIO BRIEF:\n\n${currentWalletData.summaryProfessional}\n\n**Holdings Allocation Breakdown:**\n` + 
          currentWalletData.tokenAllocations.map(tok => `• **${tok.symbol}** (${tok.name}): ${tok.percentage}% allocation (~$${tok.valueUSD.toLocaleString()})`).join('\n') + 
          `\n\nIs there a specific contract or transaction hash you would like me to dissect further?`;
      }
    } else {
      aiContent = `I am analyzing the wallet address ${activeAddress}. According to recent Tatum ledger snapshots, this wallet operates with standard DeFi activities. Interacted with Cetus routing and Scallop pools, exhibiting moderate risk levels. Try entering 'Explain the biggest risk factors here' to see complete detailed parameters.`;
    }

    addChatMessage(activeAddress, { role: 'assistant', content: aiContent });
    setIsReplying(false);
  };

  const activeWalletShort = activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'Loading...';

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-between text-left">
      {/* Top Banner Overview */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white tracking-wide flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-cyan-glow" />
            Natural Language Copilot
          </h1>
          <p className="font-sans text-xs text-white/40 uppercase tracking-widest mt-1">
            Contextual AI Wallet Assistant for: <span className="text-cyan-glow font-mono font-bold">{currentWalletData?.ensName || activeWalletShort}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(0,209,255,0.06)] border border-cyan-glow/10 text-cyan-glow text-[10px] font-display font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>Contextual Memory Live</span>
        </div>
      </div>

      {/* Chat Messages Log Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {messages.length === 0 ? (
          /* Empty Chat Splash screen */
          <div className="max-w-xl mx-auto text-center py-12 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-glow/5 border border-cyan-glow/20 flex items-center justify-center text-cyan-glow mx-auto animate-pulse">
              <Brain className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-lg text-white">Ask SuiLens AI Anything</h3>
              <p className="font-sans text-xs text-white/40 leading-relaxed">
                Query contract metrics, explain trading profiles, roast meme allocations, or investigate rug risks inside wallet <span className="text-cyan-glow font-mono font-semibold">{activeWalletShort}</span>.
              </p>
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end text-right' : 'justify-start text-left'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-glow to-purple-glow flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,209,255,0.2)]">
                    <Cpu className="w-5 h-5 text-[#050816]" />
                  </div>
                )}
                
                <div className={`p-4.5 rounded-2xl max-w-[85%] leading-relaxed font-sans text-xs shadow-md border whitespace-pre-line
                  ${msg.role === 'user'
                    ? 'bg-cyan-glow/10 border-cyan-glow/20 text-white rounded-tr-none'
                    : 'bg-[#0b1220]/75 border-white/5 text-white/90 rounded-tl-none'
                  }
                `}>
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white/60" />
                  </div>
                )}
              </div>
            ))}

            {isReplying && (
              <div className="flex gap-4 justify-start text-left">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-glow to-purple-glow flex items-center justify-center shrink-0 animate-pulse">
                  <Cpu className="w-5 h-5 text-[#050816]" />
                </div>
                <div className="bg-[#0b1220]/75 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-bounce delay-300"></span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Preset suggestions & input block */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        {/* Preset chips */}
        {messages.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {presetQuestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.prompt)}
                disabled={isReplying}
                className="text-left text-xs p-3.5 rounded-xl border border-white/5 bg-white/2 hover:bg-cyan-glow/5 hover:border-cyan-glow/20 text-white/60 hover:text-white transition-all cursor-pointer truncate font-display font-bold uppercase tracking-wider"
              >
                {chip.q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="max-w-4xl mx-auto relative flex gap-3"
        >
          <input 
            type="text"
            placeholder={`Ask AI Copilot about this wallet address...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isReplying}
            className="flex-1 bg-[#0b1220]/60 border border-white/10 focus:border-cyan-glow text-white text-xs pl-5 pr-14 py-4 rounded-xl outline-none transition-all shadow-[0_4px_12px_rgba(0,0,0,0.3)] focus:shadow-[0_0_20px_rgba(0,209,255,0.1)] disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isReplying}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-cyan-glow hover:bg-sui-blue text-[#050816] flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AIChatCopilot() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-140px)] items-center justify-center text-white/40 font-mono text-xs uppercase tracking-widest gap-2">
        <Cpu className="w-5 h-5 text-cyan-glow animate-spin" />
        LOADING COPILOT MEMORY VAULTS...
      </div>
    }>
      <ChatWindow />
    </Suspense>
  );
}

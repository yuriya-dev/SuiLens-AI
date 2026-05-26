'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import MarkdownText from '@/components/MarkdownText';
import { 
  Send, 
  Cpu, 
  User, 
  Brain,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY_MESSAGES: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string }> = [];

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Gagal memproses pesan AI. Silakan periksa kunci API Anda.';
};

function ChatWindow() {
  const searchParams = useSearchParams();
  const addressParam = searchParams.get('address');

  const { 
    currentWalletData, 
    chatThreads, 
    addChatMessage,
    analyzeWallet,
    connectedWallet
  } = useStore();

  const [input, setInput] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const activeAddress = React.useMemo(() => {
    if (addressParam) return addressParam.toLowerCase();
    if (manualAddress) return manualAddress;
    if (currentWalletData) return currentWalletData.address.toLowerCase();
    if (connectedWallet) return connectedWallet.toLowerCase();
    return '';
  }, [addressParam, manualAddress, currentWalletData, connectedWallet]);

  // Retrieve current conversation thread
  const messages = React.useMemo(
    () => chatThreads[activeAddress] ?? EMPTY_MESSAGES,
    [chatThreads, activeAddress]
  );

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isReplying]);

  const isContractAddress = activeAddress.includes('::') || 
                            currentWalletData?.tag === 'Verified Token' || 
                            currentWalletData?.tag === 'Smart Contract' ||
                            currentWalletData?.personality?.includes('Contract') ||
                            currentWalletData?.personality?.includes('Token');

  const contractPresetQuestions = [
    { q: "Is this token safe?", prompt: "Analyze the security of this token contract, checking for potential backdoors, lockups, supply distribution, or honey-pot risks." },
    { q: "Explain token utility.", prompt: "Explain the utility, supply dynamics, and Move modules of this token contract." },
    { q: "Roast this token contract! 🔥", prompt: "Unleash a savage AI roast of this token contract's supply size, potential meme status, and template design." },
    { q: "Explain like I'm 5.", prompt: "Explain what this token contract does and how it works using a simple story a 5-year-old would understand." }
  ];

  const walletPresetQuestions = [
    { q: "Is this wallet a smart money?", prompt: "Analyze if this wallet exhibits smart money buy-ins, low risk profile, or early entry positions. Answer thoroughly." },
    { q: "Explain the biggest risk factors.", prompt: "Explain the biggest vulnerabilities in this wallet portfolio. Focus on token concentration and protocol exposure risks." },
    { q: "Roast this wallet's allocations! 🔥", prompt: "Unleash a savage AI roast regarding this wallet's meme coin exposure and degenerate trading patterns." },
    { q: "Explain like I'm 5 years old.", prompt: "Explain the general behavior of this wallet using a simple kid-friendly story." }
  ];

  const presetQuestions = isContractAddress ? contractPresetQuestions : walletPresetQuestions;

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isReplying) return;

    setInput('');
    setIsReplying(true);

    try {
      // Direct call to Zustand action which handles User addition, API fetch, and Assistant append
      await addChatMessage(activeAddress, { role: 'user', content: text });
    } catch (error: unknown) {
      console.error('[Copilot Chat Error]', error);
      setToast({
        message: getErrorMessage(error),
        type: 'error'
      });
      setTimeout(() => setToast(null), 6000);
    } finally {
      setIsReplying(false);
    }
  };

  const [welcomeInput, setWelcomeInput] = useState('');

  const handleStartChat = async (address: string) => {
    if (!address.trim()) return;
    try {
      await analyzeWallet(address);
      setManualAddress(address.toLowerCase());
    } catch (err) {
      console.error(err);
      alert('Failed to analyze the target address. Make sure the backend server is running.');
    }
  };

  const sampleChatWallets = [
    { name: 'degentrader.sui (Meme Degen)', address: '0xde202f5a6b0c2eef9ba7582eb7bc3696f0188889a' },
    { name: 'yieldfarmer.sui (DeFi Yield)', address: '0x3c2fa56b0c2eef9ba7582eb7bc3696f018882fd' }
  ];

  const activeWalletShort = activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : 'No Target Selected';

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
            Contextual AI Wallet Assistant for: <span className="text-cyan-glow font-mono font-bold">{!activeAddress ? 'No Target Selected' : currentWalletData?.ensName || activeWalletShort}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(0,209,255,0.06)] border border-cyan-glow/10 text-cyan-glow text-[10px] font-display font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>Contextual Memory Live</span>
        </div>
      </div>

      {!activeAddress ? (
        /* Empty welcome screen when no address is active */
        <div className="flex-1 flex flex-col justify-center items-center max-w-xl mx-auto text-center py-12 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-glow/5 border border-cyan-glow/20 flex items-center justify-center text-cyan-glow mx-auto animate-pulse">
            <Brain className="w-8 h-8" />
          </div>
          <div className="space-y-3">
            <h3 className="font-display font-extrabold text-lg text-white">Ask SuiLens AI Anything</h3>
            <p className="font-sans text-xs text-white/40 leading-relaxed max-w-md">
              Connect your wallet, scan a portfolio, or enter a Sui wallet address or token contract address below to start chatting.
            </p>
          </div>

          {/* Quick Input Form */}
          <div className="w-full max-w-md space-y-4">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Paste Sui Wallet address or token contract..."
                value={welcomeInput}
                onChange={(e) => setWelcomeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleStartChat(welcomeInput);
                }}
                className="w-full bg-[#0b1220]/60 border border-white/10 group-hover:border-cyan-glow/50 focus:border-cyan-glow text-white text-xs pl-5 pr-28 py-3.5 rounded-xl outline-none transition-all shadow-md focus:shadow-[0_0_15px_rgba(0,209,255,0.15)]"
              />
              <button 
                onClick={() => handleStartChat(welcomeInput)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg bg-cyan-glow hover:bg-sui-blue text-[#050816] text-[10px] font-display font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Load Context
              </button>
            </div>

            {/* Presets load */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-display font-semibold tracking-wider text-white/30 uppercase block text-left">
                Or quick-start with a sample wallet:
              </span>
              <div className="flex gap-2">
                {sampleChatWallets.map((wallet) => (
                  <button
                    key={wallet.address}
                    onClick={() => handleStartChat(wallet.address)}
                    className="flex-1 text-left text-[10px] px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/2 hover:bg-cyan-glow/5 hover:border-cyan-glow/20 text-white/60 hover:text-white transition-all cursor-pointer font-mono truncate"
                  >
                    {wallet.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard message feed log layout when address is active */
        <>
          {/* Chat Messages Log Area */}
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
            {messages.length === 0 ? (
              /* Empty Chat Splash screen for active address */
              <div className="max-w-xl mx-auto text-center py-12 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-cyan-glow/5 border border-cyan-glow/20 flex items-center justify-center text-cyan-glow mx-auto animate-pulse">
                  <Brain className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display font-extrabold text-lg text-white">Ask SuiLens AI Anything</h3>
                  <p className="font-sans text-xs text-white/40 leading-relaxed">
                    Query contract metrics, explain trading profiles, roast allocations, or investigate rug risks inside{' '}
                    <span className="text-cyan-glow font-mono font-semibold">{activeWalletShort}</span>.
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
                    
                    <div className={`p-4.5 rounded-2xl max-w-[85%] shadow-md border text-xs
                      ${msg.role === 'user'
                        ? 'bg-cyan-glow/10 border-cyan-glow/20 text-white rounded-tr-none'
                        : 'bg-[#0b1220]/75 border-white/5 text-white/90 rounded-tl-none'
                      }
                    `}>
                      <MarkdownText content={msg.content} />
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
                placeholder={isContractAddress ? `Ask AI Copilot about this token contract...` : `Ask AI Copilot about this wallet address...`}
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
        </>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 right-6 z-50 max-w-md glass-panel border-rose-500/20 bg-rose-950/20 backdrop-blur-md p-4 rounded-xl shadow-lg flex items-start gap-3 border text-left"
          >
            <div className="mt-0.5 shrink-0 text-rose-500">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="font-display font-extrabold text-xs text-white uppercase tracking-wider block">
                OpenAI API Quota Exceeded
              </span>
              <p className="font-sans text-[11px] text-rose-200 leading-relaxed font-medium">
                {toast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

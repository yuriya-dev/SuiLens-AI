'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Settings, 
  Cpu, 
  Database, 
  Key, 
  Sliders, 
  Save, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export default function SettingsPanel() {
  const { 
    simulateMode, 
    tatumApiKey, 
    walrusPublisher, 
    openaiApiKey, 
    updateSettings 
  } = useStore();

  const [simMode, setSimMode] = useState(simulateMode);
  const [tatumKey, setTatumKey] = useState(tatumApiKey);
  const [walrusUrl, setWalrusUrl] = useState(walrusPublisher);
  const [openaiKey, setOpenaiKey] = useState(openaiApiKey);

  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      simulateMode: simMode,
      tatumApiKey: tatumKey,
      walrusPublisher: walrusUrl,
      openaiApiKey: openaiKey
    });
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto relative">
      {/* Header title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="font-display font-bold text-3xl text-white tracking-wide flex items-center gap-2">
          <Settings className="w-8 h-8 text-cyan-glow" />
          Platform Settings
        </h1>
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest mt-1">
          Configure API integrations, network gateways, and mock parameters
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggle Mode */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-cyan-glow" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Ecosystem Driver Mode</h3>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded
              ${simMode ? 'bg-cyan-glow/15 text-cyan-glow' : 'bg-success-green/15 text-success-green'}
            `}>
              {simMode ? 'SIMULATION' : 'LIVE INTEGRATION'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans">
            <div className="space-y-1">
              <span className="text-white font-semibold">Enable Smart Simulation (Highly Recommended)</span>
              <p className="text-white/40 leading-relaxed text-[11px] max-w-xl">
                When enabled, the platform utilizes realistic high-fidelity mock Sui datasets to instantly profile wallets and stream chats. This ensures a bulletproof demo experience for hackathon presentations without relying on network latency or active API billing.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSimMode(!simMode)}
              className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer
                ${simMode ? 'bg-cyan-glow' : 'bg-white/10'}
              `}
            >
              <div 
                className={`w-5 h-5 rounded-full bg-[#050816] shadow-md transform transition-transform duration-300
                  ${simMode ? 'translate-x-7' : 'translate-x-0'}
                `}
              />
            </button>
          </div>
        </div>

        {/* API Credentials */}
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Key className="w-4.5 h-4.5 text-cyan-glow" />
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">API Keys & Endpoints</h3>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* Tatum API Key */}
            <div className="space-y-1.5 text-left">
              <label className="text-white/60 font-semibold block uppercase text-[10px] tracking-wider">Tatum Sui RPC Gateway Key</label>
              <input
                type="password"
                placeholder="tatum_sui_rpc_gateway_key..."
                value={tatumKey}
                onChange={(e) => setTatumKey(e.target.value)}
                className="w-full bg-[#050816] border border-white/10 focus:border-cyan-glow text-white/90 text-xs px-4 py-3 rounded-xl outline-none transition-all"
              />
              <span className="text-white/30 block text-[9px]">Used to query Sui ledger transactions, token volumes, and protocol interactions in live mode.</span>
            </div>

            {/* Walrus Publisher */}
            <div className="space-y-1.5 text-left">
              <label className="text-white/60 font-semibold block uppercase text-[10px] tracking-wider">Walrus Publisher Endpoint</label>
              <input
                type="text"
                placeholder="https://publisher.walrus.storage"
                value={walrusUrl}
                onChange={(e) => setWalrusUrl(e.target.value)}
                className="w-full bg-[#050816] border border-white/10 focus:border-cyan-glow text-white/90 text-xs px-4 py-3 rounded-xl outline-none transition-all"
              />
              <span className="text-white/30 block text-[9px]">The decentralized gateway url used to publish and retrieve immutable research JSON blobs.</span>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-1.5 text-left">
              <label className="text-white/60 font-semibold block uppercase text-[10px] tracking-wider">OpenAI Inference API Key</label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-[#050816] border border-white/10 focus:border-cyan-glow text-white/90 text-xs px-4 py-3 rounded-xl outline-none transition-all"
              />
              <span className="text-white/30 block text-[9px]">Used to stream customizable conversational chats, summaries, and smart roasts.</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 justify-end">
          {savedAlert && (
            <div className="flex items-center gap-1.5 text-xs text-success-green font-semibold">
              <ShieldCheck className="w-4.5 h-4.5 text-success-green animate-bounce" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-glow to-sui-blue hover:from-sui-blue hover:to-cyan-glow text-[#050816] font-display font-bold rounded-xl tracking-wider uppercase text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}

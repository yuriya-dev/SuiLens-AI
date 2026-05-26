'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/useStore';
import { ConnectModal, useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { Wallet, KeyRound } from 'lucide-react';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isWalletVerified, isVerifyingWallet, verifyWallet } = useStore();
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const handleVerify = async () => {
    if (!account) return;
    try {
      await verifyWallet(account.address, signPersonalMessage);
    } catch (err: any) {
      alert(`Wallet cryptographic verification failed: ${err.message || err}`);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Global Collapsible Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Global Top Navbar with Wallet Connect & Telemetry */}
        <Navbar />
        
        {/* Scrollable Viewport for Sub-pages */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {isWalletVerified ? (
            children
          ) : (
            <div className="flex items-center justify-center min-h-[70vh]">
              <div className="glass-panel p-8 md:p-12 rounded-3xl max-w-xl text-center space-y-6 relative overflow-hidden border border-cyan-glow/20 shadow-[0_0_50px_rgba(0,209,255,0.1)]">
                {/* Glowing decorative background orb */}
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-cyan-glow/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-glow/10 blur-3xl pointer-events-none" />

                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-glow/10 border border-cyan-glow/30 flex items-center justify-center text-cyan-glow animate-pulse">
                    <KeyRound className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="font-display font-extrabold text-2xl text-white tracking-wide">
                    Cryptographic Verification Required
                  </h2>
                  <p className="font-sans text-xs text-white/40 uppercase tracking-widest">
                    Authentication Gatekeeper
                  </p>
                </div>

                <p className="font-sans text-sm text-white/70 leading-relaxed max-w-md mx-auto">
                  To access our real-time audit database, query AI Copilot models, and view whale transaction streams, you must verify ownership of your Sui address.
                </p>

                <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-3 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-2.5 text-xs text-white/60">
                    <span className="w-5 h-5 rounded bg-cyan-glow/10 flex items-center justify-center text-cyan-glow font-bold shrink-0">1</span>
                    <p>Connect your self-custodial Sui wallet to establish a public key connection.</p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-white/60">
                    <span className="w-5 h-5 rounded bg-purple-glow/10 flex items-center justify-center text-purple-glow font-bold shrink-0">2</span>
                    <p>Sign the cryptographic challenge signature containing a single-use random nonce.</p>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  {!account ? (
                    <ConnectModal
                      trigger={
                        <button className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-display font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-md cursor-pointer bg-gradient-to-r from-cyan-glow to-sui-blue hover:from-sui-blue hover:to-cyan-glow text-[#050816] shadow-[0_0_25px_rgba(0,209,255,0.35)] hover:shadow-[0_0_35px_rgba(0,209,255,0.5)]">
                          <Wallet className="w-4 h-4" />
                          <span>Connect Sui Wallet</span>
                        </button>
                      }
                    />
                  ) : (
                    <button
                      onClick={handleVerify}
                      disabled={isVerifyingWallet}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-display font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-md cursor-pointer bg-[rgba(245,158,11,0.15)] hover:bg-[rgba(245,158,11,0.25)] border border-[rgba(245,158,11,0.5)] hover:border-[rgba(245,158,11,0.9)] text-[#f59e0b] shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] disabled:opacity-50"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping" />
                      <span>{isVerifyingWallet ? 'Verifying Challenge...' : '⚠️ Sign & Verify Session'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

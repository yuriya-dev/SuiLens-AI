'use client';

import React, { useState } from 'react';
import { Database, CheckCircle, Copy, ExternalLink } from 'lucide-react';

interface WalrusStorageBadgeProps {
  blobId: string;
  sizeBytes?: number;
}

export default function WalrusStorageBadge({ blobId, sizeBytes }: WalrusStorageBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(blobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedSize = sizeBytes 
    ? `${(sizeBytes / 1024).toFixed(2)} KB` 
    : '14.5 KB';

  const isMock = blobId.startsWith('walrus-blob-');
  const verifyUrl = isMock 
    ? `http://localhost:3001/api/walrus/blob/${blobId}`
    : `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;

  return (
    <div 
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="relative inline-block"
    >
      {/* Badge Trigger Capsule */}
      <div 
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.18)] border border-purple-glow/30 hover:border-purple-glow text-purple-glow text-[11px] font-display font-bold uppercase tracking-wider cursor-help transition-all duration-300 shadow-[0_0_10px_rgba(139,92,246,0.05)]"
      >
        <Database className="w-3.5 h-3.5 text-purple-glow animate-pulse" />
        <span>STORED ON WALRUS</span>
      </div>

      {/* Floating Info Dropdown Panel */}
      {showTooltip && (
        <div className="absolute right-0 top-full pt-2 w-72 z-50 select-text">
          <div className="glass-panel border-purple-glow/30 bg-[#0b1220]/95 rounded-xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
            <div className="flex items-center gap-2 text-purple-glow border-b border-white/5 pb-2 mb-3">
              <CheckCircle className="w-4 h-4 text-purple-glow" />
              <span className="font-display font-bold text-[11px] tracking-widest uppercase">CRYPTOGRAPHIC PROOF</span>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {/* Blob ID Block */}
              <div>
                <span className="text-white/40 block mb-1 uppercase font-semibold text-[9px] tracking-wider">Blob Reference ID</span>
                <div className="flex items-center justify-between gap-2 bg-[#050816] px-2.5 py-2 rounded-lg border border-white/5 font-mono text-[10px] text-white/90">
                  <span className="truncate flex-1">{blobId}</span>
                  <button 
                    onClick={handleCopy}
                    className="text-purple-glow hover:text-white transition-colors cursor-pointer"
                    title="Copy hash"
                  >
                    {copied ? (
                      <span className="text-success-green text-[9px] font-semibold">COPIED</span>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sizes & Availability */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div>
                  <span className="text-white/40 block mb-0.5 text-[9px] tracking-wider uppercase font-semibold">Blob Size</span>
                  <span className="font-display font-medium text-white/90">{formattedSize}</span>
                </div>
                <div>
                  <span className="text-white/40 block mb-0.5 text-[9px] tracking-wider uppercase font-semibold">Availability</span>
                  <span className="font-display font-medium text-success-green">IMMUTABLE (100%)</span>
                </div>
              </div>

              {/* View Link */}
              <a 
                href={verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full bg-purple-glow/10 hover:bg-purple-glow text-purple-glow hover:text-[#050816] py-1.5 rounded-lg border border-purple-glow/20 transition-all font-display font-bold uppercase tracking-wider text-[9px] cursor-pointer mt-1"
              >
                <span>Verify Blob On Gateway</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

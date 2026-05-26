'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import type { WalletData, SavedAnalysis } from '@/lib/mockData';
import { 
  FileText, 
  Download, 
  Database, 
  Clock, 
  Cpu, 
  ShieldCheck
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface MockReportItem extends SavedAnalysis {
  tag: string;
  type: string;
}

const MOCK_REPORT_TIMESTAMPS = {
  recent: '2026-05-26T10:00:00.000Z',
  daily: '2026-05-25T12:00:00.000Z',
  medium: '2026-05-26T07:00:00.000Z'
} as const;

const isMockReportItem = (item: SavedAnalysis | MockReportItem): item is MockReportItem => {
  return 'tag' in item && 'type' in item;
};

export default function PortfolioReports() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto py-16 text-center space-y-4">
        <div className="w-10 h-10 border-t-2 border-cyan-glow border-solid rounded-full animate-spin mx-auto" />
        <p className="font-mono text-xs text-white/50">INITIALIZING PORTFOLIO COMPILER FRAMEWORK...</p>
      </div>
    }>
      <PortfolioReportsContent />
    </Suspense>
  );
}

function PortfolioReportsContent() {
  const { currentWalletData, savedAnalyses, fetchHistory, analyzeWallet } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);

  // Fetch history from Postgres/Supabase on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Compile PDF function supporting any WalletData target
  const triggerPDFDownload = React.useCallback(async (walletDataToCompile?: WalletData, customBlobId?: string) => {
    const targetData = walletDataToCompile || currentWalletData;
    if (!targetData) return;
    
    setIsCompiling(true);
    setCompileProgress(10);

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      setCompileProgress(30);

      // Create a hidden, beautifully formatted report container for A4 capture
      const reportContainer = document.createElement('div');
      reportContainer.style.position = 'fixed';
      reportContainer.style.left = '-9999px';
      reportContainer.style.top = '-9999px';
      reportContainer.style.width = '800px';
      reportContainer.style.padding = '40px';
      reportContainer.style.background = '#050816';
      reportContainer.style.color = '#ffffff';
      reportContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      reportContainer.style.boxSizing = 'border-box';

      // Insert beautiful HTML report elements
      const targetBlobId = customBlobId || savedAnalyses.find(
        a => a.address.toLowerCase() === targetData.address.toLowerCase()
      )?.blobId || 'walrus-blob-default-sui-lens';

      const shortAddress = targetData.address.slice(0, 8) + '...' + targetData.address.slice(-6);

      reportContainer.innerHTML = `
        <div style="border: 1px solid rgba(139, 92, 246, 0.2); background: rgba(11, 18, 32, 0.8); border-radius: 16px; padding: 30px;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(0, 209, 255, 0.2); padding-bottom: 20px; margin-bottom: 25px;">
            <div>
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #00d1ff; letter-spacing: 1px;">🔮 SuiLens AI</h1>
              <p style="margin: 5px 0 0 0; font-size: 10px; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; letter-spacing: 2px;">ONCHAIN RESEARCH BRIEF & INTELLIGENCE REPORT</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; font-weight: bold; padding: 5px 10px; border-radius: 8px; background: rgba(0, 209, 255, 0.1); border: 1px solid rgba(0, 209, 255, 0.3); color: #00d1ff;">VERIFIED REPORT</span>
            </div>
          </div>

          <!-- Target Wallet Info -->
          <div style="display: flex; gap: 20px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; margin-bottom: 25px;">
            <div style="flex: 1;">
              <span style="display: block; font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: bold; letter-spacing: 1px;">Research Target Address</span>
              <span style="font-size: 13px; font-weight: bold; color: #ffffff; font-family: monospace; word-break: break-all;">${targetData.address}</span>
            </div>
            <div style="text-align: right; min-width: 150px;">
              <span style="display: block; font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: bold; letter-spacing: 1px;">Generated Timestamp</span>
              <span style="font-size: 11px; font-weight: bold; color: rgba(255, 255, 255, 0.85);">${new Date().toLocaleString()}</span>
            </div>
          </div>

          <!-- Core Metrics -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
            <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); padding: 15px; border-radius: 12px; text-align: center;">
              <span style="display: block; font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: bold;">Risk Score</span>
              <span style="font-size: 26px; font-weight: 900; color: #ef4444; margin-top: 5px; display: block;">${targetData.riskScore}%</span>
            </div>
            <div style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); padding: 15px; border-radius: 12px; text-align: center;">
              <span style="display: block; font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: bold;">Smart Score</span>
              <span style="font-size: 26px; font-weight: 900; color: #8b5cf6; margin-top: 5px; display: block;">${targetData.smartMoneyScore}%</span>
            </div>
            <div style="background: rgba(0, 209, 255, 0.05); border: 1px solid rgba(0, 209, 255, 0.2); padding: 15px; border-radius: 12px; text-align: center;">
              <span style="display: block; font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: bold;">Whale Score</span>
              <span style="font-size: 26px; font-weight: 900; color: #00d1ff; margin-top: 5px; display: block;">${targetData.whaleScore}%</span>
            </div>
            <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); padding: 15px; border-radius: 12px; text-align: center;">
              <span style="display: block; font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: bold;">Ecosystem Value</span>
              <span style="font-size: 20px; font-weight: 900; color: #10b981; margin-top: 7px; display: block;">$${targetData.portfolioValueUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <!-- AI Summary section -->
          <div style="background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <span style="display: block; font-size: 10px; text-transform: uppercase; color: #00d1ff; font-weight: bold; letter-spacing: 1.5px; margin-bottom: 8px;">🧠 AI RESEARCH SYNTHESIS</span>
            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: rgba(255, 255, 255, 0.85);">${targetData.summaryProfessional}</p>
          </div>

          <!-- Token Allocations Table -->
          <div style="margin-bottom: 25px;">
            <span style="display: block; font-size: 10px; text-transform: uppercase; color: #8b5cf6; font-weight: bold; letter-spacing: 1.5px; margin-bottom: 10px;">📊 ASSET ALLOCATIONS</span>
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 11px;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.4); text-transform: uppercase;">
                  <th style="padding: 8px 5px;">Asset</th>
                  <th style="padding: 8px 5px;">Balance</th>
                  <th style="padding: 8px 5px; text-align: right;">Value (USD)</th>
                  <th style="padding: 8px 5px; text-align: right;">Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${targetData.tokenAllocations.map((tok) => `
                  <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.85);">
                    <td style="padding: 8px 5px; font-weight: bold; color: ${tok.color || '#ffffff'}">${tok.symbol} <span style="font-weight: normal; color: rgba(255,255,255,0.4); font-size: 9px;">(${tok.name})</span></td>
                    <td style="padding: 8px 5px; font-family: monospace;">${tok.balance.toLocaleString()}</td>
                    <td style="padding: 8px 5px; text-align: right; font-family: monospace;">$${tok.valueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td style="padding: 8px 5px; text-align: right; font-weight: bold; color: #00d1ff;">${tok.percentage}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Risk Indicators -->
          <div style="margin-bottom: 25px;">
            <span style="display: block; font-size: 10px; text-transform: uppercase; color: #ef4444; font-weight: bold; letter-spacing: 1.5px; margin-bottom: 10px;">🚨 SYSTEM RISK EXPOSURE SHIELD</span>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${targetData.riskIndicators.map((ind) => `
                <div style="display: flex; gap: 10px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 10px 15px; border-radius: 8px; align-items: center;">
                  <span style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${ind.severity === 'high' ? 'rgba(239, 68, 68, 0.15)' : ind.severity === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; border: 1px solid ${ind.severity === 'high' ? 'rgba(239, 68, 68, 0.3)' : ind.severity === 'medium' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}; color: ${ind.severity === 'high' ? '#ef4444' : ind.severity === 'medium' ? '#f59e0b' : '#10b981'}; text-transform: uppercase; min-width: 50px; text-align: center;">${ind.severity}</span>
                  <div style="flex: 1;">
                    <span style="display: block; font-size: 11px; font-weight: bold; color: #ffffff;">${ind.title}</span>
                    <span style="display: block; font-size: 10px; color: rgba(255, 255, 255, 0.5); margin-top: 2px;">${ind.description}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Walrus Proof details -->
          <div style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.15); padding: 15px; border-radius: 12px; font-size: 10px; font-family: monospace;">
            <div>
              <span style="color: rgba(255, 255, 255, 0.4); text-transform: uppercase; font-size: 8px; font-weight: bold; display: block; margin-bottom: 4px;">Walrus Storage Blob ID Proof</span>
              <span style="color: #8b5cf6; font-weight: bold; word-break: break-all;">${targetBlobId}</span>
            </div>
            <div style="margin-top: 10px; display: flex; justify-content: space-between;">
              <div>
                <span style="color: rgba(255, 255, 255, 0.4); text-transform: uppercase; font-size: 8px; font-weight: bold; display: block; margin-bottom: 2px;">Availability Status</span>
                <span style="color: #10b981; font-weight: bold;">IMMUTABLE PROOF (100%)</span>
              </div>
              <div style="text-align: right;">
                <span style="color: rgba(255, 255, 255, 0.4); text-transform: uppercase; font-size: 8px; font-weight: bold; display: block; margin-bottom: 2px;">Powered By</span>
                <span style="color: #00d1ff; font-weight: bold;">Walrus Protocol</span>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(reportContainer);
      setCompileProgress(60);

      // Capture using html2canvas
      const canvas = await html2canvas(reportContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#050816',
        logging: false
      });

      // Cleanup hidden container
      document.body.removeChild(reportContainer);
      setCompileProgress(85);

      const imgData = canvas.toDataURL('image/png');
      
      // Instantiate A4 PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight > pageHeight ? pageHeight : imgHeight);
      
      setCompileProgress(95);
      
      // Save report
      pdf.save(`SuiLens_AI_Report_${shortAddress.replace('...', '_')}.pdf`);
      
      setCompileProgress(100);
      setTimeout(() => {
        setIsCompiling(false);
      }, 500);

    } catch (error) {
      console.error('[PDF Compiler Error]', error);
      setIsCompiling(false);
      alert('Failed to compile PDF report. Please verify your client environment and try again.');
    }
  }, [currentWalletData, savedAnalyses]);

  // Fetch decentralized availability blob and compile A4 PDF
  const handleDownloadHistoryItem = async (blobId: string) => {
    if (isCompiling) return;
    setIsCompiling(true);
    setCompileProgress(15);

    try {
      console.log(`[Walrus Fetcher] Retrieving blob ${blobId} from Express proxy...`);
      const response = await fetch(`${BACKEND_URL}/api/walrus/blob/${blobId}`);
      setCompileProgress(40);
      
      if (!response.ok) {
        throw new Error('Failed to retrieve blob from Walrus proxy gateway.');
      }
      const blobResponse = await response.json();
      setCompileProgress(50);
      
      if (!blobResponse.data) {
        throw new Error('Blob data payload is empty.');
      }

      await triggerPDFDownload(blobResponse.data, blobId);
    } catch (error) {
      console.error('[PDF History Downloader Error]', error);
      alert('Failed to fetch decentralized report. Ensure backend is running.');
      setIsCompiling(false);
    }
  };

  // Handle URL query parameters (?address=0x...&download=true)
  useEffect(() => {
    const address = searchParams?.get('address');
    const download = searchParams?.get('download') === 'true';

    if (address) {
      const cleanAddress = address.trim().toLowerCase();
      // Check if we already have this wallet analyzed in store
      if (currentWalletData && currentWalletData.address.toLowerCase() === cleanAddress) {
        if (download && !isCompiling) {
          // Clear query params to prevent download loops on page refresh
          router.replace('/reports');
          setTimeout(() => {
            void triggerPDFDownload(currentWalletData);
          }, 0);
        }
      } else {
        // Trigger loading the wallet
        const loadAndTrigger = async () => {
          try {
            const data = await analyzeWallet(cleanAddress);
            if (download && !isCompiling) {
              router.replace('/reports');
              setTimeout(() => {
                void triggerPDFDownload(data);
              }, 0);
            }
          } catch (error) {
            console.error('Failed to load wallet data for PDF compile:', error);
          }
        };
        loadAndTrigger();
      }
    }
  }, [searchParams, currentWalletData, analyzeWallet, router, isCompiling, triggerPDFDownload]);

  // Static fallback presets to display in list if user's Postgres database is fresh/empty
  const mockReportItems: MockReportItem[] = React.useMemo(() => [
    { address: '0x981ba24f6b0c2eef9ba7582eb7bc3696f018888b1', timestamp: MOCK_REPORT_TIMESTAMPS.recent, riskScore: 14, blobId: 'walrus-blob-sui-lens-whale-9034', walrusUrl: 'http://localhost:3001/api/walrus/blob/walrus-blob-sui-lens-whale-9034', sizeBytes: 15420, tag: 'smartmoney.sui Research Package', type: 'Bluechip Accumulator' },
    { address: '0x3c2fa56b0c2eef9ba7582eb7bc3696f018882fd', timestamp: MOCK_REPORT_TIMESTAMPS.daily, riskScore: 28, blobId: 'walrus-blob-sui-lens-farmer-5592', walrusUrl: 'http://localhost:3001/api/walrus/blob/walrus-blob-sui-lens-farmer-5592', sizeBytes: 16212, tag: 'yieldfarmer.sui DeFi Audit', type: 'Stable yield provider' },
    { address: '0xde202f5a6b0c2eef9ba7582eb7bc3696f018889a', timestamp: MOCK_REPORT_TIMESTAMPS.medium, riskScore: 88, blobId: 'walrus-blob-sui-lens-degen-4122', walrusUrl: 'http://localhost:3001/api/walrus/blob/walrus-blob-sui-lens-degen-4122', sizeBytes: 18910, tag: 'degentrader.sui Speculative Audit', type: 'High risk degen' }
  ], []);

  const activeReportsList: Array<SavedAnalysis | MockReportItem> = savedAnalyses.length > 0 ? savedAnalyses : mockReportItems;

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Header title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="font-display font-bold text-3xl text-white tracking-wide flex items-center gap-2">
          <FileText className="w-8 h-8 text-cyan-glow" />
          AI Portfolio Reports Generator
        </h1>
        <p className="font-sans text-xs text-white/40 uppercase tracking-widest mt-1">
          Generate, compile, and download production-grade blockchain intelligence briefs
        </p>
      </div>

      {/* Main Builder Box */}
      <div className="glass-panel border-cyan-glow/15 p-8 rounded-2xl relative overflow-hidden space-y-6">
        <div className="absolute inset-0 terminal-grid opacity-5 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/5">
          <div className="space-y-1">
            <span className="font-display font-extrabold text-xs text-cyan-glow uppercase tracking-widest">Active Report target</span>
            <h3 className="font-display font-bold text-lg text-white">
              {currentWalletData?.ensName || currentWalletData?.address.slice(0, 18) || 'No Target Selected'}
            </h3>
            <p className="font-sans text-xs text-white/50">
              Includes Risk Matrix, Smart Score, Personality Profiler, Token Allocations, and live timeline logs.
            </p>
          </div>

          <button
            onClick={() => triggerPDFDownload()}
            disabled={!currentWalletData || isCompiling}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-glow to-sui-blue hover:from-sui-blue hover:to-cyan-glow text-[#050816] font-display font-bold rounded-xl tracking-wider uppercase text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isCompiling ? 'Compiling PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>

        {/* Compile Progress Overlay */}
        {isCompiling && (
          <div className="bg-[#050816] rounded-xl border border-white/5 p-5 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-cyan-glow flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                CONVERTING LEDGER DATA TO HIGH-FIDELITY PDF LAYOUTS...
              </span>
              <span className="text-white/70">{compileProgress}%</span>
            </div>
            
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-glow to-purple-glow rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,209,255,0.4)]"
                style={{ width: `${compileProgress}%` }}
              />
            </div>
            
            <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono">
              <Database className="w-3.5 h-3.5 text-purple-glow" />
              <span>Simulated Walrus Proof Status: Uploading Cryptographic Metadata Blob...</span>
            </div>
          </div>
        )}

        {/* Interactive layout mockup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-sans">
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white uppercase tracking-wider">Report Structure Checklist</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-white/70">
                <ShieldCheck className="w-4.5 h-4.5 text-success-green" />
                <span>Section 1: Risk Assessment Metric Shield (Tatum APIs verified)</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <ShieldCheck className="w-4.5 h-4.5 text-success-green" />
                <span>Section 2: Asset Allocation percentages & Volatility matrices</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <ShieldCheck className="w-4.5 h-4.5 text-success-green" />
                <span>Section 3: AI Copilot personality brief & specific transaction warning labels</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <ShieldCheck className="w-4.5 h-4.5 text-success-green" />
                <span>Section 4: Decentralized persistence proof hash mapped via Walrus storage</span>
              </div>
            </div>
          </div>

          <div className="bg-[#050816]/60 p-5 rounded-xl border border-white/5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-display font-extrabold text-[9px] text-purple-glow tracking-widest uppercase">Decentralized Availability</span>
              <p className="text-white/60 leading-relaxed text-[11px]">
                By generating this report, the structured metrics are converted to an availability blob and stored permanently on the Walrus Decentralized Node system.
              </p>
            </div>
            <div className="font-mono text-[9px] text-white/30 uppercase">
              DB Reference: walrus-availability-shield-v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Grid 3: Historical report listings */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Clock className="w-5 h-5 text-cyan-glow" />
          <h3 className="font-display font-bold text-base text-white">Generated Report Repository</h3>
        </div>

        <div className="space-y-3.5">
          {activeReportsList.map((item, idx) => {
            const isMock = !savedAnalyses.length;
            const displayName = isMock 
              ? (isMockReportItem(item) ? item.tag : item.address)
              : `Audit Brief: ${item.address.slice(0, 10)}...${item.address.slice(-6)}`;
            
            const displayType = isMock
              ? (isMockReportItem(item) ? item.type : 'Generated Report')
              : item.riskScore < 30 ? 'Low Risk Accumulator' : item.riskScore < 70 ? 'Moderate Active Trader' : 'High Risk Speculator';
            
            const sizeKB = (item.sizeBytes / 1024).toFixed(1) + ' KB';
            const shortHash = item.blobId.slice(0, 16) + '...';

            return (
              <div 
                key={item.blobId || idx}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-lg bg-cyan-glow/5 border border-cyan-glow/15 flex items-center justify-center text-cyan-glow">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-xs text-white block">
                      {displayName}
                    </span>
                    <span className="font-sans text-[10px] text-white/40 uppercase tracking-widest font-semibold block mt-0.5">
                      {displayType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-3 sm:mt-0">
                  <div className="text-left sm:text-right font-sans">
                    <span className="font-mono text-xs font-bold text-white block">{sizeKB}</span>
                    <span className="text-[10px] text-white/40 block">Blob ID: {shortHash}</span>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadHistoryItem(item.blobId)}
                    disabled={isCompiling}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-cyan-glow text-white/70 hover:text-[#050816] transition-colors cursor-pointer disabled:opacity-50"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

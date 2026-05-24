'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  Waves, 
  FileText, 
  History, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Terminal
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Landing Hero', path: '/', icon: Eye },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Wallet Analyzer', path: '/wallet', icon: Wallet },
    { name: 'AI Chat Copilot', path: '/chat', icon: MessageSquare },
    { name: 'Whale Tracker', path: '/whales', icon: Waves },
    { name: 'Portfolio Reports', path: '/reports', icon: FileText },
    { name: 'Walrus History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={`glass-panel border-r border-[rgba(0,209,255,0.08)] flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 z-40
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Top Section - Brand Logo */}
      <div>
        <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.05)] h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-glow to-purple-glow shadow-[0_0_15px_rgba(0,209,255,0.3)]">
              <Eye className="w-5 h-5 text-[#050816] animate-pulse" />
            </div>
            {!isCollapsed && (
              <span className="font-display font-bold text-lg tracking-wider bg-gradient-to-r from-cyan-glow via-sui-blue to-purple-glow bg-clip-text text-transparent glow-text-cyan">
                SuiLens <span className="text-white text-xs opacity-60 ml-0.5">AI</span>
              </span>
            )}
          </Link>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-md border border-white/10 hover:border-cyan-glow/50 text-white/50 hover:text-cyan-glow bg-white/5 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            // Check if active route is this one. For dynamic wallet address pages, we check if pathname starts with the menu path
            const isActive = item.path === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                href={item.path === '/wallet' ? '/wallet/0x7a8109d9f10be280b2a7582eb7bc3696f018888a' : item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-[rgba(0,209,255,0.12)] to-[rgba(139,92,246,0.04)] border-l-2 border-cyan-glow text-white shadow-[inset_0_0_12px_rgba(0,209,255,0.06)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }
                `}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 
                  ${isActive ? 'text-cyan-glow' : 'text-white/60 group-hover:text-cyan-glow'}
                `} />
                {!isCollapsed && (
                  <span className="font-sans font-medium text-sm tracking-wide">{item.name}</span>
                )}

                {/* Hover Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-card-bg border border-white/10 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-250 z-50 whitespace-nowrap shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
        <a 
          href="https://github.com" 
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors group"
        >
          <Terminal className="w-5 h-5 group-hover:text-purple-glow" />
          {!isCollapsed && (
            <span className="font-sans text-xs tracking-wider uppercase font-semibold">Hackathon v1.0</span>
          )}
        </a>
      </div>
    </aside>
  );
}

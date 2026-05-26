'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Shield, 
  Waves, 
  FileText, 
  History, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Terminal,
  Wallet,
  X
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import BrandLogo from '@/components/BrandLogo';

type MenuItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavigationItemProps = {
  item: MenuItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
};

const PORTFOLIO_MENU_ITEM: MenuItem = { name: 'My Portfolio', path: '/portfolio', icon: Wallet };

const BASE_MENU_ITEMS: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'On-Chain Auditor', path: '/wallet', icon: Shield },
  { name: 'AI Chat Copilot', path: '/chat', icon: MessageSquare },
  { name: 'Whale Tracker', path: '/whales', icon: Waves },
  { name: 'Portfolio Reports', path: '/reports', icon: FileText },
  { name: 'Walrus History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const isRouteActive = (pathname: string, path: string) => {
  if (path === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(path);
};

const getItemClassName = (isActive: boolean) => {
  return `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative
    ${isActive 
      ? 'bg-gradient-to-r from-[rgba(0,209,255,0.12)] to-[rgba(139,92,246,0.04)] border-l-2 border-cyan-glow text-white shadow-[inset_0_0_12px_rgba(0,209,255,0.06)]' 
      : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
    }
  `;
};

const getIconClassName = (isActive: boolean) => {
  return `w-5 h-5 transition-transform duration-200 group-hover:scale-110 
    ${isActive ? 'text-cyan-glow' : 'text-white/60 group-hover:text-cyan-glow'}
  `;
};

const getAsideClassName = (isCollapsed: boolean, mobileSidebarOpen: boolean) => {
  return `glass-panel border-r border-[rgba(0,209,255,0.08)] bg-[rgba(5,8,22,0.95)] md:bg-[rgba(5,8,22,0.4)] backdrop-blur-md flex flex-col justify-between h-screen fixed md:sticky top-0 transition-all duration-300 z-50
    ${isCollapsed ? 'w-20' : 'w-64'}
    ${mobileSidebarOpen ? 'left-0' : '-left-full md:left-0'}
  `;
};

function NavigationItem({ item, isActive, isCollapsed, onClick }: NavigationItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.path}
      onClick={onClick}
      className={getItemClassName(isActive)}
    >
      <Icon className={getIconClassName(isActive)} />
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
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { connectedWallet, mobileSidebarOpen, setMobileSidebarOpen } = useStore();

  const menuItems = React.useMemo(() => {
    if (!connectedWallet) {
      return BASE_MENU_ITEMS;
    }

    return [BASE_MENU_ITEMS[0], PORTFOLIO_MENU_ITEM, ...BASE_MENU_ITEMS.slice(1)];
  }, [connectedWallet]);

  const closeMobileSidebar = React.useCallback(() => {
    setMobileSidebarOpen(false);
  }, [setMobileSidebarOpen]);

  const toggleCollapsed = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const asideClassName = React.useMemo(
    () => getAsideClassName(isCollapsed, mobileSidebarOpen),
    [isCollapsed, mobileSidebarOpen]
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div 
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-[#050816]/75 backdrop-blur-sm z-45 md:hidden transition-all duration-300"
        />
      )}

      <aside 
        className={asideClassName}
      >
      {/* Top Section - Brand Logo */}
      <div>
        <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.05)] h-20">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo compact showWordmark={!isCollapsed} className="gap-3" />
          </Link>
          
          <button 
            onClick={toggleCollapsed}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-md border border-white/10 hover:border-cyan-glow/50 text-white/50 hover:text-cyan-glow bg-white/5 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close Menu Button for Mobile menu drawer */}
          <button 
            onClick={closeMobileSidebar}
            className="flex md:hidden items-center justify-center w-8 h-8 rounded-xl border border-white/10 hover:border-cyan-glow/50 text-white/50 hover:text-cyan-glow bg-white/5 transition-colors cursor-pointer shrink-0"
            title="Close Menu"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <NavigationItem
              key={item.name}
              item={item}
              isActive={isRouteActive(pathname, item.path)}
              isCollapsed={isCollapsed}
              onClick={closeMobileSidebar}
            />
          ))}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
        <a 
          href="https://github.com/yuriya-dev/SuiLens-AI" 
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
    </>
  );
}

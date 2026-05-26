'use client';

import React from 'react';

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  showWordmark?: boolean;
  compact?: boolean;
};

export default function BrandLogo({
  className = '',
  imageClassName = '',
  showWordmark = true,
  compact = false
}: BrandLogoProps) {
  const sizeClassName = compact ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClassName} rounded-xl flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,209,255,0.25)]`}>
        <img
          src="/logo.svg"
          alt="SuiLens AI"
          className={`w-full h-full object-contain p-1 ${imageClassName}`}
        />
      </div>
      {showWordmark && (
        <span className="font-display font-bold text-xl tracking-wider bg-linear-to-r from-cyan-glow to-purple-glow bg-clip-text text-transparent">
          SuiLens <span className="text-white text-xs opacity-75 ml-0.5">AI</span>
        </span>
      )}
    </div>
  );
}
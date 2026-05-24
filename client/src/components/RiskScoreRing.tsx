'use client';

import React, { useEffect, useState } from 'react';

interface RiskScoreRingProps {
  score: number;
}

export default function RiskScoreRing({ score }: RiskScoreRingProps) {
  const [offset, setOffset] = useState(283); // Circumference for r=45 (2 * PI * 45 = 282.7)
  const circumference = 282.7;

  useEffect(() => {
    // Animate the circle ring offset
    const progressOffset = circumference - (score / 100) * circumference;
    const timeout = setTimeout(() => {
      setOffset(progressOffset);
    }, 200);
    return () => clearTimeout(timeout);
  }, [score]);

  // Determine colors based on risk score
  const getRiskDetails = (val: number) => {
    if (val < 30) {
      return {
        color: '#10b981', // Success green
        glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
        glowColor: 'rgba(16, 185, 129, 0.4)',
        tier: 'LOW RISK',
        subText: 'Highly Secure Assets'
      };
    } else if (val < 70) {
      return {
        color: '#f59e0b', // Warning orange
        glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
        glowColor: 'rgba(245, 158, 11, 0.4)',
        tier: 'MODERATE RISK',
        subText: 'Balanced Exposure'
      };
    } else {
      return {
        color: '#ef4444', // Danger red
        glowClass: 'shadow-[0_0_25px_rgba(239,68,68,0.4)]',
        glowColor: 'rgba(239, 68, 68, 0.5)',
        tier: 'CRITICAL RISK',
        subText: 'High Speculation / Meme'
      };
    }
  };

  const details = getRiskDetails(score);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card-bg/40 border border-white/5 rounded-2xl relative overflow-hidden group">
      {/* Dynamic glow background */}
      <div 
        className="absolute w-40 h-40 rounded-full blur-[80px] -z-10 opacity-30 transition-all duration-700" 
        style={{ backgroundColor: details.color }}
      />

      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Ring SVG */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle track */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="transparent"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="8"
          />
          {/* Foreground circular progress track */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="transparent"
            stroke={details.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${details.glowColor})`
            }}
          />
        </svg>

        {/* Value container inside the circle */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span 
            className="font-display font-bold text-5xl tracking-tighter" 
            style={{ 
              color: details.color,
              textShadow: `0 0 15px ${details.glowColor}`
            }}
          >
            {score}
          </span>
          <span className="font-display text-[9px] tracking-widest text-white/40 uppercase mt-0.5">RISK SCORE</span>
        </div>
      </div>

      {/* Tier Label */}
      <div className="mt-5 text-center">
        <span 
          className="font-display font-extrabold text-sm tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/5 inline-block"
          style={{ color: details.color }}
        >
          {details.tier}
        </span>
        <p className="font-sans text-xs text-white/50 mt-1.5 font-medium">{details.subText}</p>
      </div>
    </div>
  );
}

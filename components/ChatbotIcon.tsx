'use client';

import React from 'react';

export interface ChatbotIconProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showTail?: boolean;
}

/**
 * Pure Code-based Modern AI Chatbot Avatar Icon
 * 100% constructed with React JSX, Tailwind CSS, gradients, and micro-animations.
 * Sleek pearl-white robot capsule body with Inpartner blue headset and glowing cyan LED visor.
 */
export default function ChatbotIcon({
  className = '',
  size = 'md',
  animated = true,
  showTail = true,
}: ChatbotIconProps) {
  // Size presets
  const sizeConfig = {
    xs: { scale: 0.6, width: 22, height: 22 },
    sm: { scale: 0.78, width: 28, height: 28 },
    md: { scale: 1.0, width: 36, height: 36 },
    lg: { scale: 1.35, width: 48, height: 48 },
    xl: { scale: 1.8, width: 64, height: 64 },
  }[size] || { scale: 1.0, width: 36, height: 36 };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={{
        width: `${sizeConfig.width}px`,
        height: `${sizeConfig.height}px`,
      }}
      aria-label="Inpartner AI Chatbot"
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          transform: `scale(${sizeConfig.scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* 1. TOP ANTENNA with Pulsing AI Signal Beacon */}
        <div className="absolute -top-[13px] flex flex-col items-center z-20 pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Outer signal wave pulse */}
            {animated && (
              <span className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400/50 animate-ping" />
            )}
            {/* Core glowing beacon */}
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-white shadow-[0_0_8px_#38bdf8] ring-1 ring-cyan-200/80" />
          </div>
          {/* Antenna metallic stem */}
          <div className="w-[2.5px] h-[5px] bg-[#0d5f8a]" />
        </div>

        {/* 2. HEADSET ARCH BAND over top */}
        <div className="absolute -top-[6px] w-[36px] h-[20px] rounded-t-full border-t-[3px] border-x-[2.5px] border-transparent border-t-[#0d5f8a] border-x-[#0d5f8a] pointer-events-none" />

        {/* 3. HEADSET EARPHONE PADS (Left & Right) */}
        {/* Left Ear Cushion */}
        <div className="absolute -left-[5px] top-[7px] w-[5.5px] h-[15px] rounded-full bg-gradient-to-b from-cyan-400 via-[#0d5f8a] to-[#083c5a] shadow-sm border border-white/40 z-10" />
        {/* Right Ear Cushion */}
        <div className="absolute -right-[5px] top-[7px] w-[5.5px] h-[15px] rounded-full bg-gradient-to-b from-cyan-400 via-[#0d5f8a] to-[#083c5a] shadow-sm border border-white/40 z-10" />

        {/* 4. MAIN HEAD / CHAT BUBBLE SHELL (Pearl White Ceramic Capsule) */}
        <div className="relative w-[34px] h-[28px] bg-gradient-to-b from-white via-slate-50 to-slate-100 rounded-[10px] p-[2.5px] shadow-[0_3px_10px_rgba(0,0,0,0.18)] border border-slate-200/90 flex items-center justify-center">
          {/* Forehead Gloss Highlight */}
          <div className="absolute top-[1.5px] inset-x-[3px] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent rounded-full pointer-events-none" />

          {/* 5. VISOR SCREEN (Dark Midnight Glass) */}
          <div className="relative w-full h-full bg-gradient-to-b from-[#0a1829] via-[#050e1a] to-[#020617] rounded-[7px] border border-cyan-500/40 shadow-inner flex flex-col items-center justify-center overflow-hidden px-[2px]">
            {/* Top Visor Glass Reflection Sheen */}
            <div className="absolute top-0 inset-x-1 h-[2px] bg-white/20 rounded-full pointer-events-none" />

            {/* 6. FACE: EYES & SMILE */}
            <div className="flex items-center justify-center gap-[5px] mt-[1px]">
              {/* Left Eye: Curved Glowing Happy LED Arc */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-[4.5px] h-[4px] rounded-t-full border-t-[2px] border-x-[1.5px] border-b-0 border-cyan-300 shadow-[0_0_6px_#38bdf8] ${
                    animated ? 'animate-pulse' : ''
                  }`}
                />
              </div>

              {/* Right Eye: Curved Glowing Happy LED Arc */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-[4.5px] h-[4px] rounded-t-full border-t-[2px] border-x-[1.5px] border-b-0 border-cyan-300 shadow-[0_0_6px_#38bdf8] ${
                    animated ? 'animate-pulse' : ''
                  }`}
                />
              </div>
            </div>

            {/* Friendly LED Smile Arc */}
            <div className="mt-[1px] w-[5px] h-[2px] rounded-b-full border-b-[1.5px] border-cyan-400 shadow-[0_0_4px_#38bdf8]" />

            {/* Soft Warm Blush Cheeks */}
            <div className="absolute bottom-[4px] left-[2.5px] w-[2px] h-[1.5px] rounded-full bg-rose-400/50 blur-[0.3px]" />
            <div className="absolute bottom-[4px] right-[2.5px] w-[2px] h-[1.5px] rounded-full bg-rose-400/50 blur-[0.3px]" />
          </div>

          {/* 7. CHAT BUBBLE TAIL (Bottom-Left) */}
          {showTail && (
            <div
              className="absolute -bottom-[3.5px] left-[4px] w-[6px] h-[6px] bg-slate-100 border-b border-r border-slate-300/80 rotate-45 -z-10 shadow-xs"
              style={{
                clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

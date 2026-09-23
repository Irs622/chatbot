'use client';

import React from 'react';
import ChatWidget from './ChatWidget';

export default function FullscreenChat() {
  return (
    <div className="w-full h-[calc(100vh-140px)] min-h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <ChatWidget initialOpen={true} embeddedMode={true} />
    </div>
  );
}

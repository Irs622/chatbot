'use client';

import React from 'react';
import ChatWidget from '@/components/ChatWidget';

export default function EmbedViewPage() {
  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden bg-slate-50 flex flex-col">
      <ChatWidget initialOpen={true} embeddedMode={true} />
    </div>
  );
}

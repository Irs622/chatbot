'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-3 border-[#0d5f8a] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

export default function Home() {
  return (
    <main className="w-screen h-screen m-0 p-0 overflow-hidden bg-slate-100/70 flex items-center justify-center sm:p-4">
      <div className="w-full h-full sm:max-w-[420px] sm:h-[860px] sm:max-h-[96vh] sm:rounded-3xl sm:shadow-2xl sm:border sm:border-slate-200/80 bg-white overflow-hidden flex flex-col">
        <ChatWidget initialOpen={true} embeddedMode={true} />
      </div>
    </main>
  );
}

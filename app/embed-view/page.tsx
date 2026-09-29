'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-[#005DAD] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
});

export default function EmbedViewPage() {
  const handleClose = () => {
    if (typeof window !== 'undefined') {
      window.parent?.postMessage({ type: 'inpartner_close_chat' }, '*');
    }
  };

  return (
    <main className="fixed inset-0 w-full h-[100dvh] m-0 p-0 overflow-hidden bg-white flex flex-col">
      <ChatWidget
        initialOpen={true}
        embeddedMode={true}
        onClose={handleClose}
      />
    </main>
  );
}

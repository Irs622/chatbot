'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to guarantee zero hydration mismatch in Next.js 13 Pages Router
const ChatWidget = dynamic(() => import('./ChatWidget'), {
  ssr: false,
  loading: () => null
});

export interface ChatbotMountProps {
  initialOpen?: boolean;
  embeddedMode?: boolean;
  onClose?: () => void;
}

/**
 * ChatbotMount: Robust Client-side Mount Wrapper
 * 
 * Usage in Next.js 13 Pages Router (_app.tsx):
 * ```tsx
 * import { ChatbotMount } from '@/components/Chatbot';
 * 
 * export default function App({ Component, pageProps }: AppProps) {
 *   return (
 *     <>
 *       <Component {...pageProps} />
 *       <ChatbotMount />
 *     </>
 *   );
 * }
 * ```
 */
export default function ChatbotMount(props: ChatbotMountProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <ChatWidget {...props} />;
}


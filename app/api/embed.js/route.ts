import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const jsContent = `
(function() {
  if (window.InpartnerChatbotLoaded) return;
  window.InpartnerChatbotLoaded = true;

  // Create container
  const container = document.createElement('div');
  container.id = 'inpartner-assistant-widget';
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '999999';
  container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  // Launcher Button
  const button = document.createElement('button');
  button.id = 'inpartner-chat-btn';
  button.setAttribute('aria-label', 'Konsultasi Bisnis Inpartner');
  button.innerHTML = \`
    <div style="display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #0d5f8a 0%, #083c5a 100%); color: #ffffff; padding: 12px 20px; border-radius: 9999px; box-shadow: 0 10px 25px -5px rgba(13, 95, 138, 0.4); cursor: pointer; border: none; outline: none; transition: transform 0.2s, box-shadow 0.2s;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span style="font-weight: 600; font-size: 14px; letter-spacing: 0.2px;">Konsultasi Bisnis AI</span>
    </div>
  \`;

  // Modal / Iframe Frame
  const iframeContainer = document.createElement('div');
  iframeContainer.id = 'inpartner-chat-frame-wrapper';
  iframeContainer.style.display = 'none';
  iframeContainer.style.position = 'fixed';
  iframeContainer.style.bottom = '88px';
  iframeContainer.style.right = '24px';
  iframeContainer.style.width = '420px';
  iframeContainer.style.maxWidth = 'calc(100vw - 48px)';
  iframeContainer.style.height = '620px';
  iframeContainer.style.maxHeight = 'calc(100vh - 120px)';
  iframeContainer.style.borderRadius = '16px';
  iframeContainer.style.overflow = 'hidden';
  iframeContainer.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.08)';
  iframeContainer.style.background = '#ffffff';
  iframeContainer.style.transition = 'all 0.3s ease';

  const iframe = document.createElement('iframe');
  iframe.src = '${baseUrl}/embed-view';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.title = 'Inpartner AI Business Consultation Assistant';
  iframeContainer.appendChild(iframe);

  let isOpen = false;
  button.onclick = function() {
    isOpen = !isOpen;
    if (isOpen) {
      iframeContainer.style.display = 'block';
      button.querySelector('span').innerText = 'Tutup Konsultasi';
    } else {
      iframeContainer.style.display = 'none';
      button.querySelector('span').innerText = 'Konsultasi Bisnis AI';
    }
  };

  container.appendChild(iframeContainer);
  container.appendChild(button);
  document.body.appendChild(container);
})();
`;

  return new NextResponse(jsContent, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

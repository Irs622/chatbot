import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const jsContent = `
(function() {
  if (window.__INPARTNER_CHAT_INITIALIZED__) return;
  window.__INPARTNER_CHAT_INITIALIZED__ = true;

  const baseUrl = '${baseUrl}';

  // Launcher button
  const launcher = document.createElement('button');
  launcher.id = 'inpartner-chat-launcher';
  launcher.setAttribute('aria-label', 'Open Inpartner Agent');
  launcher.style.cssText =
    'position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; ' +
    'border-radius: 9999px; background: #0d5f8a; color: white; border: none; ' +
    'box-shadow: 0 10px 25px -5px rgba(13, 95, 138, 0.4), 0 8px 10px -6px rgba(13, 95, 138, 0.2); ' +
    'cursor: pointer; z-index: 999998; display: flex; align-items: center; justify-content: center; ' +
    'transition: transform 0.2s ease, background 0.2s ease; outline: none; padding: 0;';

  const botIconSvg =
    '<svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<line x1="50" y1="24" x2="50" y2="12" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" />' +
    '<circle cx="50" cy="11" r="5.5" fill="#38bdf8" />' +
    '<circle cx="50" cy="11" r="2.5" fill="#ffffff" />' +
    '<path d="M22 48 C 22 20, 78 20, 78 48" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.9" />' +
    '<rect x="12" y="36" width="7" height="22" rx="3.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />' +
    '<rect x="81" y="36" width="7" height="22" rx="3.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />' +
    '<path d="M 34 26 L 66 26 C 78 26, 84 34, 84 48 C 84 62, 78 70, 64 70 L 40 70 L 26 82 L 28 70 C 18 68, 16 60, 16 48 C 16 34, 22 26, 34 26 Z" fill="#ffffff" />' +
    '<rect x="25" y="36" width="50" height="28" rx="8" fill="#050e1a" stroke="#38bdf8" stroke-width="1.5" />' +
    '<path d="M 34 49 C 36 43, 42 43, 44 49" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none" />' +
    '<path d="M 56 49 C 58 43, 64 43, 66 49" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" fill="none" />' +
    '<path d="M 46 56 C 48 58.5, 52 58.5, 54 56" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" fill="none" />' +
    '<circle cx="32" cy="54" r="2" fill="#fb7185" opacity="0.6" />' +
    '<circle cx="68" cy="54" r="2" fill="#fb7185" opacity="0.6" />' +
    '</svg>';

  launcher.innerHTML = botIconSvg;

  launcher.onmouseenter = function () {
    launcher.style.background = '#083c5a';
    launcher.style.transform = 'scale(1.05)';
  };
  launcher.onmouseleave = function () {
    launcher.style.background = '#0d5f8a';
    launcher.style.transform = 'scale(1)';
  };

  // Iframe container
  const container = document.createElement('div');
  container.id = 'inpartner-chat-container';
  container.style.cssText =
    'position: fixed; bottom: 92px; right: 24px; width: 420px; max-width: calc(100vw - 32px); ' +
    'height: 720px; max-height: calc(100vh - 120px); border-radius: 24px; overflow: hidden; ' +
    'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); z-index: 999999; display: none; ' +
    'background: white; border: 1px solid rgba(226, 232, 240, 0.8); transition: opacity 0.2s ease, transform 0.2s ease; ' +
    'opacity: 0; transform: translateY(10px);';

  const iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed-view';
  iframe.title = 'Inpartner Agent';
  iframe.style.cssText = 'width: 100%; height: 100%; border: none; display: block;';
  container.appendChild(iframe);

  let isOpen = false;
  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      container.style.display = 'block';
      setTimeout(function () {
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }, 10);
      launcher.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="18" y1="6" x2="6" y2="18"></line>' +
        '<line x1="6" y1="6" x2="18" y2="18"></line>' +
        '</svg>';
    } else {
      container.style.opacity = '0';
      container.style.transform = 'translateY(10px)';
      setTimeout(function () {
        container.style.display = 'none';
      }, 200);
      launcher.innerHTML = botIconSvg;
    }
  }

  launcher.onclick = toggleChat;

  function handleResize() {
    if (window.innerWidth < 640) {
      container.style.bottom = '0';
      container.style.right = '0';
      container.style.width = '100vw';
      container.style.maxWidth = '100vw';
      container.style.height = '100vh';
      container.style.maxHeight = '100vh';
      container.style.borderRadius = '0';
    } else {
      container.style.bottom = '92px';
      container.style.right = '24px';
      container.style.width = '420px';
      container.style.maxWidth = 'calc(100vw - 32px)';
      container.style.height = '720px';
      container.style.maxHeight = 'calc(100vh - 120px)';
      container.style.borderRadius = '24px';
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();

  document.body.appendChild(launcher);
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

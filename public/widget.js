(function () {
  if (window.__INPARTNER_CHAT_INITIALIZED__) return;
  window.__INPARTNER_CHAT_INITIALIZED__ = true;

  // Detect script source to resolve host automatically
  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var scriptSrc = currentScript ? currentScript.src : '';
  var baseUrl = '';
  if (scriptSrc) {
    var a = document.createElement('a');
    a.href = scriptSrc;
    baseUrl = a.origin;
  }
  if (!baseUrl) {
    baseUrl = window.location.origin;
  }

  // Create launcher button
  var launcher = document.createElement('button');
  launcher.id = 'inpartner-chat-launcher';
  launcher.setAttribute('aria-label', 'Open Inpartner Agent');
  launcher.style.cssText =
    'position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; ' +
    'border-radius: 9999px; background: #0d5f8a; color: white; border: none; ' +
    'box-shadow: 0 10px 25px -5px rgba(13, 95, 138, 0.4), 0 8px 10px -6px rgba(13, 95, 138, 0.2); ' +
    'cursor: pointer; z-index: 999998; display: flex; align-items: center; justify-content: center; ' +
    'transition: transform 0.2s ease, background 0.2s ease; outline: none; padding: 0;';

  launcher.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">' +
    '<path d="M12 2C12.8 5.5 14.5 8 18 9C14.5 10 12.8 12.5 12 16C11.2 12.5 9.5 10 6 9C9.5 8 11.2 5.5 12 2Z" />' +
    '<circle cx="12" cy="12" r="2.2" />' +
    '</svg>';

  launcher.onmouseenter = function () {
    launcher.style.background = '#083c5a';
    launcher.style.transform = 'scale(1.05)';
  };
  launcher.onmouseleave = function () {
    launcher.style.background = '#0d5f8a';
    launcher.style.transform = 'scale(1)';
  };

  // Create iframe container
  var container = document.createElement('div');
  container.id = 'inpartner-chat-container';
  container.style.cssText =
    'position: fixed; bottom: 92px; right: 24px; width: 420px; max-width: calc(100vw - 32px); ' +
    'height: 720px; max-height: calc(100vh - 120px); border-radius: 24px; overflow: hidden; ' +
    'box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); z-index: 999999; display: none; ' +
    'background: white; border: 1px solid rgba(226, 232, 240, 0.8); transition: opacity 0.2s ease, transform 0.2s ease; ' +
    'opacity: 0; transform: translateY(10px);';

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed-view';
  iframe.title = 'Inpartner Agent';
  iframe.style.cssText = 'width: 100%; height: 100%; border: none; display: block;';
  container.appendChild(iframe);

  var isOpen = false;

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
      launcher.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">' +
        '<path d="M12 2C12.8 5.5 14.5 8 18 9C14.5 10 12.8 12.5 12 16C11.2 12.5 9.5 10 6 9C9.5 8 11.2 5.5 12 2Z" />' +
        '<circle cx="12" cy="12" r="2.2" />' +
        '</svg>';
    }
  }

  launcher.onclick = toggleChat;

  // Responsive mobile adjust
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

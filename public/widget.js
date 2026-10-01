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
  launcher.setAttribute('aria-label', 'Open Inpartner Business Assistant');
  launcher.style.cssText =
    'position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; ' +
    'border-radius: 9999px; background: #005DAD; color: white; border: none; ' +
    'box-shadow: 0 10px 25px -5px rgba(0, 93, 173, 0.45), 0 8px 10px -6px rgba(0, 93, 173, 0.25); ' +
    'cursor: pointer; z-index: 999998; display: flex; align-items: center; justify-content: center; ' +
    'transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease; outline: none; padding: 0;';

  var botIconSvg =
    '<svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
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

  var closeIconSvg =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"></line>' +
    '<line x1="6" y1="6" x2="18" y2="18"></line>' +
    '</svg>';

  launcher.innerHTML = botIconSvg;

  launcher.onmouseenter = function () {
    launcher.style.background = '#004785';
    launcher.style.transform = 'scale(1.06)';
  };
  launcher.onmouseleave = function () {
    launcher.style.background = '#005DAD';
    launcher.style.transform = 'scale(1)';
  };

  // Create proactive teaser bubble
  var teaser = document.createElement('div');
  teaser.id = 'inpartner-chat-teaser';
  teaser.style.cssText =
    'position: fixed; bottom: 92px; right: 24px; width: 310px; max-width: calc(100vw - 32px); ' +
    'background: white; border: 1px solid rgba(0, 93, 173, 0.2); border-radius: 20px; ' +
    'box-shadow: 0 20px 35px -10px rgba(0, 45, 95, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.04); ' +
    'padding: 14px 16px; z-index: 999997; cursor: pointer; display: none; opacity: 0; ' +
    'transform: translateY(12px) scale(0.96); ' +
    'transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); ' +
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;';

  teaser.innerHTML =
    '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">' +
      '<div style="display:flex; align-items:center; gap:6px;">' +
        '<span style="width:7px; height:7px; border-radius:50%; background:#10b981; display:inline-block; box-shadow:0 0 0 2px rgba(16,185,129,0.25);"></span>' +
        '<span id="inpartner-teaser-badge" style="font-weight:700; font-size:11.5px; color:#005DAD; letter-spacing:-0.01em;">Inpartner AI Advisory</span>' +
      '</div>' +
      '<button id="inpartner-teaser-close" aria-label="Dismiss greeting" style="background:none; border:none; color:#94a3b8; font-size:13px; line-height:1; cursor:pointer; padding:3px 5px; border-radius:6px;">✕</button>' +
    '</div>' +
    '<div id="inpartner-teaser-title" style="font-weight:700; font-size:13px; color:#0f172a; line-height:1.35; margin-bottom:4px;">' +
      'Evaluating Strategic Options?' +
    '</div>' +
    '<div id="inpartner-teaser-body" style="font-size:11.5px; color:#64748b; line-height:1.4; margin-bottom:10px;">' +
      'Evaluating strategic corporate options or market expansion plans? Our advisory team is available for preliminary discussion.' +
    '</div>' +
    '<div style="display:flex; align-items:center; justify-content:space-between; padding-top:8px; border-top:1px solid #f1f5f9;">' +
      '<span id="inpartner-teaser-cta" style="font-size:11.5px; font-weight:700; color:#005DAD; display:flex; align-items:center; gap:4px;">' +
        'Start Consultation &rarr;' +
      '</span>' +
      '<span style="font-size:10.5px; color:#94a3b8; font-weight:500;">Online 24/7 • Confidential</span>' +
    '</div>';

  // Create iframe container
  var container = document.createElement('div');
  container.id = 'inpartner-chat-container';
  container.style.cssText =
    'position: fixed; z-index: 999999; display: none; ' +
    'background: white; overflow: hidden; ' +
    'transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1); ' +
    'opacity: 0; transform: translateY(14px);';

  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed-view';
  iframe.title = 'Inpartner AI Business Consultation Assistant';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.style.cssText = 'width: 100%; height: 100%; border: none; display: block; background: white;';
  container.appendChild(iframe);

  var isOpen = false;
  var previousBodyOverflow = '';

  function applyResponsiveLayout() {
    var isMobile = window.innerWidth < 640;
    if (isMobile) {
      container.style.top = '0';
      container.style.left = '0';
      container.style.bottom = '0';
      container.style.right = '0';
      container.style.width = '100vw';
      container.style.maxWidth = '100vw';
      container.style.height = '100%';
      container.style.maxHeight = '100%';
      container.style.borderRadius = '0';
      container.style.boxShadow = 'none';
      container.style.border = 'none';

      teaser.style.bottom = '90px';
      teaser.style.right = '16px';
      teaser.style.left = '16px';
      teaser.style.width = 'auto';
      teaser.style.maxWidth = 'calc(100vw - 32px)';

      if (isOpen) {
        launcher.style.display = 'none';
      } else {
        launcher.style.display = 'flex';
      }
    } else {
      container.style.top = 'auto';
      container.style.left = 'auto';
      container.style.bottom = '92px';
      container.style.right = '24px';
      container.style.width = '420px';
      container.style.maxWidth = 'calc(100vw - 32px)';
      container.style.height = '720px';
      container.style.maxHeight = 'calc(100vh - 120px)';
      container.style.borderRadius = '24px';
      container.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.06)';
      container.style.border = '1px solid rgba(226, 232, 240, 0.9)';

      teaser.style.bottom = '92px';
      teaser.style.right = '24px';
      teaser.style.left = 'auto';
      teaser.style.width = '310px';

      launcher.style.display = 'flex';
    }
  }

  function setTeaserContent(type) {
    var titleEl = teaser.querySelector('#inpartner-teaser-title');
    var bodyEl = teaser.querySelector('#inpartner-teaser-body');
    var badgeEl = teaser.querySelector('#inpartner-teaser-badge');
    var ctaEl = teaser.querySelector('#inpartner-teaser-cta');

    if (type === 'exit_intent') {
      if (badgeEl) badgeEl.textContent = 'Strategic Opportunity';
      if (titleEl) titleEl.textContent = 'Before You Leave';
      if (bodyEl) bodyEl.textContent = 'Explore strategic corporate partnerships or business optimization with an Inpartner advisor before you leave.';
      if (ctaEl) ctaEl.innerHTML = 'Quick Consultation &rarr;';
    } else if (type === 'return_visitor') {
      if (badgeEl) badgeEl.textContent = 'Welcome Back';
      if (titleEl) titleEl.textContent = 'Continue Your Consultation';
      if (bodyEl) bodyEl.textContent = 'Glad to see you again. Would you like to continue our advisory discussion or schedule a diagnostic assessment?';
      if (ctaEl) ctaEl.innerHTML = 'Continue Session &rarr;';
    } else {
      if (badgeEl) badgeEl.textContent = 'Inpartner AI Advisory';
      if (titleEl) titleEl.textContent = 'Evaluating Strategic Options?';
      if (bodyEl) bodyEl.textContent = 'Evaluating strategic corporate options or market expansion plans? Our advisory team is available for preliminary discussion.';
      if (ctaEl) ctaEl.innerHTML = 'Start Consultation &rarr;';
    }
  }

  function showTeaser(type) {
    if (isOpen) return;
    try {
      if (sessionStorage.getItem('inpartner_nudge_dismissed') || sessionStorage.getItem('inpartner_nudge_shown')) return;
      sessionStorage.setItem('inpartner_nudge_shown', 'true');
    } catch (e) {}

    setTeaserContent(type || 'dwell_time');
    teaser.style.display = 'block';
    setTimeout(function () {
      teaser.style.opacity = '1';
      teaser.style.transform = 'translateY(0) scale(1)';
    }, 25);
  }

  function hideTeaser(permanently) {
    if (permanently) {
      try {
        sessionStorage.setItem('inpartner_nudge_dismissed', 'true');
      } catch (e) {}
    }
    teaser.style.opacity = '0';
    teaser.style.transform = 'translateY(12px) scale(0.96)';
    setTimeout(function () {
      teaser.style.display = 'none';
    }, 280);
  }

  function openChat() {
    if (isOpen) return;
    hideTeaser(true);
    isOpen = true;
    applyResponsiveLayout();

    container.style.display = 'block';
    setTimeout(function () {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 15);

    launcher.innerHTML = closeIconSvg;
    launcher.setAttribute('aria-label', 'Close Inpartner Assistant');

    if (window.innerWidth < 640) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      launcher.style.display = 'none';
    }
  }

  function closeChat() {
    if (!isOpen) return;
    isOpen = false;

    container.style.opacity = '0';
    container.style.transform = 'translateY(14px)';

    if (window.innerWidth < 640) {
      document.body.style.overflow = previousBodyOverflow || '';
    }

    setTimeout(function () {
      container.style.display = 'none';
      launcher.style.display = 'flex';
    }, 220);

    launcher.innerHTML = botIconSvg;
    launcher.setAttribute('aria-label', 'Open Inpartner Business Assistant');
  }

  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  launcher.onclick = toggleChat;

  // Teaser click handlers
  teaser.onclick = function (e) {
    var closeBtn = teaser.querySelector('#inpartner-teaser-close');
    if (closeBtn && (e.target === closeBtn || closeBtn.contains(e.target))) {
      e.stopPropagation();
      hideTeaser(true);
      return;
    }
    openChat();
  };

  var teaserCloseBtn = teaser.querySelector('#inpartner-teaser-close');
  if (teaserCloseBtn) {
    teaserCloseBtn.onclick = function (e) {
      e.stopPropagation();
      hideTeaser(true);
    };
  }

  // Return visitor detection
  var isReturning = false;
  try {
    var rawVisits = localStorage.getItem('inpartner_visitor_profile');
    var visitCount = 1;
    if (rawVisits) {
      var prof = JSON.parse(rawVisits);
      visitCount = (prof.visitCount || 1) + 1;
      isReturning = true;
    }
    localStorage.setItem('inpartner_visitor_profile', JSON.stringify({ visitCount: visitCount, lastVisit: new Date().toISOString() }));
  } catch (e) {}

  // 1. Dwell time trigger: 25 seconds for new visitors, 10 seconds for returning visitors
  var dwellDelay = isReturning ? 10000 : 25000;
  var dwellTimer = setTimeout(function () {
    if (!isOpen) {
      showTeaser(isReturning ? 'return_visitor' : 'dwell_time');
    }
  }, dwellDelay);

  // 2. Desktop exit-intent trigger: mouseleave towards address bar / tab bar
  if (typeof document !== 'undefined') {
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY <= 15 && window.innerWidth >= 768 && !isOpen) {
        showTeaser('exit_intent');
      }
    });
  }

  // Listen for postMessage from inside iframe (e.g. ChatWidget close button clicked)
  window.addEventListener('message', function (event) {
    if (!event || !event.data) return;
    var type = event.data.type;
    if (type === 'inpartner_close_chat') {
      closeChat();
    } else if (type === 'inpartner_open_chat') {
      openChat();
    } else if (type === 'inpartner_toggle_chat') {
      toggleChat();
    }
  });

  // ESC key to close on desktop
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      closeChat();
    }
  });

  window.addEventListener('resize', applyResponsiveLayout);
  applyResponsiveLayout();

  document.body.appendChild(launcher);
  document.body.appendChild(teaser);
  document.body.appendChild(container);
})();

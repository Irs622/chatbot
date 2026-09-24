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

  var botIconSvg =
    '<svg width="32" height="32" viewBox="105 115 450 320" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M473.552 156.614C440.883 125.97 416.365 124.797 374.883 125.019C363.182 131.913 300.39 143.338 289 150.501H358.67C395.979 150.486 427.735 145.476 456.559 174.214C470.612 188.294 479.334 206.819 481.242 226.621C482.165 236.298 481.5 246.061 481.743 255.518C482.613 288.938 481.852 315.948 456.48 340.976C431.852 365.269 408.978 365.889 376.796 366.152C372.752 368.517 332.99 392.122 331.971 392.188C331.028 393.082 331.202 392.562 331.147 393.666C332.419 394.004 351.473 393.794 354.066 393.811C387.888 394.021 415.982 395.99 447.45 380.402C473.731 367.383 497.037 344.796 506.559 316.611C496.317 316.643 493.709 313.758 493.65 303.685C493.61 296.726 493.635 289.655 493.635 282.688L493.6 233.703C493.655 221.973 494.39 216.597 508 217.495C507.732 217.112 503.097 203.601 502.501 202.095C495.805 185.157 486.969 169.197 473.552 156.614Z" fill="white"/>' +
    '<path d="M150 217.275C150.827 215.303 151.408 213.421 152.005 211.38C158.892 187.822 172.083 165.704 191.303 150.051C209.138 135.532 231.079 126.932 254.057 125.452C271.518 124.278 290.53 125.841 308.149 125.165C311.16 125.049 366.99 124.87 370 125.167C360.424 130.602 317.827 136.203 308.149 141.454C305.312 142.998 284.031 148.986 281.967 149.085C273.415 149.5 254.315 150.109 245.473 151.524C213.155 156.695 187.451 181.313 179.028 212.53C174.553 228.774 175.973 245.372 175.817 262.152C175.714 273.253 175.424 286.893 177.502 297.585C179.27 306.74 182.542 315.541 187.185 323.633C198.271 344.206 216.708 357.581 238.434 363.59C250.481 366.825 260.554 366.398 272.856 366.491C301.906 366.713 331.119 366.106 360.155 366.569C348.976 373.906 337.668 381.056 326.244 388.013C315.011 394.438 303.895 401.965 292.687 408.562C283.478 413.982 276.912 418.755 266.611 422C270.409 412.794 274.136 403.56 277.793 394.297C219.502 394.333 172.909 373.763 151.103 317.024C160.572 316.82 164.343 314.45 164.263 304.333C164.054 277.828 165.057 250.872 163.81 224.416C163.49 217.625 155.451 217.141 150 217.275Z" fill="#223A52"/>' +
    '<path d="M266.269 223.001C267.065 222.997 267.861 223.003 268.657 223.021C279.736 223.293 290.239 229.05 297.61 237.294C301.634 241.794 305.957 247.219 300.251 252.098C299.562 252.993 295.056 255.577 294.346 254.883C285.064 245.815 282.598 239.236 268.487 237.916C247.721 237.703 247.554 252.85 241.159 254.574C239.383 255.053 236.996 253.676 235.6 252.698C234.153 251.683 232.196 249.859 232.021 247.93C231.708 244.482 235.019 240.138 237.048 237.668C244.759 228.283 254.559 223.932 266.269 223.001Z" fill="#1469E2"/>' +
    '<path d="M390.366 223C404.151 223.056 422.367 231.298 426.912 247.043C427.974 250.721 419.042 255.743 418.174 254.908C408.984 246.064 406.677 239.317 392.802 237.972C382.149 237.754 375.971 241.67 369.242 250.004C367.689 251.928 366.116 253.844 363.833 254.725C361.992 254.445 361.734 253.858 360.335 252.873C353.452 248.072 355.75 243.285 360.419 238.006C368.567 228.786 378.328 223.593 390.366 223Z" fill="#1469E2"/>' +
    '<path d="M356.232 295C358.323 295.213 361.446 296.504 362.99 297.863C364.207 298.935 364.927 300.441 364.991 302.04C365.185 305.855 362.121 309.634 359.584 312.284C352.285 320.023 342.135 324.592 331.385 324.981C318.927 325.337 309.534 320.682 300.746 312.49C297.354 308.459 288.211 299.126 303.879 295.674C305.195 295.384 311.945 303.971 314.962 306.241C325.491 314.163 340.149 312.292 349.157 303.065C351.53 300.592 353.124 296.922 356.232 295Z" fill="#1469E2"/>' +
    '<path d="M139.642 167.775C138.096 167.238 136.112 166.558 134.678 165.823C129.91 163.37 126.297 159.135 124.623 154.033C118.978 136.393 138.382 121.812 153.82 130.667C158.558 133.398 162.021 137.902 163.449 143.188C166.435 154.585 159.807 164.681 148.554 167.42L149.549 202.33C149.706 206.714 149.701 213.127 150.115 217.26L150.673 217.576C156.079 217.443 164.05 217.925 164.367 224.695C165.604 251.064 164.609 277.932 164.817 304.351C164.896 314.435 161.157 316.797 151.766 317C146.089 315.468 136.304 318.391 128.464 312.686C123.801 309.665 118.468 302.879 117.831 297.177C116.763 286.912 117.095 276.271 117.146 265.918C117.257 243.772 113.21 222.712 141.125 217.746C141.215 202.418 140.092 183.441 139.642 167.775ZM146.313 158.233C149.884 157.412 152.739 154.729 153.786 151.21C154.833 147.691 153.91 143.88 151.37 141.233C148.83 138.586 145.066 137.512 141.516 138.422C136.121 139.804 132.838 145.278 134.151 150.701C135.464 156.124 140.885 159.482 146.313 158.233Z" fill="#1469E2"/>' +
    '<path d="M510.791 165.762C504.789 163.806 500.474 161.583 497.453 155.711C494.892 150.673 494.512 144.834 496.403 139.517C498.264 134.34 502.168 130.117 507.232 127.798C512.013 125.627 517.473 125.413 522.411 127.205C540.43 133.709 540.891 157.493 522.853 164.774C521.859 165.174 520.84 165.532 519.816 165.85C519.912 182.567 518.908 200.949 518.452 217.778C529.089 219.766 541.652 227.277 542.336 239.22C543.406 258.02 543.066 277.974 542.143 296.776C541.763 302.426 535.335 310.131 530.604 312.983C521.955 318.197 515.805 316.103 507.227 317C496.773 317.032 494.112 314.14 494.051 304.047C494.01 297.073 494.035 289.987 494.035 283.005L494 233.916C494.056 222.162 494.806 216.774 508.698 217.675C509.818 216.702 509.691 216.226 509.686 214.689C509.61 198.567 511.02 181.822 510.791 165.762ZM517.59 156.392C523.228 155.316 526.914 149.963 525.834 144.426C524.749 138.888 519.309 135.255 513.666 136.304C508.008 137.357 504.292 142.724 505.377 148.28C506.462 153.837 511.937 157.471 517.59 156.392Z" fill="#4693FF"/>' +
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
      launcher.innerHTML = botIconSvg;
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

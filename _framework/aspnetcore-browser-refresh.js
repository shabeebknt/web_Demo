setTimeout(async function () {
  const hotReloadActiveKey = '_dotnet_watch_hot_reload_active';
  // Ensure we only try to connect once, even if the script is both injected and manually inserted
  const scriptInjectedSentinel = '_dotnet_watch_ws_injected';
  if (window.hasOwnProperty(scriptInjectedSentinel)) {
    return;
  }
  window[scriptInjectedSentinel] = true;

  // dotnet-watch browser reload script
  const webSocketUrls = 'wss://localhost:44325/MyWebsite_UI/,ws://localhost:51021/MyWebsite_UI/'.split(',');
  const sharedSecret = await getSecret('MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA68YUx2UUOohHHqHy1qpG3kr0yqdl7zDa3vlsDsByqaEDp8pVxNGEdyWjBrx8oPp/iAe2/tyjA2wFMbXGazFWOqUVU0cqKf4sM8qCl8FXjDbb7dW54S3dmgKyux/DAI+f9NC5GCIPXSxs0RNpYg7+umat07uLUO1F/xhBOUTUmmcTvJbctev7u/VRDs242tlsRiVZxoray4dJnHgY6XJV7UPFibWo1sa5K9x6QUj0dVkwx2TrjgNQ11ibbAWgUzz9a3L/SHJ6aOoA0G9FSEkeOYp0yAhY0F1inipYzVePFIu2E2FPeyMSF1TQClmubWEHXqvAZE3MCG/nAstB3qFpFQIDAQAB');
  let connection;
  for (const url of webSocketUrls) {
    try {
      connection = await getWebSocket(url);
      break;
    } catch (ex) {
      console.debug(ex);
    }
  }
  if (!connection) {
    console.debug('Unable to establish a connection to the browser refresh server.');
    return;
  }

  let waiting = false;

  connection.onmessage = function (message) {
    if (message.data === 'Reload') {
      console.debug('Server is ready. Reloading...');
      location.reload();
    } else if (message.data === 'Wait') {
      if (waiting) {
        return;
      }
      waiting = true;
      console.debug('File changes detected. Waiting for application to rebuild.');
      const glyphs = ['☱', '☲', '☴'];
      const title = document.title;
      let i = 0;
      setInterval(function () { document.title = glyphs[i++ % glyphs.length] + ' ' + title; }, 240);
    } else {
      const payload = JSON.parse(message.data);
      const action = {
        'UpdateStaticFile': () => updateStaticFile(payload.path),
        'BlazorHotReloadDeltav1': () => applyBlazorDeltas(payload.sharedSecret, payload.deltas, false),
        'BlazorHotReloadDeltav2': () => applyBlazorDeltas(payload.sharedSecret, payload.deltas, true),
        'HotReloadDiagnosticsv1': () => displayDiagnostics(payload.diagnostics),
        'BlazorRequestApplyUpdateCapabilities': () => getBlazorWasmApplyUpdateCapabilities(false),
        'BlazorRequestApplyUpdateCapabilities2': () => getBlazorWasmApplyUpdateCapabilities(true),
        'AspNetCoreHotReloadApplied': () => aspnetCoreHotReloadApplied()
      };

      if (payload.type && action.hasOwnProperty(payload.type)) {
        action[payload.type]();
      } else {
        console.error('Unknown payload:', message.data);
      }
    }
  }

  connection.onerror = function (event) { console.debug('dotnet-watch reload socket error.', event) }
  connection.onclose = function () { console.debug('dotnet-watch reload socket closed.') }
  connection.onopen = function () { console.debug('dotnet-watch reload socket connected.') }

  function updateStaticFile(path) {
    if (path && path.endsWith('.css')) {
      updateCssByPath(path);
    } else {
      console.debug(`File change detected to file ${path}. Reloading page...`);
      location.reload();
      return;
    }
  }

  async function updateCssByPath(path) {
    const styleElement = document.querySelector(`link[href^="${path}"]`) ||
      document.querySelector(`link[href^="${document.baseURI}${path}"]`);

    // Receive a Clear-site-data header.
    await fetch('/_framework/clear-browser-cache');

    if (!styleElement || !styleElement.parentNode) {
      console.debug('Unable to find a stylesheet to update. Updating all local css files.');
      updateAllLocalCss();
    }

    updateCssElement(styleElement);
  }

  function updateAllLocalCss() {
    [...document.querySelectorAll('link')]
      .filter(l => l.baseURI === document.baseURI)
      .forEach(e => updateCssElement(e));
  }

  function getBlazorWasmApplyUpdateCapabilities(sendErrorToClient) {
    let applyUpdateCapabilities;
    try {
      applyUpdateCapabilities = window.Blazor._internal.getApplyUpdateCapabilities();
    } catch (error) {
      const message = error.message || '<unknown error>'
      let messageAndStack = error.stack || message
      if (!messageAndStack.includes(message))
      {
         messageAndStack = message + "\n" + messageAndStack;
      }

      applyUpdateCapabilities = sendErrorToClient ? "!" + messageAndStack : '';
    }
    connection.send(applyUpdateCapabilities);
  }

  function updateCssElement(styleElement) {
    if (!styleElement || styleElement.loading) {
      // A file change notification may be triggered for the same file before the browser
      // finishes processing a previous update. In this case, it's easiest to ignore later updates
      return;
    }

    const newElement = styleElement.cloneNode();
    const href = styleElement.href;
    newElement.href = href.split('?', 1)[0] + `?nonce=${Date.now()}`;

    styleElement.loading = true;
    newElement.loading = true;
    newElement.addEventListener('load', function () {
      newElement.loading = false;
      styleElement.remove();
    });

    styleElement.parentNode.insertBefore(newElement, styleElement.nextSibling);
  }

  async function applyBlazorDeltas(serverSecret, deltas, sendErrorToClient) {
    if (sharedSecret && (serverSecret != sharedSecret.encodedSharedSecret)) {
      // Validate the shared secret if it was specified. It might be unspecified in older versions of VS
      // that do not support this feature as yet.
      throw 'Unable to validate the server. Rejecting apply-update payload.';
    }

    let applyError = undefined;
    if (window.Blazor?._internal?.applyHotReload) {
      // Only apply hot reload deltas if Blazor has been initialized.
      // It's possible for Blazor to start after the initial page load, so we don't consider skipping this step
      // to be a failure. These deltas will get applied later, when Blazor completes initialization.
      deltas.forEach(d => {
        try {
          window.Blazor._internal.applyHotReload(d.moduleId, d.metadataDelta, d.ilDelta, d.pdbDelta)
        } catch (error) {
          console.warn(error);
          applyError = error;
        }
      });
    }

    try {
      await fetch('/_framework/blazor-hotreload', { method: 'post', headers: { 'content-type': 'application/json' }, body: JSON.stringify(deltas) });
    } catch (error) {
      console.warn(error);
      applyError = error;
    }

    if (applyError) {
      sendDeltaNotApplied(sendErrorToClient ? applyError : undefined);
    } else {
      sendDeltaApplied();
      notifyHotReloadApplied();
    }
  }

  function displayDiagnostics(diagnostics) {
    document.querySelectorAll('#dotnet-compile-error').forEach(el => el.remove());
    const el = document.body.appendChild(document.createElement('div'));
    el.id = 'dotnet-compile-error';
    el.setAttribute('style', 'z-index:1000000; position:fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); color:black; overflow: scroll;');
    diagnostics.forEach(error => {
      const item = el.appendChild(document.createElement('div'));
      item.setAttribute('style', 'border: 2px solid red; padding: 8px; background-color: #faa;')
      const message = item.appendChild(document.createElement('div'));
      message.setAttribute('style', 'font-weight: bold');
      message.textContent = error.Message;
      item.appendChild(document.createElement('div')).textContent = error;
    });
  }

  function notifyHotReloadApplied() {
    document.querySelectorAll('#dotnet-compile-error').forEach(el => el.remove());
    if (document.querySelector('#dotnet-hotreload-toast')) {
      return;
    }
    if (!window[hotReloadActiveKey])
    {
        return;
    }
    const el = document.createElement('div');
    el.id = 'dotnet-hotreload-toast';
    el.innerHTML = "<svg style=\"filter: drop-shadow(0px 2px 1px rgb(0 0 0 / 0.4));\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 500 500\"><style><![CDATA[#hotreloaded-ellipse1 {animation: hotreloaded-ellipse1_c_o 1800ms linear 1 normal forwards}@keyframes hotreloaded-ellipse1_c_o { 0% {opacity: 0} 16.666667% {opacity: 1} 72.222222% {opacity: 1} 90% {opacity: 0} 100% {opacity: 0}} #hotreloaded-path1 {animation-name: hotreloaded-path1__m, hotreloaded-path1_c_o;animation-duration: 1800ms;animation-delay:100ms;animation-fill-mode: forwards;animation-timing-function: linear;animation-direction: normal;animation-iteration-count: 1;}@keyframes hotreloaded-path1__m { 0% {d: path('M126.151214,288.396852L196.625037,350.661591L320.793323,178.518242')} 16.666667% {d: path('M126.151214,288.396852L126.151214,288.396852L126.151214,288.396852')} 22.222222% {d: path('M126.151214,288.396852L196.625037,350.661591L196.625037,350.661591');animation-timing-function: cubic-bezier(0.42,0,0.58,1)} 33.333333% {d: path('M126.151214,288.396852L196.625037,350.661591L320.793323,178.518242')} 100% {d: path('M126.151214,288.396852L196.625037,350.661591L320.793323,178.518242')}}@keyframes hotreloaded-path1_c_o { 0% {opacity: 0} 16.666667% {opacity: 0} 22.222222% {opacity: 1} 72.222222% {opacity: 1} 90% {opacity: 0} 100% {opacity: 0}}]]></style><ellipse id=\"hotreloaded-ellipse1\" rx=\"212.808853\" ry=\"205.404598\" transform=\"matrix(0.982102 0 0 1.017504 251 238)\" opacity=\"0\" fill=\"rgb(120,120,120)\"/><path id=\"hotreloaded-path1\" d=\"M126.151214,288.396852L196.625037,350.661591L320.793323,178.518242\" transform=\"matrix(1 0 0 1 27.527732 -26.589916)\" opacity=\"0\" fill=\"none\" stroke=\"rgb(255,255,255)\" stroke-width=\"40\" stroke-linecap=\"round\"/></svg>";
    el.setAttribute('style', 'z-index: 1000000; width: 48px; height: 48px; position:fixed; top:5px; left: 5px');
    document.body.appendChild(el);
    window[hotReloadActiveKey] = false;
    setTimeout(() => el.remove(), 2000);
  }

  function aspnetCoreHotReloadApplied() {
    if (window.Blazor) {
      window[hotReloadActiveKey] = true;
      // hotReloadApplied triggers an enhanced navigation to
      // refresh pages that have been statically rendered with
      // Blazor SSR.
      if (window.Blazor?._internal?.hotReloadApplied)
      {
        Blazor._internal.hotReloadApplied();
      }
      else
      {
        notifyHotReloadApplied();
      }
    } else {
      location.reload();
    }
  }

  function sendDeltaApplied() {
    connection.send(new Uint8Array([1]).buffer);
  }

  function sendDeltaNotApplied(error) {
    if (error) {
      let encoder = new TextEncoder()
      connection.send(encoder.encode("\0" + error.message + "\0" + error.stack));
    } else {
      connection.send(new Uint8Array([0]).buffer);
    }
  }

  async function getSecret(serverKeyString) {
    if (!serverKeyString || !window.crypto || !window.crypto.subtle) {
      return null;
    }

    const secretBytes = window.crypto.getRandomValues(new Uint8Array(32)); // 32-bytes of entropy

    // Based on https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey#subjectpublickeyinfo_import
    const binaryServerKey = str2ab(atob(serverKeyString));
    const serverKey = await window.crypto.subtle.importKey('spki', binaryServerKey, { name: "RSA-OAEP", hash: "SHA-256" }, false, ['encrypt']);
    const encrypted = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, serverKey, secretBytes);
    return {
      encryptedSharedSecret: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      encodedSharedSecret: btoa(String.fromCharCode(...secretBytes)),
    };

    function str2ab(str) {
      const buf = new ArrayBuffer(str.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }
  }

  function getWebSocket(url) {
    return new Promise((resolve, reject) => {
      const encryptedSecret = sharedSecret && sharedSecret.encryptedSharedSecret;
      const protocol = encryptedSecret ? encodeURIComponent(encryptedSecret) : [];
      const webSocket = new WebSocket(url, protocol);
      let opened = false;

      function onOpen() {
        opened = true;
        clearEventListeners();
        resolve(webSocket);
      }

      function onClose(event) {
        if (opened) {
          // Open completed successfully. Nothing to do here.
          return;
        }

        let error = 'WebSocket failed to connect.';
        if (event instanceof ErrorEvent) {
          error = event.error;
        }

        clearEventListeners();
        reject(error);
      }

      function clearEventListeners() {
        webSocket.removeEventListener('open', onOpen);
        // The error event isn't as reliable, but close is always called even during failures.
        // If close is called without a corresponding open, we can reject the promise.
        webSocket.removeEventListener('close', onClose);
      }

      webSocket.addEventListener('open', onOpen);
      webSocket.addEventListener('close', onClose);
      if (window.Blazor?.removeEventListener && window.Blazor?.addEventListener)
      {
        webSocket.addEventListener('close', () => window.Blazor?.removeEventListener('enhancedload', notifyHotReloadApplied));
        window.Blazor?.addEventListener('enhancedload', notifyHotReloadApplied);
      }
    });
  }
}, 500);

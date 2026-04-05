(function () {
  function initUrlSync() {
    var iframe = document.getElementById('app-iframe');
    if (!iframe) {
      return;
    }

    var iframeOrigin;
    try {
      iframeOrigin = new URL(iframe.src, window.location.origin).origin;
    } catch (e) {
      return;
    }

    var iframeReady = false;
    var lastTrackedIframeHash = '';

    function syncHashToIframe(hash) {
      if (!iframeReady) {
        return;
      }

      try {
        var hashValue = String(hash || '').replace(/^#/, '');
        iframe.contentWindow.postMessage(
          {
            type: 'NAVIGATE_TO_HASH',
            hash: hashValue,
            timestamp: Date.now(),
          },
          iframeOrigin
        );
      } catch (e) {
        // noop
      }
    }

    iframe.addEventListener('load', function () {
      iframeReady = true;

      if (window.location.hash) {
        syncHashToIframe(window.location.hash);
      }
    });

    window.addEventListener('message', function (event) {
      if (event.source !== iframe.contentWindow) {
        return;
      }

      if (event.origin !== iframeOrigin) {
        return;
      }

      if (event.data && event.data.type === 'HASH_CHANGED') {
        var iframeHash = event.data.hash;
        if (!iframeHash) {
          return;
        }

        var newHash = iframeHash.charAt(0) === '#' ? iframeHash : '#' + iframeHash;
        if (window.location.hash !== newHash) {
          window.location.hash = newHash;
        }
      }
    });

    window.addEventListener('hashchange', function () {
      syncHashToIframe(window.location.hash);
    });

    // Fallback polling for localhost/same-origin development cases.
    setInterval(function () {
      if (!iframeReady) {
        return;
      }

      try {
        var iframeHash = iframe.contentWindow.location.hash;
        if (iframeHash !== lastTrackedIframeHash) {
          lastTrackedIframeHash = iframeHash;

          if (iframeHash && window.location.hash !== iframeHash) {
            window.location.hash = iframeHash;
          }
        }
      } catch (e) {
        // Expected in cross-origin mode.
      }
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUrlSync);
  } else {
    initUrlSync();
  }
})();

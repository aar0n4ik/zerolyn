/* Zerolyn - assets/walletconnect.js
   Defines window.SPWC: Freighter Mobile connection via WalletConnect v2 / Reown.
   Uses the official Reown AppKit modal (per Freighter's dApp docs) so the wallet
   is opened and paired through Freighter's exact registry deep link -- in a phone
   browser, inside Freighter's in-app Discover browser, and via QR on desktop. If
   AppKit cannot be loaded, it falls back to the manual deep link + copy/paste URI.

   send.js gate: WC() uses this object when window.SPWC.ready() is truthy, then
   Wallet.connect() drives it and feeds the pairing URI to setWCUri().

   Project ID: created at https://dashboard.reown.com (Reown / WalletConnect Cloud).
*/
(function () {
  'use strict';

  var PROJECT_ID = '8270edd9a0e826b51a7729bac80a21ff';
  var NETWORK = 'testnet';                 // 'testnet' | 'pubnet'
  var CHAIN   = 'stellar:' + NETWORK;      // CAIP-2 chain id (this app: testnet)
  var CHAIN_TESTNET = 'stellar:testnet';
  var CHAIN_PUBNET  = 'stellar:pubnet';
  var METHODS = ['stellar_signXDR', 'stellar_signAndSubmitXDR'];
  var UP_CDN  = 'https://esm.sh/@walletconnect/universal-provider@2.17.2';
  // Official Reown AppKit modal (per Freighter dApp docs). It knows Freighter's
  // registry deep link, so it opens + pairs the wallet correctly on a phone
  // browser, inside Freighter Discover, and via QR on desktop.
  var APPKIT_CDN     = 'https://esm.sh/@reown/appkit@1/core';
  var APPKIT_NET_CDN = 'https://esm.sh/@reown/appkit@1/networks';

  var provider = null, modal = null, session = null, address = null, initing = null, uriCb = null, connectedChain = null;

  function meta() {
    var o = location.origin;
    return {
      name: 'Zerolyn',
      description: 'Compliant private payments on Stellar',
      url: o,
      icons: [o + '/favicon.png']
    };
  }
  function isMobile() { return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || ''); }
  // Production Freighter Mobile (org.stellar.freighterwallet) registers the custom
  // scheme "freighterwallet". Used only by the no-AppKit fallback path below.
  var FREIGHTER_SCHEME = 'freighterwallet';
  function freighterLink(uri) { return FREIGHTER_SCHEME + '://wc?uri=' + encodeURIComponent(uri); }

  function copyLabel() {
    var l = (navigator.language || 'en').slice(0, 2).toLowerCase();
    var m = {
      en: 'Copy link (paste it in Freighter)',
      ru: '\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u0441\u044b\u043b\u043a\u0443 (\u0432\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u0432 Freighter)',
      uk: '\u0421\u043a\u043e\u043f\u0456\u044e\u0432\u0430\u0442\u0438 \u043f\u043e\u0441\u0438\u043b\u0430\u043d\u043d\u044f (\u0432\u0441\u0442\u0430\u0432\u0442\u0435 \u0443 Freighter)',
      es: 'Copiar enlace (p\u00e9galo en Freighter)',
      de: 'Link kopieren (in Freighter einf\u00fcgen)'
    };
    return m[l] || m.en;
  }
  function injectCopyButton(uri) {
    try {
      var qr = document.getElementById('wm-qr');
      var card = (qr && qr.parentNode) || document.querySelector('.wm-card');
      if (!card || document.getElementById('wm-copy')) return;
      var b = document.createElement('button');
      b.id = 'wm-copy';
      b.type = 'button';
      b.className = 'wm-cta';
      b.style.marginTop = '10px';
      b.textContent = copyLabel();
      b.onclick = function () {
        function done() { b.textContent = '\u2713 ' + copyLabel(); }
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(uri).then(done, function () {});
          } else {
            var ta = document.createElement('textarea');
            ta.value = uri; document.body.appendChild(ta); ta.focus(); ta.select();
            try { document.execCommand('copy'); } catch (_) {}
            document.body.removeChild(ta); done();
          }
        } catch (_) {}
      };
      card.appendChild(b);
    } catch (_) {}
  }
  function addrOf(sess) {
    try { return sess.namespaces.stellar.accounts[0].split(':').pop(); } catch (_) { return null; }
  }
  // Which Stellar network the wallet actually approved (e.g. 'stellar:testnet').
  function chainOf(sess) {
    try { var a = sess.namespaces.stellar.accounts[0].split(':'); return a[0] + ':' + a[1]; } catch (_) { return null; }
  }
  function warnLabel() {
    var l = (navigator.language || 'en').slice(0, 2).toLowerCase();
    var m = {
      en: 'Connected on Mainnet. Switch Freighter to Testnet - this app works on Stellar Testnet only.',
      ru: '\u0412\u044b \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u043b\u0438\u0441\u044c \u043a Mainnet. \u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u0435 Freighter \u043d\u0430 Testnet - \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u0442\u043e\u043b\u044c\u043a\u043e \u0432 Stellar Testnet.',
      uk: '\u0412\u0438 \u043f\u0456\u0434\u043a\u043b\u044e\u0447\u0438\u043b\u0438\u0441\u044f \u0434\u043e Mainnet. \u041f\u0435\u0440\u0435\u043c\u043a\u043d\u0456\u0442\u044c Freighter \u043d\u0430 Testnet - \u0437\u0430\u0441\u0442\u043e\u0441\u0443\u043d\u043e\u043a \u043f\u0440\u0430\u0446\u044e\u0454 \u043b\u0438\u0448\u0435 \u0432 Stellar Testnet.',
      es: 'Te conectaste a Mainnet. Cambia Freighter a Testnet: esta app solo funciona en Stellar Testnet.',
      de: 'Mit Mainnet verbunden. Stelle Freighter auf Testnet um - diese App nutzt nur das Stellar Testnet.'
    };
    return m[l] || m.en;
  }
  // Self-contained floating toast (the page modal closes right after connect, so a
  // modal banner would not survive). Used to flag a wrong-network connection.
  function warnWrongNetwork() {
    try {
      var d = document.createElement('div');
      d.textContent = warnLabel();
      d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:20px;z-index:100000;max-width:420px;margin:0 auto;background:#7c2d12;color:#fff;padding:14px 16px;border-radius:12px;font-size:14px;line-height:1.5;box-shadow:0 12px 40px rgba(0,0,0,.35)';
      document.body.appendChild(d);
      setTimeout(function () { try { d.parentNode.removeChild(d); } catch (_) {} }, 9000);
    } catch (_) {}
  }

  // Hide send.js's own pairing modal when the AppKit modal is used instead.
  function hideNativeModal() {
    try { var b = document.getElementById('wm-backdrop'); if (b) b.style.display = 'none'; } catch (_) {}
  }

  // Load the Reown AppKit modal and bind it to our UniversalProvider. AppKit
  // renders the QR + wallet list and opens Freighter through the exact deep link
  // from the WalletConnect registry (which our manual freighterwallet:// link
  // could not reliably reproduce). Best-effort: on any failure we leave
  // modal = null and fall back to the copy/paste URI flow.
  function loadModal(p) {
    return Promise.all([import(APPKIT_CDN), import(APPKIT_NET_CDN)]).then(function (m) {
      var mod = m[0] || {}, nets = m[1] || {};
      var createAppKit = mod.createAppKit || (mod.default && mod.default.createAppKit);
      var mainnet = nets.mainnet || (nets.default && nets.default.mainnet);
      if (typeof createAppKit !== 'function' || !mainnet) { modal = null; return null; }
      modal = createAppKit({
        projectId: PROJECT_ID,
        networks: [mainnet],
        universalProvider: p,
        manualWCControl: true,
        metadata: meta(),
        features: { analytics: false }
      });
      return modal;
    }).catch(function () { modal = null; return null; });
  }

  // Lazily load and initialize the WalletConnect UniversalProvider.
  function ensure() {
    if (provider) return Promise.resolve(provider);
    if (initing) return initing;
    initing = import(UP_CDN).then(function (mod) {
      var UP = mod.UniversalProvider || (mod.default && mod.default.UniversalProvider) || mod.default;
      return UP.init({ projectId: PROJECT_ID, metadata: meta() });
    }).then(function (p) {
      provider = p;
      // The relay emits the pairing URI here. Always feed it to send.js (uriCb).
      p.on('display_uri', function (uri) {
        if (typeof uriCb === 'function') { try { uriCb(uri); } catch (_) {} }
        // When AppKit is active it renders the QR + wallet list and opens
        // Freighter via its registry deep link, so we must NOT navigate away
        // ourselves (that races AppKit / lands on the wrong app). The block
        // below is only the no-AppKit fallback.
        if (modal) return;
        var dl = freighterLink(uri);
        try {
          var openBtn = document.getElementById('wm-open');
          if (openBtn) openBtn.onclick = function () { try { window.location.href = dl; } catch (_) {} };
        } catch (_) {}
        injectCopyButton(uri);
        if (isMobile()) { try { window.location.href = dl; } catch (_) {} }
      });
      if (p.session) { session = p.session; address = addrOf(session); connectedChain = chainOf(session); }
      return loadModal(p).then(function () { return p; });
    });
    return initing;
  }

  window.SPWC = {
    // send.js gate: WC() uses this object when ready() is truthy. Always use
    // WalletConnect on mobile, INCLUDING inside Freighter's Discover browser:
    // Discover only injects a detection marker (window.stellar), not a signing
    // API, so the WC pairing deep link -- which Discover intercepts and routes to
    // its native WalletKit -- is the only path that actually connects. Desktop is
    // gated by `mob` in send.js, so this does not change desktop behavior.
    ready: function () { return true; },
    getPublicKey: function () { return address; },
    // The CAIP-2 chain the wallet connected on (e.g. 'stellar:testnet'). null until connected.
    network: function () { return connectedChain; },

    // Build Freighter's deep link from a WC pairing URI (exposed for the page modal).
    deepLink: function (uri) { return freighterLink(uri); },

    // onUri (optional): send.js passes its internal setWCUri so the modal can show
    // the "Open in Freighter" deep link + QR. Returns the connected G... address.
    connect: function (onUri) {
      uriCb = onUri || null;
      return ensure().then(function (p) {
        if (address) return address;
        // Prefer the official AppKit modal (correct Freighter deep link). If it
        // failed to load, hideNativeModal is a no-op and send.js's modal + the
        // copy-URI fallback remain on screen.
        if (modal) { hideNativeModal(); try { modal.open(); } catch (_) {} }
        // Request BOTH Stellar networks as OPTIONAL namespaces. Freighter rejects a
        // connection outright when the dApp's REQUIRED chain differs from the wallet's
        // active network (see approveSessionProposal: it returns a "wrong network"
        // error if the active chain is not in the proposal). Asking for a single
        // required testnet chain therefore fails whenever the user's Freighter is on
        // Mainnet. Optional namespaces let the wallet approve on whichever network it
        // is on; we then detect it and warn if it is not Testnet (this app is testnet-only).
        return p.connect({
          optionalNamespaces: { stellar: { chains: [CHAIN_PUBNET, CHAIN_TESTNET], methods: METHODS, events: [] } }
        }).then(function (sess) {
          try { if (modal) modal.close(); } catch (_) {}
          session = sess; address = addrOf(sess); connectedChain = chainOf(sess);
          if (connectedChain && connectedChain !== CHAIN_TESTNET) { warnWrongNetwork(); }
          return address;
        }, function (err) {
          try { if (modal) modal.close(); } catch (_) {}
          throw err;
        });
      });
    },

    // Ask Freighter Mobile to sign an XDR; returns the signed XDR string.
    signXDR: function (xdr) {
      return ensure().then(function (p) {
        return p.request({ chainId: CHAIN, request: { method: 'stellar_signXDR', params: { xdr: xdr } } }, CHAIN);
      }).then(function (res) { return (res && (res.signedXDR || res.signedXdr)) || res || xdr; });
    },

    // Sign and submit in one step (alternative path).
    signAndSubmitXDR: function (xdr) {
      return ensure().then(function (p) {
        return p.request({ chainId: CHAIN, request: { method: 'stellar_signAndSubmitXDR', params: { xdr: xdr } } }, CHAIN);
      });
    },

    disconnect: function () {
      address = null; session = null; uriCb = null; connectedChain = null;
      if (!provider) return Promise.resolve();
      return Promise.resolve().then(function () { if (provider.session) return provider.disconnect(); }).catch(function () {});
    }
  };
})();

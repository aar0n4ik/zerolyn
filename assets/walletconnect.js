/* Zerolyn - assets/walletconnect.js
   window.SPWC: connect Freighter Mobile from a phone via WalletConnect v2 / Reown.

   Implemented per the OFFICIAL Freighter docs (https://docs.freighter.app,
   section "Mobile / WalletConnect"):
     1. provider = UniversalProvider.init({ projectId, metadata })
     2. modal    = createAppKit({ projectId, networks:[mainnet],
                     universalProvider: provider, manualWCControl: true,
                     includeWalletIds:[FREIGHTER], featuredWalletIds:[FREIGHTER],
                     allWallets:'HIDE' })
     3. modal.open()
     4. session  = await provider.connect({ namespaces: { stellar: {...} } })
     5. modal.close()

   The modal is locked to FREIGHTER ONLY: includeWalletIds limits the registry to
   Freighter, allWallets:'HIDE' removes the "All Wallets" button, and
   featuredWalletIds keeps Freighter in the featured row (required together with
   includeWalletIds, per reown-com/appkit#3128). On mobile this renders a single
   tappable Freighter button that DEEP-LINKS straight into the Freighter app
   (in an external browser it shows a QR to scan with the phone).

   To avoid the ~5s delay before the sheet appears, we pre-warm BOTH the provider
   and the AppKit modal as soon as the page loads on mobile, so the first tap on
   Connect opens the modal instantly.

   Desktop is gated out in send.js (it uses the Freighter extension), so nothing
   here affects desktop behavior. This dapp runs on Stellar TESTNET.
*/
(function () {
  'use strict';

  var PROJECT_ID = '8270edd9a0e826b51a7729bac80a21ff';
  var CHAIN_TESTNET = 'stellar:testnet';
  var CHAIN_PUBNET  = 'stellar:pubnet';
  var CHAIN = CHAIN_TESTNET;                 // this dapp signs/submits on Testnet
  // Only the methods this dapp actually calls. Freighter Mobile supports all
  // four; requesting the minimal set keeps the approval prompt simple.
  var METHODS = ['stellar_signXDR', 'stellar_signAndSubmitXDR'];
  var UP_CDN  = 'https://esm.sh/@walletconnect/universal-provider@2.17.2';
  var APPKIT_CDN = 'https://esm.sh/@reown/appkit@1/core';
  var APPKIT_NET_CDN = 'https://esm.sh/@reown/appkit@1/networks';
  // Freighter's public WalletConnect Explorer (WalletGuide) id -- used to lock
  // the modal to Freighter only (docs: "Featuring Freighter").
  var FREIGHTER_WALLET_ID = '997a355c8f682468706a76cff1b004a7115f505fb962dac54b6e9b442dd1c380';
  var FREIGHTER_SCHEME = 'freighterwallet';

  var provider = null, modal = null, session = null, address = null;
  var initing = null, modaling = null, uriCb = null, connectedChain = null;

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
  // Use the language the user selected on the site (app.js stores 'sp_lang').
  function siteLang() {
    var l = '';
    try { l = localStorage.getItem('sp_lang') || ''; } catch (_) {}
    if (!l) { try { l = (document.documentElement && document.documentElement.lang) || ''; } catch (_) {} }
    if (!l) { l = navigator.language || 'en'; }
    return l.slice(0, 2).toLowerCase();
  }
  function freighterLink(uri) { return FREIGHTER_SCHEME + '://wc?uri=' + encodeURIComponent(uri); }

  // Accounts come back as "stellar:testnet:G..." -- split on ':' for the key.
  function addrOf(sess) {
    try { return sess.namespaces.stellar.accounts[0].split(':')[2]; } catch (_) { return null; }
  }
  function chainOf(sess) {
    try { var a = sess.namespaces.stellar.accounts[0].split(':'); return a[0] + ':' + a[1]; } catch (_) { return null; }
  }
  function warnLabel() {
    var l = siteLang();
    var m = {
      en: 'Connected on Mainnet. Switch Freighter to Testnet - this app works on Stellar Testnet only.',
      ru: '\u0412\u044b \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u043b\u0438\u0441\u044c \u043a Mainnet. \u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u0435 Freighter \u043d\u0430 Testnet - \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u0442\u043e\u043b\u044c\u043a\u043e \u0432 Stellar Testnet.',
      uk: '\u0412\u0438 \u043f\u0456\u0434\u043a\u043b\u044e\u0447\u0438\u043b\u0438\u0441\u044f \u0434\u043e Mainnet. \u041f\u0435\u0440\u0435\u043c\u043a\u043d\u0456\u0442\u044c Freighter \u043d\u0430 Testnet - \u0437\u0430\u0441\u0442\u043e\u0441\u0443\u043d\u043e\u043a \u043f\u0440\u0430\u0446\u044e\u0454 \u043b\u0438\u0448\u0435 \u0432 Stellar Testnet.',
      es: 'Te conectaste a Mainnet. Cambia Freighter a Testnet: esta app solo funciona en Stellar Testnet.',
      de: 'Mit Mainnet verbunden. Stelle Freighter auf Testnet um - diese App nutzt nur das Stellar Testnet.'
    };
    return m[l] || m.en;
  }
  function warnWrongNetwork() {
    try {
      var d = document.createElement('div');
      d.textContent = warnLabel();
      d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:20px;z-index:100000;max-width:420px;margin:0 auto;background:#7c2d12;color:#fff;padding:14px 16px;border-radius:12px;font-size:14px;line-height:1.5;box-shadow:0 12px 40px rgba(0,0,0,.35)';
      document.body.appendChild(d);
      setTimeout(function () { try { d.parentNode.removeChild(d); } catch (_) {} }, 9000);
    } catch (_) {}
  }

  // send.js shows its own "connecting" sheet (#wm-backdrop) right before calling
  // SPWC.connect(). Hide it so it does not sit on top of / fight with the AppKit
  // modal, which is the real interactive UI that deep-links into Freighter.
  function hideNativeModal() {
    try { var b = document.getElementById('wm-backdrop'); if (b) b.style.display = 'none'; } catch (_) {}
  }

  // Step 1: lazily load + init the WalletConnect UniversalProvider.
  function ensure() {
    if (provider) return Promise.resolve(provider);
    if (initing) return initing;
    initing = import(UP_CDN).then(function (mod) {
      var UP = mod.UniversalProvider || (mod.default && mod.default.UniversalProvider) || mod.default;
      return UP.init({ projectId: PROJECT_ID, metadata: meta() });
    }).then(function (p) {
      provider = p;
      // AppKit (loaded via universalProvider) listens for display_uri itself and
      // renders the QR / wallet list. We also forward the uri to send.js's
      // optional callback as a harmless backup.
      p.on('display_uri', function (uri) {
        if (typeof uriCb === 'function') { try { uriCb(uri); } catch (_) {} }
      });
      p.on('session_delete', function () { address = null; session = null; connectedChain = null; });
      if (p.session) { session = p.session; address = addrOf(session); connectedChain = chainOf(session); }
      return p;
    });
    initing.catch(function () { initing = null; });
    return initing;
  }

  // Step 2: lazily load Reown AppKit and create the modal locked to Freighter.
  // Stellar is not a built-in AppKit network, so we pass a placeholder network;
  // manualWCControl:true means the modal never uses it for chain switching.
  //   includeWalletIds   -> only Freighter is offered
  //   allWallets:'HIDE'  -> no "All Wallets" button
  //   featuredWalletIds  -> Freighter pinned in the featured row (must accompany
  //                         includeWalletIds, per reown-com/appkit#3128)
  function loadModal(p) {
    if (modal) return Promise.resolve(modal);
    if (modaling) return modaling;
    modaling = Promise.all([import(APPKIT_CDN), import(APPKIT_NET_CDN)]).then(function (mods) {
      var core = mods[0] || {};
      var nets = mods[1] || {};
      var createAppKit = core.createAppKit || (core.default && core.default.createAppKit) || core.default;
      var mainnet = nets.mainnet || (nets.default && nets.default.mainnet) || nets.default;
      modal = createAppKit({
        projectId: PROJECT_ID,
        networks: [mainnet],
        universalProvider: p,
        manualWCControl: true,
        allWallets: 'HIDE',
        includeWalletIds: [FREIGHTER_WALLET_ID],
        featuredWalletIds: [FREIGHTER_WALLET_ID]
      });
      return modal;
    });
    modaling.catch(function () { modaling = null; });
    return modaling;
  }

  function isUserReject(err) {
    var m = '';
    try { m = ((err && (err.message || err.reason || err.code)) || err || '') + ''; } catch (_) {}
    return /reject|declin|cancel|denied|disapprov|\buser\b/i.test(m);
  }

  // Step 3+4: pair and await the session. We request BOTH Stellar networks so
  // Freighter can approve on whichever it is on, then warn if it is not Testnet.
  // One silent retry on a transient (non-user-reject) first-tap failure.
  function pairLoop(p, tries) {
    return p.connect({
      namespaces: {
        stellar: { methods: METHODS, chains: [CHAIN_TESTNET, CHAIN_PUBNET], events: ['accountsChanged'] }
      }
    }).then(function (sess) {
      try { if (modal) modal.close(); } catch (_) {}
      session = sess; address = addrOf(sess); connectedChain = chainOf(sess);
      if (connectedChain && connectedChain !== CHAIN_TESTNET) { warnWrongNetwork(); }
      return address;
    }, function (err) {
      if (tries > 1 && !isUserReject(err)) {
        return new Promise(function (r) { setTimeout(r, 900); }).then(function () { return pairLoop(p, tries - 1); });
      }
      try { if (modal) modal.close(); } catch (_) {}
      throw err;
    });
  }

  // ---- Signing: bring Freighter to the foreground on mobile ----
  function walletRedirect() {
    try {
      var r = session && session.peer && session.peer.metadata && session.peer.metadata.redirect;
      if (r && (r.native || r.universal)) return r.native || r.universal;
    } catch (_) {}
    return FREIGHTER_SCHEME + '://';
  }
  function signPromptLabels() {
    var l = siteLang();
    var T = {
      en: { t: 'Confirm in Freighter', b: 'Sign request sent. Open Freighter, approve the payment, then come back here.', o: 'Open Freighter' },
      ru: { t: '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0432 Freighter', b: '\u0417\u0430\u043f\u0440\u043e\u0441 \u043d\u0430 \u043f\u043e\u0434\u043f\u0438\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d. \u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 Freighter, \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043e\u043f\u043b\u0430\u0442\u0443 \u0438 \u0432\u0435\u0440\u043d\u0438\u0442\u0435\u0441\u044c \u0441\u044e\u0434\u0430.', o: '\u041e\u0442\u043a\u0440\u044b\u0442\u044c Freighter' },
      uk: { t: '\u041f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0456\u0442\u044c \u0443 Freighter', b: '\u0417\u0430\u043f\u0438\u0442 \u043d\u0430 \u043f\u0456\u0434\u043f\u0438\u0441 \u043d\u0430\u0434\u0456\u0441\u043b\u0430\u043d\u043e. \u0412\u0456\u0434\u043a\u0440\u0438\u0439\u0442\u0435 Freighter, \u043f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0456\u0442\u044c \u043e\u043f\u043b\u0430\u0442\u0443 \u0456 \u043f\u043e\u0432\u0435\u0440\u043d\u0456\u0442\u044c\u0441\u044f \u0441\u044e\u0434\u0438.', o: '\u0412\u0456\u0434\u043a\u0440\u0438\u0442\u0438 Freighter' },
      es: { t: 'Confirma en Freighter', b: 'Solicitud de firma enviada. Abre Freighter, aprueba el pago y vuelve aqu\u00ed.', o: 'Abrir Freighter' },
      de: { t: 'In Freighter best\u00e4tigen', b: 'Signaturanfrage gesendet. \u00d6ffne Freighter, best\u00e4tige die Zahlung und komm dann hierher zur\u00fcck.', o: 'Freighter \u00f6ffnen' }
    };
    return T[l] || T.en;
  }
  function hideSignPrompt() {
    var b = document.getElementById('wc-sign-backdrop');
    if (b && b.parentNode) b.parentNode.removeChild(b);
  }
  function showSignPrompt() {
    hideSignPrompt();
    var L = signPromptLabels();
    var link = walletRedirect();
    if (!document.getElementById('wc-sign-style')) {
      var st = document.createElement('style'); st.id = 'wc-sign-style';
      st.textContent = '@keyframes wcspin{to{transform:rotate(360deg)}}';
      document.head.appendChild(st);
    }
    var bd = document.createElement('div');
    bd.id = 'wc-sign-backdrop';
    bd.style.cssText = 'position:fixed;inset:0;z-index:100001;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(16,24,40,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font-family:inherit';
    var card = document.createElement('div');
    card.style.cssText = 'width:100%;max-width:360px;background:#fff;border-radius:20px;padding:26px 22px;text-align:center;box-shadow:0 30px 80px -20px rgba(16,24,40,.5)';
    card.innerHTML = '<div style="width:46px;height:46px;margin:0 auto 14px;border-radius:50%;border:3px solid rgba(29,78,216,.18);border-top-color:#1d4ed8;animation:wcspin .8s linear infinite"></div>' +
      '<h3 style="margin:0 0 8px;font-size:18px;color:#1a1d23;font-weight:700">' + L.t + '</h3>' +
      '<div style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#4a5160">' + L.b + '</div>' +
      '<a id="wc-sign-open" href="' + link + '" style="display:flex;align-items:center;justify-content:center;width:100%;padding:12px 16px;border-radius:12px;background:linear-gradient(160deg,#2f7bff,#1d4ed8);color:#fff;font-size:15px;font-weight:600;text-decoration:none;box-sizing:border-box">' + L.o + '</a>';
    bd.appendChild(card); document.body.appendChild(bd);
  }
  // provider.request signature is request({ method, params }, chainId) per docs.
  function requestWithPrompt(p, method, xdr) {
    var req = p.request({ method: method, params: { xdr: xdr } }, CHAIN);
    if (isMobile()) {
      showSignPrompt();
      setTimeout(function () { try { window.location.href = walletRedirect(); } catch (_) {} }, 700);
    }
    return req.then(function (res) { hideSignPrompt(); return res; }, function (e) { hideSignPrompt(); throw e; });
  }

  window.SPWC = {
    // Always use WalletConnect on mobile (desktop is gated out in send.js).
    ready: function () { return true; },
    getPublicKey: function () { return address; },
    network: function () { return connectedChain; },
    deepLink: function (uri) { return freighterLink(uri); },

    // onUri (optional): send.js passes setWCUri. Returns the connected G... key.
    connect: function (onUri) {
      uriCb = onUri || null;
      // Don't let send.js's own sheet cover the AppKit modal.
      hideNativeModal();
      return ensure().then(function (p) {
        if (address) return address;
        return loadModal(p).then(function () {
          // Official flow: open the modal first, then start pairing. The modal
          // is locked to Freighter; tapping it deep-links into the Freighter app
          // (or shows a QR in an external browser).
          try { if (modal) modal.open(); } catch (_) {}
          return pairLoop(p, 2);
        });
      });
    },

    signXDR: function (xdr) {
      return ensure().then(function (p) {
        return requestWithPrompt(p, 'stellar_signXDR', xdr);
      }).then(function (res) { return (res && (res.signedXDR || res.signedXdr)) || res || xdr; });
    },

    signAndSubmitXDR: function (xdr) {
      return ensure().then(function (p) {
        return requestWithPrompt(p, 'stellar_signAndSubmitXDR', xdr);
      });
    },

    disconnect: function () {
      address = null; session = null; uriCb = null; connectedChain = null;
      if (!provider) return Promise.resolve();
      return Promise.resolve().then(function () { if (provider.session) return provider.disconnect(); }).catch(function () {});
    }
  };

  // Pre-warm the provider AND the AppKit modal on mobile as soon as the page
  // loads, so the first "Connect" tap opens the modal instantly instead of
  // waiting ~5s for these bundles to download.
  if (isMobile()) {
    try { ensure().then(function (p) { return loadModal(p); }).catch(function () {}); } catch (_) {}
  }
})();

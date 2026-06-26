/* Zerolyn - assets/walletconnect.js
   Defines window.SPWC: Freighter Mobile connection via WalletConnect v2 / Reown.
   On phones it auto-opens the Freighter app (deep link) so the user can link this
   page in one tap (like Trust Wallet); on desktop/other devices the existing modal
   shows the pairing URI as a QR code.

   This is the piece send.js already expects: WC() returns this object when
   window.SPWC.ready() is truthy, then Wallet.connect() drives it and feeds the
   pairing URI to setWCUri(). Without this file the phone flow falls back to the
   "copy page link" modal.

   Project ID: created at https://dashboard.reown.com (Reown / WalletConnect Cloud).
*/
(function () {
  'use strict';

  var PROJECT_ID = '8270edd9a0e826b51a7729bac80a21ff';
  var NETWORK = 'testnet';                 // 'testnet' | 'pubnet'
  var CHAIN   = 'stellar:' + NETWORK;      // CAIP-2 chain id
  var METHODS = ['stellar_signXDR', 'stellar_signAndSubmitXDR'];
  var UP_CDN  = 'https://esm.sh/@walletconnect/universal-provider@2.17.2';

  var provider = null, session = null, address = null, initing = null, uriCb = null;

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
  // scheme "freighterwallet" on both iOS and Android. Wrapping the WalletConnect
  // pairing URI in Freighter's own deep link opens Freighter specifically, instead
  // of letting the OS route the bare wc: URI to its default handler (Trust Wallet).
  var FREIGHTER_SCHEME = 'freighterwallet';
  function freighterLink(uri) { return FREIGHTER_SCHEME + '://wc?uri=' + encodeURIComponent(uri); }

  // Localized label for the same-device fallback (copy the raw wc: URI and paste it
  // into Freighter's "Paste a WalletConnect URI" screen). Used when the auto-open
  // deep link launches Freighter but no pairing prompt shows.
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

  // Lazily load and initialize the WalletConnect UniversalProvider.
  function ensure() {
    if (provider) return Promise.resolve(provider);
    if (initing) return initing;
    initing = import(UP_CDN).then(function (mod) {
      var UP = mod.UniversalProvider || (mod.default && mod.default.UniversalProvider) || mod.default;
      return UP.init({ projectId: PROJECT_ID, metadata: meta() });
    }).then(function (p) {
      provider = p;
      // The relay emits the pairing URI here. Feed it to the page modal and,
      // on phones, navigate to it so the OS opens Freighter automatically.
      p.on('display_uri', function (uri) {
        if (typeof uriCb === 'function') { try { uriCb(uri); } catch (_) {} }
        var dl = freighterLink(uri);
        // Force the modal's "Open in Freighter" button to use Freighter's deep link
        // (setWCUri set it to the bare wc: URI, which phones hand to Trust Wallet).
        try {
          var openBtn = document.getElementById('wm-open');
          if (openBtn) openBtn.onclick = function () { try { window.location.href = dl; } catch (_) {} };
        } catch (_) {}
        // Same-device fallback: if Freighter opens without a pairing prompt, the user
        // can copy the raw wc: URI and paste it into Freighter's "Paste a WC URI" screen.
        injectCopyButton(uri);
        // On phones, auto-open Freighter via its deep link (not the bare wc: URI).
        if (isMobile()) { try { window.location.href = dl; } catch (_) {} }
      });
      if (p.session) { session = p.session; address = addrOf(session); }
      return p;
    });
    return initing;
  }

  window.SPWC = {
    // send.js gate: WC() uses this object when ready() is truthy.
    ready: function () { return true; },
    getPublicKey: function () { return address; },

    // Build Freighter's deep link from a WC pairing URI (exposed for the page modal).
    deepLink: function (uri) { return freighterLink(uri); },

    // onUri (optional): send.js passes its internal setWCUri so the modal can show
    // the "Open in Freighter" deep link + QR. Returns the connected G... address.
    connect: function (onUri) {
      uriCb = onUri || null;
      return ensure().then(function (p) {
        if (address) return address;
        return p.connect({
          namespaces: { stellar: { chains: [CHAIN], methods: METHODS, events: [] } }
        }).then(function (sess) { session = sess; address = addrOf(sess); return address; });
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
      address = null; session = null; uriCb = null;
      if (!provider) return Promise.resolve();
      return Promise.resolve().then(function () { if (provider.session) return provider.disconnect(); }).catch(function () {});
    }
  };
})();

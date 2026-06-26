/* Zerolyn — assets/walletconnect.js
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
        if (isMobile()) { try { window.location.href = uri; } catch (_) {} }
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

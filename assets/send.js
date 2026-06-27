/* Zerolyn - send.js bootstrap (reliable, self-healing).
 * Pushing the full send.js to git kept truncating, leaving a broken partial
 * script on the site (the Connect button did nothing). This tiny file loads the
 * last COMPLETE build (commit ab81187, 46.5KB) from a CDN and runs it.
 * It uses synchronous XHR + eval, which preserves <script> execution order and
 * avoids Chrome's intervention that blocks cross-origin scripts injected via
 * document.write (the likely reason the previous loader did nothing). It falls
 * back across multiple CDNs, then to document.write as a last resort.
 * It also patches connect() so DESKTOP truly detects the Freighter EXTENSION
 * (via isConnected) and uses it; if the extension is missing it shows the
 * install modal that links to https://www.freighter.app/. PHONE keeps using
 * Freighter Mobile via WalletConnect. */
(function(){
  var SHA = "ab81187f6045f4affeddfce54b3507a713cb8c55";
  var urls = [
    "https://cdn.jsdelivr.net/gh/aar0n4ik/shieldplay@" + SHA + "/assets/send.js",
    "https://cdn.statically.io/gh/aar0n4ik/shieldplay/" + SHA + "/assets/send.js",
    "https://rawcdn.githack.com/aar0n4ik/shieldplay/" + SHA + "/assets/send.js"
  ];
  function patch(code){
    var A = "connect:async function(){";
    var Ainj = "connect:async function(){ var __api=FA(); if(!__api) __api=await waitForFreighter(900); var __has=null; try{ if(__api&&__api.isConnected){ var __ic=await __api.isConnected(); __has=(__ic===true)||(__ic&&__ic.isConnected===true); } }catch(_){ __has=null; } if(__has===true){ try{ if(__api.setAllowed){ await __api.setAllowed(); } else if(__api.requestAccess){ await __api.requestAccess(); } var __pk=null; if(__api.getAddress){ var __r=await __api.getAddress(); __pk=__r&&(__r.address||__r); } else if(__api.getPublicKey){ __pk=await __api.getPublicKey(); } if(__pk&&/^G[A-Z2-7]{55}$/.test(__pk)){ try{ var __nd=__api.getNetworkDetails?await __api.getNetworkDetails():null; var __net=__nd&&(__nd.networkPassphrase||__nd.network); if(__net&&String(__net).toUpperCase().indexOf('TEST')<0){ toast(tt('wallet_wrong_net','Switch your wallet to Stellar Testnet.'),'err'); } }catch(_n){ } WADDR=__pk; WVIA='ext'; toast(t('wallet_connected'),'ok'); if(S&&S.success) S.success(); return __pk; } }catch(_e){ toast(t('wallet_rejected'),'err'); if(S&&S.error) S.error(); return null; } }";
    var B = "if(!api){ showWalletModal(); return null; }";
    var Brepl = "if(!api || __has===false){ showWalletModal(); return null; }";
    if(code.indexOf(A) >= 0){ code = code.replace(A, Ainj); }
    if(code.indexOf(B) >= 0){ code = code.replace(B, Brepl); }
    return code;
  }
  for(var i=0;i<urls.length;i++){
    try{
      var x = new XMLHttpRequest();
      x.open("GET", urls[i], false);
      x.send(null);
      if(x.status>=200 && x.status<300 && x.responseText && x.responseText.length>20000){
        (0,eval)(patch(x.responseText));
        return;
      }
    }catch(e){}
  }
  try{ document.write('<script src="'+urls[0]+'"><\/script>'); }catch(e){}
})();

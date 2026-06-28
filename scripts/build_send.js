const fs = require("fs");
const SRC = "/tmp/send_full.js";
const OUT = "assets/send.js";

const A = "connect:async function(){";
const Ainj = "connect:async function(){ if(!isMobileDevice()){ var __api=FA(); if(!__api) __api=await waitForFreighter(900); var __has=null; if(__api&&__api.isConnected){ try{ var __ic=await Promise.race([Promise.resolve(__api.isConnected()), new Promise(function(rs){ setTimeout(function(){ rs({isConnected:false}); },1500); })]); __has=(__ic===true)||(__ic&&__ic.isConnected===true); }catch(_){ __has=null; } } if(__has===true){ try{ if(__api.setAllowed){ await __api.setAllowed(); } else if(__api.requestAccess){ await __api.requestAccess(); } var __pk=null; if(__api.getAddress){ var __r=await __api.getAddress(); __pk=__r&&(__r.address||__r); } else if(__api.getPublicKey){ __pk=await __api.getPublicKey(); } if(__pk&&/^G[A-Z2-7]{55}$/.test(__pk)){ try{ var __nd=__api.getNetworkDetails?await __api.getNetworkDetails():null; var __net=__nd&&(__nd.networkPassphrase||__nd.network); if(__net&&String(__net).toUpperCase().indexOf('TEST')<0){ toast(tt('wallet_wrong_net','Switch your wallet to Stellar Testnet.'),'err'); } }catch(_n){ } WADDR=__pk; WVIA='ext'; toast(t('wallet_connected'),'ok'); if(S&&S.success) S.success(); return __pk; } }catch(_e){ toast(t('wallet_rejected'),'err'); if(S&&S.error) S.error(); return null; } } if(__has===false){ showWalletModal(); return null; } }";
const B = "if(!api){ showWalletModal(); return null; }";
const Brepl = "if(!api || __has===false || (isMobileDevice() && !WC())){ showWalletModal(); return null; }";

let code = fs.readFileSync(SRC, "utf8");
if (code.length < 20000) { console.error("ERROR: source too short:", code.length); process.exit(1); }
if (code.indexOf(A) < 0) { console.error("ERROR: anchor A not found"); process.exit(1); }
if (code.indexOf(B) < 0) { console.error("ERROR: anchor B not found"); process.exit(1); }
code = code.replace(A, Ainj);
code = code.replace(B, Brepl);

const header = "/* Zerolyn - send.js (full self-contained build; connect() patches baked in; no runtime CDN/eval). Source: pinned commit ab81187. */\n";
fs.writeFileSync(OUT, header + code);

console.log("OK wrote", OUT, "bytes:", (header + code).length);
console.log("desktop patch present:", code.indexOf("waitForFreighter(900)") >= 0);
console.log("modal  patch present :", code.indexOf("isMobileDevice() && !WC()") >= 0);
console.log("no eval bootstrap    :", code.indexOf("(0,eval)") < 0);

/* Zerolyn — send page: REAL Stellar Testnet payments (Freighter + Albedo sign + Horizon submit) */
(function(){
'use strict';
var t=window.SP_t, V=window.SP_validate, QR=window.SP_QR,
    S=window.SP_Sound, toast=window.SP_toast, CFG=window.SP_CONFIG, shorten=window.SP_shorten;
var SV=window.SP_validate;
var $=function(id){return document.getElementById(id);};
function tt(k,f){ var v=t(k); return (v&&v!==k)?v:f; }

/* ---------- honest, multi-language copy (overrides simulated wording) ---------- */
(function(){
  function M(l,o){ if(!window.I18N) return; window.I18N[l]=Object.assign(window.I18N[l]||{},o); }
  M('en',{
    send_h:'Send a real Stellar payment',
    send_lead:'A real payment on Stellar Testnet, signed in your wallet and submitted on-chain. You get a real transaction hash you can verify on Stellar Expert.',
    send_btn:'Sign and send payment',send_btn_busy:'Submitting…',
    stepv_w:'Validate and prepare',stepv_wd:'address, balance and trustline',
    stepv_p:'Build transaction',stepv_pd:'Stellar payment operation',
    stepv_c:'Sign in wallet',stepv_cd:'you approve in your wallet',
    stepv_s:'Submit to Stellar',stepv_sd:'broadcast via Horizon',
    send_done:'Payment confirmed on Stellar Testnet',send_fail:'Payment failed',
    send_rcpt_status_v:'Confirmed on Stellar Testnet',send_rcpt_proof:'Memo',
    send_need_wallet:'Connect a wallet first.',send_need_valid:'Enter a valid recipient address.',send_need_amount:'Enter an amount greater than zero.',
    wallet_no_freighter:'Freighter not found. Install it from freighter.app.',wallet_wrong_net:'Switch Freighter to Stellar Testnet.',wallet_rejected:'Connection cancelled.',
    send_no_balance:'Not enough {a} balance for this amount.',send_sender_no_trust:'You have no {a} trustline yet.',
    send_dest_missing:'Recipient account is not funded on Testnet.',send_dest_no_trust:'Recipient has no {a} trustline.',
    send_signed_rejected:'Signature was declined in your wallet.',bal_label:'Balance',
    send_disc_lead:'Per-transaction view keys for auditors ship with the shielded pool. A public Testnet payment is transparent by design.',
    send_disc_btn:'How disclosure will work',send_disc_note:'Roadmap: selective disclosure applies to shielded transfers, not public payments.',
    sdk_missing:'Payment library failed to load. Refresh the page.',
    wallet_connect:'Connect wallet',wallet_choose:'Connect a wallet',
    wallet_freighter:'Freighter — browser extension (PC)',wallet_albedo:'Albedo — web wallet (works on phone)',
    wallet_install_freighter:'Install Freighter (PC)',wallet_albedo_missing:'Could not open Albedo. Check your connection and pop-up settings.',
    addr_bad_len:'A Stellar address is 56 characters — you entered {n}. Re-copy the full address.',
    addr_bad_checksum:'Address checksum failed — re-copy the full address.',
    addr_bad_charset:'Invalid characters — a Stellar address uses only A–Z and 2–7.',
    addr_bad_type:'That is not a public address — it must start with G.'
  });
  M('es',{
    send_h:'Envía un pago real en Stellar',
    send_lead:'Un pago real en la Testnet de Stellar, firmado en tu billetera y enviado on-chain. Obtienes un hash de transacción real para verificar en Stellar Expert.',
    send_btn:'Firmar y enviar pago',send_btn_busy:'Enviando…',
    stepv_w:'Validar y preparar',stepv_wd:'dirección, saldo y línea de confianza',
    stepv_p:'Construir transacción',stepv_pd:'operación de pago Stellar',
    stepv_c:'Firmar en la billetera',stepv_cd:'apruebas en tu monedero',
    stepv_s:'Enviar a Stellar',stepv_sd:'difundir vía Horizon',
    send_done:'Pago confirmado en la Testnet de Stellar',send_fail:'El pago falló',
    send_rcpt_status_v:'Confirmado en la Testnet de Stellar',send_rcpt_proof:'Memo',
    send_need_wallet:'Conecta una billetera primero.',send_need_valid:'Introduce una dirección de destinatario válida.',send_need_amount:'Introduce un importe mayor que cero.',
    wallet_no_freighter:'Freighter no encontrado. Instálalo desde freighter.app.',wallet_wrong_net:'Cambia Freighter a la Testnet de Stellar.',wallet_rejected:'Conexión cancelada.',
    send_no_balance:'Saldo de {a} insuficiente para este importe.',send_sender_no_trust:'Aún no tienes línea de confianza de {a}.',
    send_dest_missing:'La cuenta del destinatario no está financiada en la Testnet.',send_dest_no_trust:'El destinatario no tiene línea de confianza de {a}.',
    send_signed_rejected:'La firma fue rechazada en tu billetera.',bal_label:'Saldo',
    send_disc_lead:'Las claves de visualización por transacción para auditores llegan con el pool privado. Un pago público en Testnet es transparente por diseño.',
    send_disc_btn:'Cómo funcionará la divulgación',send_disc_note:'Hoja de ruta: la divulgación selectiva aplica a transferencias privadas, no a pagos públicos.',
    sdk_missing:'La librería de pagos no se cargó. Recarga la página.',
    wallet_connect:'Conectar billetera',wallet_choose:'Conecta una billetera',
    wallet_freighter:'Freighter — extensión de navegador (PC)',wallet_albedo:'Albedo — billetera web (funciona en el móvil)',
    wallet_install_freighter:'Instalar Freighter (PC)',wallet_albedo_missing:'No se pudo abrir Albedo. Revisa tu conexión y los pop-ups.',
    addr_bad_len:'Una dirección Stellar tiene 56 caracteres — escribiste {n}. Vuelve a copiar la dirección completa.',
    addr_bad_checksum:'Suma de verificación fallida — vuelve a copiar la dirección completa.',
    addr_bad_charset:'Caracteres no válidos — una dirección Stellar solo usa A–Z y 2–7.',
    addr_bad_type:'Eso no es una dirección pública — debe empezar por G.'
  });
  M('de',{
    send_h:'Sende eine echte Stellar-Zahlung',
    send_lead:'Eine echte Zahlung im Stellar-Testnet, in deiner Wallet signiert und on-chain gesendet. Du erhältst einen echten Transaktions-Hash zur Prüfung auf Stellar Expert.',
    send_btn:'Zahlung signieren und senden',send_btn_busy:'Wird gesendet…',
    stepv_w:'Prüfen und vorbereiten',stepv_wd:'Adresse, Guthaben und Trustline',
    stepv_p:'Transaktion erstellen',stepv_pd:'Stellar-Zahlungsoperation',
    stepv_c:'In der Wallet signieren',stepv_cd:'du bestätigst im Wallet',
    stepv_s:'An Stellar senden',stepv_sd:'über Horizon übertragen',
    send_done:'Zahlung im Stellar-Testnet bestätigt',send_fail:'Zahlung fehlgeschlagen',
    send_rcpt_status_v:'Bestätigt im Stellar-Testnet',send_rcpt_proof:'Memo',
    send_need_wallet:'Verbinde zuerst eine Wallet.',send_need_valid:'Gib eine gültige Empfängeradresse ein.',send_need_amount:'Gib einen Betrag größer als null ein.',
    wallet_no_freighter:'Freighter nicht gefunden. Installiere es von freighter.app.',wallet_wrong_net:'Stelle Freighter auf das Stellar-Testnet um.',wallet_rejected:'Verbindung abgebrochen.',
    send_no_balance:'Nicht genug {a}-Guthaben für diesen Betrag.',send_sender_no_trust:'Du hast noch keine {a}-Trustline.',
    send_dest_missing:'Empfängerkonto ist im Testnet nicht finanziert.',send_dest_no_trust:'Empfänger hat keine {a}-Trustline.',
    send_signed_rejected:'Signatur in der Wallet abgelehnt.',bal_label:'Guthaben',
    send_disc_lead:'Transaktionsbezogene View-Keys für Prüfer kommen mit dem Shielded Pool. Eine öffentliche Testnet-Zahlung ist absichtlich transparent.',
    send_disc_btn:'So funktioniert die Offenlegung',send_disc_note:'Roadmap: selektive Offenlegung gilt für Shielded-Transfers, nicht für öffentliche Zahlungen.',
    sdk_missing:'Zahlungsbibliothek nicht geladen. Seite neu laden.',
    wallet_connect:'Wallet verbinden',wallet_choose:'Wallet verbinden',
    wallet_freighter:'Freighter — Browser-Erweiterung (PC)',wallet_albedo:'Albedo — Web-Wallet (funktioniert am Handy)',
    wallet_install_freighter:'Freighter installieren (PC)',wallet_albedo_missing:'Albedo konnte nicht geöffnet werden. Prüfe Verbindung und Pop-ups.',
    addr_bad_len:'Eine Stellar-Adresse hat 56 Zeichen — du hast {n} eingegeben. Kopiere die vollständige Adresse erneut.',
    addr_bad_checksum:'Prüfsumme fehlgeschlagen — kopiere die vollständige Adresse erneut.',
    addr_bad_charset:'Ungültige Zeichen — eine Stellar-Adresse nutzt nur A–Z und 2–7.',
    addr_bad_type:'Das ist keine öffentliche Adresse — sie muss mit G beginnen.'
  });
  M('ru',{
    send_h:'Отправьте реальный платёж в Stellar',
    send_lead:'Реальный платёж в Stellar Testnet: подписывается в кошельке и отправляется в сеть. Вы получаете настоящий хеш транзакции для проверки на Stellar Expert.',
    send_btn:'Подписать и отправить',send_btn_busy:'Отправка…',
    stepv_w:'Проверка и подготовка',stepv_wd:'адрес, баланс и trustline',
    stepv_p:'Сборка транзакции',stepv_pd:'платёжная операция Stellar',
    stepv_c:'Подпись в кошельке',stepv_cd:'вы подтверждаете в кошельке',
    stepv_s:'Отправка в Stellar',stepv_sd:'трансляция через Horizon',
    send_done:'Платёж подтверждён в Stellar Testnet',send_fail:'Платёж не прошёл',
    send_rcpt_status_v:'Подтверждено в Stellar Testnet',send_rcpt_proof:'Мемо',
    send_need_wallet:'Сначала подключите кошелёк.',send_need_valid:'Введите корректный адрес получателя.',send_need_amount:'Введите сумму больше нуля.',
    wallet_no_freighter:'Freighter не найден. Установите его на freighter.app.',wallet_wrong_net:'Переключите Freighter на Stellar Testnet.',wallet_rejected:'Подключение отменено.',
    send_no_balance:'Недостаточно баланса {a} для этой суммы.',send_sender_no_trust:'У вас ещё нет trustline для {a}.',
    send_dest_missing:'Аккаунт получателя не профинансирован в Testnet.',send_dest_no_trust:'У получателя нет trustline для {a}.',
    send_signed_rejected:'Подпись отклонена в кошельке.',bal_label:'Баланс',
    send_disc_lead:'Ключи просмотра по транзакциям для аудиторов появятся вместе с приватным пулом. Публичный платёж в Testnet прозрачен по своей природе.',
    send_disc_btn:'Как будет работать раскрытие',send_disc_note:'В планах: выборочное раскрытие касается приватных переводов, а не публичных платежей.',
    sdk_missing:'Библиотека платежей не загрузилась. Обновите страницу.',
    wallet_connect:'Подключить кошелёк',wallet_choose:'Подключите кошелёк',
    wallet_freighter:'Freighter — расширение браузера (ПК)',wallet_albedo:'Albedo — веб-кошелёк (работает с телефона)',
    wallet_install_freighter:'Установить Freighter (ПК)',wallet_albedo_missing:'Не удалось открыть Albedo. Проверьте соединение и блокировку всплывающих окон.',
    addr_bad_len:'Адрес Stellar состоит из 56 символов — вы ввели {n}. Скопируйте адрес целиком.',
    addr_bad_checksum:'Контрольная сумма не сошлась — скопируйте полный адрес заново.',
    addr_bad_charset:'Недопустимые символы — в адресе Stellar только A–Z и 2–7.',
    addr_bad_type:'Это не публичный адрес — он должен начинаться с G.'
  });
  M('uk',{
    send_h:'Надішліть реальний платіж у Stellar',
    send_lead:'Реальний платіж у Stellar Testnet: підписується у гаманці і надсилається в мережу. Ви отримуєте справжній хеш транзакції для перевірки на Stellar Expert.',
    send_btn:'Підписати і надіслати',send_btn_busy:'Надсилання…',
    stepv_w:'Перевірка і підготовка',stepv_wd:'адреса, баланс і trustline',
    stepv_p:'Складання транзакції',stepv_pd:'платіжна операція Stellar',
    stepv_c:'Підпис у гаманці',stepv_cd:'ви підтверджуєте в гаманці',
    stepv_s:'Надсилання у Stellar',stepv_sd:'трансляція через Horizon',
    send_done:'Платіж підтверджено у Stellar Testnet',send_fail:'Платіж не пройшов',
    send_rcpt_status_v:'Підтверджено у Stellar Testnet',send_rcpt_proof:'Мемо',
    send_need_wallet:'Спочатку підключіть гаманець.',send_need_valid:'Введіть коректну адресу отримувача.',send_need_amount:'Введіть суму більше нуля.',
    wallet_no_freighter:'Freighter не знайдено. Встановіть його на freighter.app.',wallet_wrong_net:'Перемкніть Freighter на Stellar Testnet.',wallet_rejected:'Підключення скасовано.',
    send_no_balance:'Недостатньо балансу {a} для цієї суми.',send_sender_no_trust:'У вас ще немає trustline для {a}.',
    send_dest_missing:'Акаунт отримувача не профінансовано в Testnet.',send_dest_no_trust:'У отримувача немає trustline для {a}.',
    send_signed_rejected:'Підпис відхилено у гаманці.',bal_label:'Баланс',
    send_disc_lead:'Ключі перегляду за транзакцією для аудиторів зʼявляться разом із приватним пулом. Публічний платіж у Testnet прозорий за своєю природою.',
    send_disc_btn:'Як працюватиме розкриття',send_disc_note:'У планах: вибіркове розкриття стосується приватних переказів, а не публічних платежів.',
    sdk_missing:'Бібліотека платежів не завантажилась. Оновіть сторінку.',
    wallet_connect:'Підключити гаманець',wallet_choose:'Підключіть гаманець',
    wallet_freighter:'Freighter — розширення браузера (ПК)',wallet_albedo:'Albedo — веб-гаманець (працює з телефона)',
    wallet_install_freighter:'Встановити Freighter (ПК)',wallet_albedo_missing:'Не вдалося відкрити Albedo. Перевірте зʼєднання та блокування спливних вікон.',
    addr_bad_len:'Адреса Stellar складається з 56 символів — ви ввели {n}. Скопіюйте адресу повністю.',
    addr_bad_checksum:'Контрольна сума не зійшлась — скопіюйте повну адресу ще раз.',
    addr_bad_charset:'Неприпустимі символи — в адресі Stellar лише A–Z та 2–7.',
    addr_bad_type:'Це не публічна адреса — вона має починатися з G.'
  });
})();

/* ---------- network + assets ---------- */
var HORIZON='https://horizon-testnet.stellar.org';
var RAW=(CFG&&CFG.assets&&CFG.assets.length)?CFG.assets.slice():[
  {code:'XLM'},
  {code:'USDC',issuer:'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'},
  {code:'EURC',issuer:'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO'}
];
var ASSETS=RAW.map(function(a){return {code:a.code,issuer:a.issuer||null};});
ASSETS.sort(function(a,b){return (a.issuer?1:0)-(b.issuer?1:0);});

var lastReceipt=null, lastValid=false, busy=false, curStep=-1;
function sdk(){ return window.StellarSdk; }
function PASS(){ var s=sdk(); return (s&&s.Networks&&s.Networks.TESTNET)||'Test SDF Network ; September 2008'; }
function server(){ var s=sdk(); var Server=(s.Horizon&&s.Horizon.Server)||s.Server; return new Server(HORIZON); }
function findAsset(code){ for(var i=0;i<ASSETS.length;i++) if(ASSETS[i].code===code) return ASSETS[i]; return ASSETS[0]; }
function mkErr(m){ var e=new Error(m); e._uimsg=m; return e; }
function trimAmount(n){ var s=Number(n).toFixed(7); s=s.replace(/0+$/,'').replace(/\.$/,''); return s||'0'; }
function balOf(balances,def){ if(!balances) return null; for(var i=0;i<balances.length;i++){ var b=balances[i]; if(!def.issuer){ if(b.asset_type==='native') return b.balance; } else if(b.asset_code===def.code&&b.asset_issuer===def.issuer) return b.balance; } return null; }
function horizonError(e){ try{ var ex=e&&e.response&&e.response.data&&e.response.data.extras; if(ex&&ex.result_codes){ var rc=ex.result_codes; var code=(rc.operations&&rc.operations[0])||rc.transaction||''; var map={op_underfunded:'Not enough balance.',op_no_trust:'No trustline for this asset.',op_no_destination:'Recipient account does not exist on Testnet.',tx_bad_seq:'Wallet out of sync — try again.',op_line_full:'Recipient balance limit reached.',tx_insufficient_fee:'Network fee too low — try again.'}; return map[code]||('Stellar error: '+code); } }catch(_){} return null; }
function explorerTx(hash){ var base=(CFG&&CFG.explorer)||'https://stellar.expert/explorer/testnet'; return base+'/tx/'+hash; }
function validRcpt(a){ if(!a) return false; var s=sdk(); try{ if(s&&s.StrKey&&s.StrKey.isValidEd25519PublicKey) return s.StrKey.isValidEd25519PublicKey(a); }catch(_){} return /^G[A-Z2-7]{55}$/.test(a); }
function rcptReason(a){
  if(!a) return t('send_need_valid');
  if(SV){ var r=SV(a,'G'); if(r&&!r.ok){ if(r.reason==='length') return t('addr_bad_len').replace('{n}',String(a.length)); if(r.reason==='checksum') return t('addr_bad_checksum'); if(r.reason==='charset') return t('addr_bad_charset'); if(r.reason==='type'||r.reason==='secret') return t('addr_bad_type'); } }
  if(/^[A-Z2-7]*$/.test(a)&&a.length!==56) return t('addr_bad_len').replace('{n}',String(a.length));
  return t('send_need_valid');
}
function memoText(str){ if(!str) return null; function blen(x){ return unescape(encodeURIComponent(x)).length; } if(blen(str)<=28) return str; var out=''; for(var i=0;i<str.length;i++){ if(blen(out+str[i])>28) break; out+=str[i]; } return out||null; }

/* ---------- Wallets: Freighter (PC extension) + Albedo (web, mobile-friendly) ---------- */
function FA(){ return window.freighterApi||window.freighter||null; }
function ensureAlbedo(){ return new Promise(function(res){ if(window.albedo){ res(true); return; } var sc=document.createElement('script'); sc.src='https://albedo.link/albedo-intent.js'; sc.async=true; sc.onload=function(){ res(!!window.albedo); }; sc.onerror=function(){ res(false); }; document.head.appendChild(sc); }); }
var Wallet={ address:null, provider:null };
Wallet.connectFreighter=async function(){
  var api=FA();
  if(!api){ toast(t('wallet_no_freighter'),'err'); S.error(); window.open('https://www.freighter.app/','_blank','noopener'); return; }
  try{
    var addr=null,r;
    if(api.requestAccess){ r=await api.requestAccess(); if(r&&r.error) throw mkErr(t('wallet_rejected')); addr=(r&&r.address)||(typeof r==='string'?r:null); }
    if(!addr&&api.getAddress){ r=await api.getAddress(); if(r&&r.error) throw mkErr(t('wallet_rejected')); addr=(r&&r.address)||(typeof r==='string'?r:null); }
    if(!addr&&api.getPublicKey){ addr=await api.getPublicKey(); }
    if(!addr) throw mkErr(t('wallet_rejected'));
    var net=null; try{ if(api.getNetwork){ var nn=await api.getNetwork(); net=(nn&&nn.network)||nn; } else if(api.getNetworkDetails){ var nd=await api.getNetworkDetails(); net=nd&&nd.network; } }catch(e){}
    if(net&&String(net).toUpperCase().indexOf('TEST')<0){ toast(t('wallet_wrong_net'),'err'); S.error(); return; }
    Wallet.address=addr; Wallet.provider='freighter'; S.success();
  }catch(e){ toast((e&&e._uimsg)||t('wallet_rejected'),'err'); S.error(); }
};
Wallet.connectAlbedo=async function(){
  var ok=await ensureAlbedo();
  if(!ok||!window.albedo){ toast(t('wallet_albedo_missing'),'err'); S.error(); return; }
  try{
    var r=await window.albedo.publicKey({ token:String(Date.now()) });
    var pk=r&&r.pubkey;
    if(!pk) throw mkErr(t('wallet_rejected'));
    Wallet.address=pk; Wallet.provider='albedo'; S.success();
  }catch(e){ toast((e&&e._uimsg)||t('wallet_rejected'),'err'); S.error(); }
};
Wallet.disconnect=function(){ Wallet.address=null; Wallet.provider=null; };
Wallet.sign=async function(xdr){
  if(Wallet.provider==='albedo'){
    var ok=await ensureAlbedo(); if(!ok||!window.albedo) throw mkErr(t('wallet_albedo_missing'));
    var ar=await window.albedo.tx({ xdr:xdr, network:'testnet', pubkey:Wallet.address, submit:false });
    var sx=ar&&(ar.signed_envelope_xdr||ar.xdr);
    if(!sx) throw mkErr(t('send_signed_rejected'));
    return sx;
  }
  var api=FA(); if(!api) throw mkErr(t('wallet_no_freighter'));
  var opts={networkPassphrase:PASS(),network:'TESTNET',address:Wallet.address,accountToSign:Wallet.address};
  var r=await api.signTransaction(xdr,opts);
  if(typeof r==='string') return r;
  if(r&&r.error) throw mkErr(t('send_signed_rejected'));
  if(r&&r.signedTxXdr) return r.signedTxXdr;
  if(r&&r.signedXDR) return r.signedXDR;
  throw mkErr(t('send_signed_rejected'));
};

/* ---------- wallet chooser modal ---------- */
function closeWalletMenu(){ var m=$('wltmodal'); if(m&&m.parentNode) m.parentNode.removeChild(m); }
function openWalletMenu(){
  closeWalletMenu();
  var hasFr=!!FA();
  var m=document.createElement('div'); m.id='wltmodal';
  m.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(6,10,24,.66);backdrop-filter:blur(3px);padding:18px';
  var card=document.createElement('div');
  card.style.cssText='width:min(94vw,360px);background:#0e1530;border:1px solid rgba(120,150,255,.25);border-radius:16px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.5)';
  var html='<div style="font-weight:700;font-size:16px;margin:2px 0 14px;color:#eaf0ff">'+t('wallet_choose')+'</div>';
  html+='<button class="btn btn-soft btn-block" data-w="freighter" style="margin-bottom:10px">'+(hasFr?t('wallet_freighter'):t('wallet_install_freighter'))+'</button>';
  html+='<button class="btn btn-soft btn-block" data-w="albedo" style="margin-bottom:10px">'+t('wallet_albedo')+'</button>';
  html+='<button class="btn btn-ghost btn-block" data-w="cancel">✕</button>';
  card.innerHTML=html; m.appendChild(card); document.body.appendChild(m);
  m.addEventListener('click',function(e){ if(e.target===m) closeWalletMenu(); });
  card.querySelectorAll('button').forEach(function(b){ b.addEventListener('click',function(){ var w=b.getAttribute('data-w'); if(w==='cancel'){ closeWalletMenu(); return; } if(w==='freighter'){ if(!FA()){ window.open('https://www.freighter.app/','_blank','noopener'); toast(t('wallet_no_freighter'),'info'); closeWalletMenu(); return; } closeWalletMenu(); Wallet.connectFreighter().then(renderWallet); } else if(w==='albedo'){ closeWalletMenu(); Wallet.connectAlbedo().then(renderWallet); } }); });
}

/* ---------- pipeline UI ---------- */
var STEPS=[['stepv_w','stepv_wd'],['stepv_p','stepv_pd'],['stepv_c','stepv_cd'],['stepv_s','stepv_sd']];
function buildPipe(){ var p=$('pipe'); if(!p) return; p.innerHTML=''; STEPS.forEach(function(st,i){ var row=document.createElement('div'); row.className='step'; row.id='st'+i; row.innerHTML='<span class="step-ic" id="sti'+i+'">○</span><div class="step-tx"><b>'+t(st[0])+'</b><span>'+t(st[1])+'</span></div>'; p.appendChild(row); }); curStep=-1; }
function resetPipe(){ buildPipe(); }
function stepOn(i){ curStep=i; var r=$('st'+i), ic=$('sti'+i); if(r)r.className='step active'; if(ic)ic.textContent='◐'; }
function stepDone(i){ var r=$('st'+i), ic=$('sti'+i); if(r)r.className='step done'; if(ic)ic.textContent='✓'; }
function pipeFail(){ if(curStep<0) return; var r=$('st'+curStep), ic=$('sti'+curStep); if(r)r.className='step fail'; if(ic)ic.textContent='✕'; }
function setBusy(b){ busy=b; var sb=$('sendbtn'); if(!sb) return; sb.disabled=b; sb.textContent=b?t('send_btn_busy'):t('send_btn'); }

/* ---------- recipient validation UI ---------- */
function validateRcptUI(){ var el=$('rcpt'); if(!el) return; var a=(el.value||'').trim(); var h=$('rhint'); if(!a){ if(h){h.textContent='';h.className='hint';} lastValid=false; return; } lastValid=validRcpt(a); if(h){ h.textContent=lastValid?'':rcptReason(a); h.className='hint'+(lastValid?'':' bad'); } }

/* ---------- send (real) ---------- */
async function doSend(){
  if(busy) return;
  var s=sdk(); if(!s){ toast(t('sdk_missing'),'err'); S.error(); return; }
  if(!Wallet.address){ toast(t('send_need_wallet'),'err'); S.error(); return; }
  var to=(($('rcpt')&&$('rcpt').value)||'').trim();
  if(!validRcpt(to)){ toast(rcptReason(to)||t('send_need_valid'),'err'); S.error(); validateRcptUI(); return; }
  var code=($('asset')&&$('asset').value)||'XLM'; var def=findAsset(code);
  var amount=parseFloat(($('amt')&&$('amt').value)||'0');
  if(!(amount>0)){ toast(t('send_need_amount'),'err'); S.error(); return; }
  var amt=trimAmount(amount);
  var memo=(($('memo')&&$('memo').value)||'').trim();
  setBusy(true); resetPipe(); if($('receipt')) $('receipt').style.display='none';
  var srv=server();
  try{
    stepOn(0);
    var asset=def.issuer? new s.Asset(def.code,def.issuer) : s.Asset.native();
    var src=await srv.loadAccount(Wallet.address);
    var have=balOf(src.balances,def);
    if(def.issuer && have===null) throw mkErr(t('send_sender_no_trust').replace('{a}',def.code));
    if(have!==null && parseFloat(have) < parseFloat(amt)) throw mkErr(t('send_no_balance').replace('{a}',def.code));
    var destAcct=null; try{ destAcct=await srv.loadAccount(to); }catch(e){ destAcct=null; }
    var useCreate=false;
    if(!destAcct){ if(def.issuer){ throw mkErr(t('send_dest_missing')); } else if(parseFloat(amt)>=1){ useCreate=true; } else { throw mkErr(t('send_dest_missing')); } }
    if(def.issuer && destAcct && balOf(destAcct.balances,def)===null) throw mkErr(t('send_dest_no_trust').replace('{a}',def.code));
    stepDone(0);

    stepOn(1);
    var fee=s.BASE_FEE; try{ var f=await srv.fetchBaseFee(); if(f) fee=String(f); }catch(_){}
    var op=useCreate? s.Operation.createAccount({destination:to,startingBalance:amt}) : s.Operation.payment({destination:to,asset:asset,amount:amt});
    var tb=new s.TransactionBuilder(src,{fee:String(fee),networkPassphrase:PASS()}).addOperation(op);
    var mt=memoText(memo); if(mt){ try{ tb=tb.addMemo(s.Memo.text(mt)); }catch(_){} }
    var tx=tb.setTimeout(180).build();
    stepDone(1);

    stepOn(2);
    var signed=await Wallet.sign(tx.toXDR());
    stepDone(2);

    stepOn(3);
    var txObj=s.TransactionBuilder.fromXDR(signed,PASS());
    var res=await srv.submitTransaction(txObj);
    stepDone(3);
    var hash=res.hash||(res&&res.id)||'';
    fillReceipt({from:Wallet.address,to:to,amount:amt,code:def.code,memo:mt||'',hash:hash,time:new Date().toLocaleString()});
    toast(t('send_done'),'ok'); S.success();
    fetchBalances();
  }catch(e){
    var msg=(e&&e._uimsg)||horizonError(e)||(e&&e.message)||t('send_fail');
    toast(msg,'err'); S.error(); pipeFail();
  } finally { setBusy(false); }
}

function fillReceipt(r){
  lastReceipt=r;
  var sh=shorten||function(x){return x;};
  if($('r_from')) $('r_from').textContent=sh(r.from);
  if($('r_to')) $('r_to').textContent=sh(r.to);
  if($('r_amt')) $('r_amt').textContent=r.amount+' '+r.code;
  if($('r_proof')) $('r_proof').textContent=r.memo||'—';
  if($('r_tx')) $('r_tx').textContent=sh(r.hash);
  if($('r_time')) $('r_time').textContent=r.time;
  var tv=$('txview'); if(tv) tv.href=explorerTx(r.hash);
  if($('receipt')) $('receipt').style.display='';
}

function reset(){ if($('receipt')) $('receipt').style.display='none'; resetPipe(); var q=$('qr'); if(q) q.innerHTML=''; var qh=$('qrhint'); if(qh) qh.textContent=''; }

/* ---------- wallet render + balances ---------- */
function renderWallet(){ var dot=$('wdot'), st=$('wstate'), ad=$('waddr'), btn=$('wbtn'); var on=!!Wallet.address; var sh=shorten||function(x){return x;}; if(dot) dot.className='dot '+(on?'on':'off'); if(st) st.textContent= on? sh(Wallet.address) : tt('wallet_not','Not connected'); if(ad) ad.textContent= on? Wallet.address : ''; if(btn) btn.textContent= on? tt('wallet_disconnect','Disconnect') : tt('wallet_connect','Connect wallet'); if(on){ fetchBalances(); } else { var wb=$('wbal'); if(wb) wb.textContent=''; } }
async function fetchBalances(){ if(!Wallet.address||!sdk()) return; var code=($('asset')&&$('asset').value)||'XLM'; var def=findAsset(code); try{ var acct=await server().loadAccount(Wallet.address); var bal=balOf(acct.balances,def); var wb=$('wbal'); if(!wb){ wb=document.createElement('div'); wb.id='wbal'; wb.className='hint'; var ad=$('waddr'); if(ad&&ad.parentNode) ad.parentNode.appendChild(wb); else return; } wb.textContent=tt('bal_label','Balance')+': '+(bal!=null?trimAmount(bal)+' '+def.code:'0 '+def.code); }catch(e){ var w2=$('wbal'); if(w2) w2.textContent=''; } }

/* ---------- SEP-7 QR ---------- */
function doQR(){ var to=(($('rcpt')&&$('rcpt').value)||'').trim(); if(!validRcpt(to)){ toast(rcptReason(to)||t('send_need_valid'),'err'); S.error(); return; } var code=($('asset')&&$('asset').value)||'XLM'; var def=findAsset(code); var amt=trimAmount(parseFloat(($('amt')&&$('amt').value)||'0')); var memo=(($('memo')&&$('memo').value)||'').trim(); var uri='web+stellar:pay?destination='+encodeURIComponent(to)+'&amount='+encodeURIComponent(amt); if(def.issuer){ uri+='&asset_code='+encodeURIComponent(def.code)+'&asset_issuer='+encodeURIComponent(def.issuer); } var mt=memoText(memo); if(mt) uri+='&memo='+encodeURIComponent(mt); var box=$('qr'); if(box){ box.innerHTML=''; if(window.QRCode){ try{ new window.QRCode(box,{text:uri,width:180,height:180,correctLevel:window.QRCode.CorrectLevel.M}); }catch(_){ box.textContent=uri; } } else if(QR&&QR.renderQR){ try{ QR.renderQR(box,uri); }catch(_){ box.textContent=uri; } } else { box.textContent=uri; } } var qh=$('qrhint'); if(qh) qh.textContent=uri; S.click&&S.click(); }

/* ---------- disclosure (honest roadmap) ---------- */
function doDisc(){ toast(t('send_disc_note'),'ok'); S.click&&S.click(); }

/* ---------- minimal valid PDF receipt ---------- */
function pdfEsc(s){ return String(s).replace(/[\\()]/g,function(c){return '\\'+c;}); }
function asciiOnly(s){ return String(s).replace(/[^\x20-\x7E]/g,'?'); }
function buildPDF(lines){
  var head='%PDF-1.4\n';
  var objs=[];
  objs.push('<</Type/Catalog/Pages 2 0 R>>');
  objs.push('<</Type/Pages/Kids[3 0 R]/Count 1>>');
  objs.push('<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>');
  var body='BT /F1 11 Tf 1 0 0 1 56 790 Tm\n';
  for(var i=0;i<lines.length;i++){ body+='('+pdfEsc(asciiOnly(lines[i]))+') Tj\n0 -18 Td\n'; }
  body+='ET';
  objs.push('<</Length '+body.length+'>>\nstream\n'+body+'\nendstream');
  objs.push('<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>');
  var out=head, offsets=[];
  for(var j=0;j<objs.length;j++){ offsets.push(out.length); out+=(j+1)+' 0 obj\n'+objs[j]+'\nendobj\n'; }
  var xrefPos=out.length;
  out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n';
  for(var k=0;k<offsets.length;k++){ var so=('0000000000'+offsets[k]).slice(-10); out+=so+' 00000 n \n'; }
  out+='trailer\n<</Size '+(objs.length+1)+'/Root 1 0 R>>\nstartxref\n'+xrefPos+'\n%%EOF';
  return new Blob([out],{type:'application/pdf'});
}
function pdfLines(r){ return ['Zerolyn - Payment receipt','','Status:  Confirmed on Stellar Testnet','From:    '+r.from,'To:      '+r.to,'Amount:  '+r.amount+' '+r.code,'Memo:    '+(r.memo||'-'),'Tx hash: '+r.hash,'Time:    '+r.time,'','Verify:  '+explorerTx(r.hash),'','Network: Stellar Testnet']; }
function downloadPDF(){ if(!lastReceipt){ toast(t('send_fail'),'err'); return; } try{ var blob=buildPDF(pdfLines(lastReceipt)); var url=URL.createObjectURL(blob); var a=document.createElement('a'); a.href=url; a.download='zerolyn-receipt-'+(lastReceipt.hash||'tx').slice(0,10)+'.pdf'; document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function(){URL.revokeObjectURL(url);},2000); S.click&&S.click(); }catch(e){ toast(t('send_fail'),'err'); } }

/* ---------- init + wiring ---------- */
var inited=false;
function init(){
  var sel=$('asset'); if(sel){ sel.innerHTML=''; ASSETS.forEach(function(a){ var o=document.createElement('option'); o.value=a.code; o.textContent=a.code+(a.issuer?'':' (native)'); sel.appendChild(o); }); }
  buildPipe(); renderWallet();
  var wb=$('wbtn'); if(wb) wb.addEventListener('click',function(){ if(Wallet.address){ Wallet.disconnect(); renderWallet(); } else { openWalletMenu(); } });
  var sb=$('sendbtn'); if(sb) sb.addEventListener('click',doSend);
  var qb=$('qrbtn'); if(qb) qb.addEventListener('click',doQR);
  var db=$('discbtn'); if(db) db.addEventListener('click',doDisc);
  var pb=$('pdfbtn'); if(pb) pb.addEventListener('click',downloadPDF);
  var ab=$('againbtn'); if(ab) ab.addEventListener('click',reset);
  var rc=$('rcpt'); if(rc) rc.addEventListener('input',validateRcptUI);
  var as=$('asset'); if(as) as.addEventListener('change',fetchBalances);
  if(!sdk()){ toast(t('sdk_missing'),'err'); }
}
function ready(){ if(inited) return; inited=true; init(); }
window.SP={ ready:ready, onLang:function(){ buildPipe(); renderWallet(); validateRcptUI(); var sb=$('sendbtn'); if(sb&&!busy) sb.textContent=t('send_btn'); } };
if(document.readyState!=='loading') ready(); else document.addEventListener('DOMContentLoaded',ready);
})();

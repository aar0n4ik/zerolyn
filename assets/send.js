/* Zerolyn — send page: REAL Stellar Testnet payments. Device-aware wallet: desktop Freighter extension + Freighter Mobile via WalletConnect v2 (auto-opens the app, like Trust Wallet). */
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
    wallet_no_freighter:'Freighter wallet not found.',wallet_wrong_net:'Switch Freighter to Stellar Testnet.',wallet_rejected:'Connection cancelled.',
    wm_pc_t:'Connect on desktop',
    wm_pc_b:'Install the <a href=\"https://www.freighter.app/\" target=\"_blank\" rel=\"noopener\">Freighter</a> browser extension, unlock it and pick your account, then press “Connect wallet” here.',
    wm_pc_cta:'Get Freighter extension',
    wm_mob_t:'Connect on phone',
    wm_mob_b:'Tap “Connect wallet” to open the Freighter app on your phone and approve linking this page.',
    wm_mob_cta:'Copy page link',
    wm_copied:'Link copied',
    wm_close:'Close',
    wc_connecting_t:'Connect Freighter',
    wc_connecting_b:'Approve the connection request in your Freighter app to link this page.',
    wc_open:'Open in Freighter',
    wc_scan:'Or scan with Freighter on another device',
    wc_failed_t:'Couldn’t connect',
    wc_failed_b:'The wallet connection wasn’t completed. Open your Freighter app, finish setup, then try again.',
    send_no_balance:'Not enough {a} balance for this amount.',send_sender_no_trust:'You have no {a} trustline yet.',
    send_dest_missing:'Recipient account is not funded on Testnet.',send_dest_no_trust:'Recipient has no {a} trustline.',
    send_signed_rejected:'Signature was declined in your wallet.',bal_label:'Balance',
    send_disc_lead:'Per-transaction view keys for auditors ship with the shielded pool. A public Testnet payment is transparent by design.',
    send_disc_btn:'How disclosure will work',send_disc_note:'Roadmap: selective disclosure applies to shielded transfers, not public payments.',
    sdk_missing:'Payment library failed to load. Refresh the page.',
    wallet_connect:'Connect wallet',
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
    wallet_no_freighter:'Billetera Freighter no encontrada.',wallet_wrong_net:'Cambia Freighter a la Testnet de Stellar.',wallet_rejected:'Conexión cancelada.',
    send_no_balance:'Saldo de {a} insuficiente para este importe.',send_sender_no_trust:'Aún no tienes línea de confianza de {a}.',
    send_dest_missing:'La cuenta del destinatario no está financiada en la Testnet.',send_dest_no_trust:'El destinatario no tiene línea de confianza de {a}.',
    send_signed_rejected:'La firma fue rechazada en tu billetera.',bal_label:'Saldo',
    send_disc_lead:'Las claves de visualización por transacción para auditores llegan con el pool privado. Un pago público en Testnet es transparente por diseño.',
    send_disc_btn:'Cómo funcionará la divulgación',send_disc_note:'Hoja de ruta: la divulgación selectiva aplica a transferencias privadas, no a pagos públicos.',
    sdk_missing:'La librería de pagos no se cargó. Recarga la página.',
    wallet_connect:'Conectar billetera',
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
    wallet_no_freighter:'Freighter-Wallet nicht gefunden.',wallet_wrong_net:'Stelle Freighter auf das Stellar-Testnet um.',wallet_rejected:'Verbindung abgebrochen.',
    send_no_balance:'Nicht genug {a}-Guthaben für diesen Betrag.',send_sender_no_trust:'Du hast noch keine {a}-Trustline.',
    send_dest_missing:'Empfängerkonto ist im Testnet nicht finanziert.',send_dest_no_trust:'Empfänger hat keine {a}-Trustline.',
    send_signed_rejected:'Signatur in der Wallet abgelehnt.',bal_label:'Guthaben',
    send_disc_lead:'Transaktionsbezogene View-Keys für Prüfer kommen mit dem Shielded Pool. Eine öffentliche Testnet-Zahlung ist absichtlich transparent.',
    send_disc_btn:'So funktioniert die Offenlegung',send_disc_note:'Roadmap: selektive Offenlegung gilt für Shielded-Transfers, nicht für öffentliche Zahlungen.',
    sdk_missing:'Zahlungsbibliothek nicht geladen. Seite neu laden.',
    wallet_connect:'Wallet verbinden',
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
    wallet_no_freighter:'Кошелёк Freighter не найден.',wallet_wrong_net:'Переключите Freighter на Stellar Testnet.',wallet_rejected:'Подключение отменено.',
    wm_pc_t:'Подключение на компьютере',
    wm_pc_b:'Установите расширение <a href=\"https://www.freighter.app/\" target=\"_blank\" rel=\"noopener\">Freighter</a> для браузера, разблокируйте его и выберите аккаунт, затем нажмите «Подключить кошелёк» здесь.',
    wm_pc_cta:'Установить Freighter',
    wm_mob_t:'Подключение на телефоне',
    wm_mob_b:'Нажмите «Подключить кошелёк», чтобы открыть приложение Freighter на телефоне и подтвердить привязку этой страницы.',
    wm_mob_cta:'Скопировать ссылку',
    wm_copied:'Ссылка скопирована',
    wm_close:'Закрыть',
    wc_connecting_t:'Подключение Freighter',
    wc_connecting_b:'Подтвердите запрос на подключение в приложении Freighter, чтобы привязать эту страницу.',
    wc_open:'Открыть в Freighter',
    wc_scan:'Или отсканируйте другим устройством с Freighter',
    wc_failed_t:'Не удалось подключить',
    wc_failed_b:'Подключение кошелька не завершено. Откройте приложение Freighter, завершите настройку и попробуйте снова.',
    send_no_balance:'Недостаточно баланса {a} для этой суммы.',send_sender_no_trust:'У вас ещё нет trustline для {a}.',
    send_dest_missing:'Аккаунт получателя не профинансирован в Testnet.',send_dest_no_trust:'У получателя нет trustline для {a}.',
    send_signed_rejected:'Подпись отклонена в кошельке.',bal_label:'Баланс',
    send_disc_lead:'Ключи просмотра по транзакциям для аудиторов появятся вместе с приватным пулом. Публичный платёж в Testnet прозрачен по своей природе.',
    send_disc_btn:'Как будет работать раскрытие',send_disc_note:'В планах: выборочное раскрытие касается приватных переводов, а не публичных платежей.',
    sdk_missing:'Библиотека платежей не загрузилась. Обновите страницу.',
    wallet_connect:'Подключить кошелёк',
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
    wallet_no_freighter:'Гаманець Freighter не знайдено.',wallet_wrong_net:'Перемкніть Freighter на Stellar Testnet.',wallet_rejected:'Підключення скасовано.',
    send_no_balance:'Недостатньо балансу {a} для цієї суми.',send_sender_no_trust:'У вас ще немає trustline для {a}.',
    send_dest_missing:'Акаунт отримувача не профінансовано в Testnet.',send_dest_no_trust:'У отримувача немає trustline для {a}.',
    send_signed_rejected:'Підпис відхилено у гаманці.',bal_label:'Баланс',
    send_disc_lead:'Ключі перегляду за транзакцією для аудиторів зʼявляться разом із приватним пулом. Публічний платіж у Testnet прозорий за своєю природою.',
    send_disc_btn:'Як працюватиме розкриття',send_disc_note:'У планах: вибіркове розкриття стосується приватних переказів, а не публічних платежів.',
    sdk_missing:'Бібліотека платежів не завантажилась. Оновіть сторінку.',
    wallet_connect:'Підключити гаманець',
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
function normIssuer(x){ return (!x||x==='native')?null:x; }
function validIssuerKey(g){ if(!g) return false; var s=window.StellarSdk; try{ if(s&&s.StrKey&&s.StrKey.isValidEd25519PublicKey) return s.StrKey.isValidEd25519PublicKey(g); }catch(_){} return /^G[A-Z2-7]{55}$/.test(g); }
var ASSETS=RAW.map(function(a){return {code:a.code,issuer:normIssuer(a.issuer)};});
ASSETS=ASSETS.filter(function(a){ return a.issuer? validIssuerKey(a.issuer) : true; });
if(!ASSETS.some(function(a){return !a.issuer;})) ASSETS.unshift({code:'XLM',issuer:null});
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

/* ---------- Wallet: Freighter only. Desktop = extension; Phone = WalletConnect v2 (auto-opens the Freighter app). ---------- */
function FA(){ return window.freighterApi || (window.freighter && window.freighter.api) || null; }
function WC(){ return (window.SPWC && window.SPWC.ready && window.SPWC.ready()) ? window.SPWC : null; }
function isMobileDevice(){
  try{ if(navigator.userAgentData && typeof navigator.userAgentData.mobile==='boolean') return navigator.userAgentData.mobile; }catch(_){}
  var ua=navigator.userAgent||navigator.vendor||'';
  if(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile|BlackBerry|webOS/i.test(ua)) return true;
  if(/Macintosh/.test(ua) && (navigator.maxTouchPoints||0)>1) return true;
  try{ if(window.matchMedia && window.matchMedia('(pointer:coarse)').matches && (window.innerWidth||1200)<1024) return true; }catch(_){}
  return false;
}
function waitForFreighter(ms){
  return new Promise(function(res){
    if(FA()){ res(FA()); return; }
    var waited=0; var iv=setInterval(function(){
      if(FA()){ clearInterval(iv); res(FA()); return; }
      waited+=120; if(waited>=ms){ clearInterval(iv); res(FA()); }
    },120);
  });
}
var WM_ICON_DESK='<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M8 21h8\"/><path d=\"M12 17v4\"/></svg>';
var WM_ICON_PHONE='<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"3\"/><path d=\"M11 18h2\"/></svg>';
function ensureWalletModalStyles(){
  if(document.getElementById('wm-style')) return;
  var st=document.createElement('style'); st.id='wm-style';
  st.textContent='.wm-backdrop{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(16,24,40,.45);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:wmFade .2s ease}@keyframes wmFade{from{opacity:0}to{opacity:1}}.wm-card{position:relative;width:100%;max-width:380px;background:#fff;border-radius:20px;padding:28px 24px 24px;box-shadow:0 30px 80px -20px rgba(16,24,40,.5);text-align:center;animation:wmPop .3s cubic-bezier(.16,1,.3,1)}@keyframes wmPop{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}.wm-x{position:absolute;top:12px;right:12px;width:32px;height:32px;border:none;background:rgba(16,24,40,.06);border-radius:999px;font-size:20px;line-height:1;color:#4a5160;cursor:pointer}.wm-x:hover{background:rgba(16,24,40,.12)}.wm-ic{width:54px;height:54px;margin:2px auto 14px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(160deg,#eaf0ff,#dbe6ff);color:#1d4ed8}.wm-ic svg{width:28px;height:28px}.wm-t{margin:0 0 8px;font-size:19px;color:#1a1d23;font-weight:700}.wm-b{margin:0 0 18px;font-size:14px;line-height:1.55;color:#4a5160}.wm-b a{color:#1d4ed8;font-weight:600;text-decoration:none}.wm-b a:hover{text-decoration:underline}.wm-cta{display:flex;align-items:center;justify-content:center;width:100%;padding:12px 16px;border-radius:12px;border:none;background:linear-gradient(160deg,#2f7bff,#1d4ed8);color:#fff;font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;box-sizing:border-box}.wm-cta:hover{filter:brightness(1.05)}.wm-retry{display:flex;align-items:center;justify-content:center;width:100%;margin-top:10px;padding:11px 16px;border-radius:12px;border:1px solid rgba(16,24,40,.14);background:#fff;color:#1a1d23;font-size:14px;font-weight:600;cursor:pointer;box-sizing:border-box}.wm-retry:hover{background:rgba(16,24,40,.04)}.wm-spin{width:46px;height:46px;margin:2px auto 14px;border-radius:50%;border:3px solid rgba(29,78,216,.18);border-top-color:#1d4ed8;animation:wmSpin .8s linear infinite}@keyframes wmSpin{to{transform:rotate(360deg)}}.wm-qr{margin:8px auto 2px;display:flex;align-items:center;justify-content:center;min-height:0}.wm-qr img,.wm-qr canvas{border-radius:12px}.wm-or{margin:14px 0 8px;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#8a93a6}';
  document.head.appendChild(st);
}
function closeWalletModal(){ var m=document.getElementById('wm-backdrop'); if(m&&m.parentNode) m.parentNode.removeChild(m); }
function showWalletModal(){
  ensureWalletModalStyles(); closeWalletModal();
  var mob=isMobileDevice();
  var bd=document.createElement('div'); bd.id='wm-backdrop'; bd.className='wm-backdrop';
  var card=document.createElement('div'); card.className='wm-card';
  var html='';
  html+='<button class=\"wm-x\" type=\"button\" aria-label=\"'+tt('wm_close','Close')+'\">×</button>';
  html+='<div class=\"wm-ic\">'+(mob?WM_ICON_PHONE:WM_ICON_DESK)+'</div>';
  html+='<h3 class=\"wm-t\">'+(mob?t('wm_mob_t'):t('wm_pc_t'))+'</h3>';
  html+='<div class=\"wm-b\">'+(mob?t('wm_mob_b'):t('wm_pc_b'))+'</div>';
  if(mob){ html+='<button class=\"wm-cta\" type=\"button\" id=\"wm-retry\">'+tt('wallet_connect','Connect wallet')+'</button>'; }
  else { html+='<a class=\"wm-cta\" href=\"https://www.freighter.app/\" target=\"_blank\" rel=\"noopener\">'+t('wm_pc_cta')+'</a><button class=\"wm-retry\" type=\"button\" id=\"wm-retry\">'+tt('wallet_connect','Connect wallet')+'</button>'; }
  card.innerHTML=html; bd.appendChild(card); document.body.appendChild(bd);
  bd.addEventListener('click',function(e){ if(e.target===bd) closeWalletModal(); });
  var x=card.querySelector('.wm-x'); if(x) x.addEventListener('click',closeWalletModal);
  var rt=card.querySelector('#wm-retry'); if(rt) rt.addEventListener('click',function(){ closeWalletModal(); Wallet.connect().then(renderWallet); });
}
function showWCConnecting(){
  ensureWalletModalStyles(); closeWalletModal();
  var bd=document.createElement('div'); bd.id='wm-backdrop'; bd.className='wm-backdrop';
  var card=document.createElement('div'); card.className='wm-card';
  var html='';
  html+='<button class=\"wm-x\" type=\"button\" aria-label=\"'+tt('wm_close','Close')+'\">×</button>';
  html+='<div class=\"wm-spin\"></div>';
  html+='<h3 class=\"wm-t\">'+tt('wc_connecting_t','Connect Freighter')+'</h3>';
  html+='<div class=\"wm-b\">'+tt('wc_connecting_b','Approve the connection request in your Freighter app to link this page.')+'</div>';
  html+='<button class=\"wm-cta\" type=\"button\" id=\"wm-open\">'+tt('wc_open','Open in Freighter')+'</button>';
  html+='<div class=\"wm-or\">'+tt('wc_scan','Or scan with Freighter on another device')+'</div>';
  html+='<div class=\"wm-qr\" id=\"wm-qr\"></div>';
  card.innerHTML=html; bd.appendChild(card); document.body.appendChild(bd);
  bd.addEventListener('click',function(e){ if(e.target===bd){ closeWalletModal(); try{ if(window.SPWC) window.SPWC.disconnect(); }catch(_){} } });
  var x=card.querySelector('.wm-x'); if(x) x.addEventListener('click',function(){ closeWalletModal(); try{ if(window.SPWC) window.SPWC.disconnect(); }catch(_){} });
}
function setWCUri(uri){
  if(!uri) return;
  var open=document.getElementById('wm-open');
  if(open){ open.onclick=function(){ try{ window.location.href=uri; }catch(_){} }; }
  var box=document.getElementById('wm-qr');
  if(box){ try{ box.innerHTML=''; if(QR&&QR.renderQR){ QR.renderQR(box,uri); } }catch(_){} }
}
function showWCFailed(){
  ensureWalletModalStyles(); closeWalletModal();
  var bd=document.createElement('div'); bd.id='wm-backdrop'; bd.className='wm-backdrop';
  var card=document.createElement('div'); card.className='wm-card';
  var html='';
  html+='<button class=\"wm-x\" type=\"button\" aria-label=\"'+tt('wm_close','Close')+'\">×</button>';
  html+='<div class=\"wm-ic\">'+WM_ICON_PHONE+'</div>';
  html+='<h3 class=\"wm-t\">'+tt('wc_failed_t','Connection not completed')+'</h3>';
  html+='<div class=\"wm-b\">'+tt('wc_failed_b','The wallet connection was cancelled or timed out. Please try again.')+'</div>';
  html+='<button class=\"wm-cta\" type=\"button\" id=\"wm-retry\">'+tt('wallet_connect','Connect wallet')+'</button>';
  card.innerHTML=html; bd.appendChild(card); document.body.appendChild(bd);
  bd.addEventListener('click',function(e){ if(e.target===bd) closeWalletModal(); });
  var x=card.querySelector('.wm-x'); if(x) x.addEventListener('click',closeWalletModal);
  var rt=card.querySelector('#wm-retry'); if(rt) rt.addEventListener('click',function(){ closeWalletModal(); Wallet.connect().then(renderWallet); });
}

/* ---------- wallet state: desktop Freighter extension OR Freighter Mobile via WalletConnect ---------- */
function sleep(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
var WADDR=null, WVIA=null; /* 'ext' | 'wc' */
var Wallet={
  get address(){ return WADDR; },
  connected:function(){ return !!WADDR; },
  via:function(){ return WVIA; },
  connect:async function(){
    var mob=isMobileDevice();
    if(mob && WC()){
      showWCConnecting();
      try{
        var addr=await WC().connect(setWCUri);
        closeWalletModal();
        if(addr && /^G[A-Z2-7]{55}$/.test(addr)){ WADDR=addr; WVIA='wc'; toast(t('wallet_connected'),'ok'); if(S&&S.success) S.success(); return addr; }
        throw new Error('no-address');
      }catch(e){ closeWalletModal(); showWCFailed(); return null; }
    }
    var api=FA(); if(!api) api=await waitForFreighter(1500);
    if(!api){ showWalletModal(); return null; }
    try{
      if(api.setAllowed){ await api.setAllowed(); }
      else if(api.requestAccess){ await api.requestAccess(); }
      var pk=null;
      if(api.getAddress){ var r=await api.getAddress(); pk=r&&(r.address||r); }
      else if(api.getPublicKey){ pk=await api.getPublicKey(); }
      if(!pk||!/^G[A-Z2-7]{55}$/.test(pk)){ throw new Error('no-pk'); }
      try{
        var net=null;
        if(api.getNetworkDetails){ var nd=await api.getNetworkDetails(); net=nd&&(nd.networkPassphrase||nd.network); }
        else if(api.getNetwork){ net=await api.getNetwork(); }
        if(net && String(net).toUpperCase().indexOf('TEST')<0){ toast(tt('wallet_wrong_net','Switch your wallet to Stellar Testnet.'),'err'); }
      }catch(_){}
      WADDR=pk; WVIA='ext'; toast(t('wallet_connected'),'ok'); if(S&&S.success) S.success(); return pk;
    }catch(e){ toast(t('wallet_rejected'),'err'); if(S&&S.error) S.error(); return null; }
  },
  signXDR:async function(xdr){
    if(WVIA==='wc' && WC()){ return await WC().signXDR(xdr); }
    var api=FA(); if(!api) throw mkErr(tt('wallet_no_freighter','Freighter not found.'));
    var r=await api.signTransaction(xdr,{networkPassphrase:PASS(),network:'TESTNET',address:WADDR});
    if(typeof r==='string') return r;
    if(r&&r.signedTxXdr) return r.signedTxXdr;
    if(r&&r.signedXDR) return r.signedXDR;
    if(r&&r.error) throw new Error((r.error&&r.error.message)||String(r.error));
    throw new Error('sign failed');
  },
  disconnect:function(){ WADDR=null; WVIA=null; try{ if(WC()) WC().disconnect(); }catch(_){} toast(t('wallet_disconnected'),'info'); }
};
function renderWallet(){
  var dot=$('wdot'), st=$('wstate'), btn=$('wbtn'), ad=$('waddr');
  var on=Wallet.connected();
  if(dot){ dot.className='dot '+(on?'on':'off'); }
  if(st){ st.textContent = on ? t('wallet_connected') : t('wallet_not'); }
  if(btn){ btn.textContent = on ? t('wallet_disconnect') : t('wallet_connect'); }
  if(ad){ ad.textContent = on ? WADDR : ''; }
}

/* ---------- form + steps ---------- */
function fillAssets(){ var sel=$('asset'); if(!sel) return; var cur=sel.value; sel.innerHTML=ASSETS.map(function(a){ return '<option value=\"'+a.code+'\">'+a.code+'</option>'; }).join(''); if(cur){ sel.value=cur; } }
function markBad(id,bad){ var el=$(id); if(!el) return; if(bad) el.classList.add('bad'); else el.classList.remove('bad'); }
function checkRcpt(){
  var el=$('rcpt'); if(!el) return;
  var v=(el.value||'').trim(); var h=$('rhint');
  if(!v){ if(h){ h.textContent=''; h.className='hint'; } markBad('rcpt',false); return; }
  if(validRcpt(v)){ if(h){ h.textContent=''; h.className='hint'; } markBad('rcpt',false); }
  else { if(h){ h.textContent=rcptReason(v); h.className='hint bad'; } markBad('rcpt',true); }
}
var STEP_KEYS=[['stepv_w','stepv_wd'],['stepv_p','stepv_pd'],['stepv_c','stepv_cd'],['stepv_s','stepv_sd']];
var stepState=['','','',''];
function paintSteps(){
  var pipe=$('pipe'); if(!pipe) return;
  pipe.innerHTML=STEP_KEYS.map(function(k,i){
    var s=stepState[i]||'';
    var ic = s==='done' ? '✓' : (s==='fail' ? '!' : String(i+1));
    return '<div class=\"step '+s+'\"><div class=\"step-ic\">'+ic+'</div><div class=\"step-tx\"><b>'+t(k[0])+'</b><span>'+t(k[1])+'</span></div></div>';
  }).join('');
}
function setStep(i,s){ stepState[i]=s; paintSteps(); }
function resetSteps(){ stepState=['','','','']; paintSteps(); }

/* ---------- receipt ---------- */
function showReceipt(d){
  var box=$('receipt'); if(!box) return;
  var set=function(id,val){ var el=$(id); if(el) el.textContent=val; };
  set('r_from',shorten(d.from,8)); set('r_to',shorten(d.to,8)); set('r_amt',d.amount);
  set('r_proof',d.memo||'—'); set('r_tx',shorten(d.hash,10)); set('r_time',new Date().toLocaleString());
  var tv=$('txview'); if(tv){ tv.href=explorerTx(d.hash); }
  lastReceipt=d; box.style.display='';
  try{ box.scrollIntoView({behavior:'smooth',block:'center'}); }catch(_){}
}

/* ---------- REAL send ---------- */
async function doSend(){
  if(busy) return;
  var S2=sdk(); if(!S2){ toast(t('sdk_missing'),'err'); return; }
  var rcpt=(($('rcpt')||{}).value||'').trim();
  if(!validRcpt(rcpt)){ toast(rcptReason(rcpt),'err'); markBad('rcpt',true); return; }
  var amt=parseFloat(($('amt')||{}).value);
  if(!(amt>0)){ toast(t('send_need_amount'),'err'); return; }
  if(!Wallet.connected()){ toast(t('send_need_wallet'),'info'); await Wallet.connect(); renderWallet(); if(!Wallet.connected()) return; }
  var def=findAsset(($('asset')||{}).value);
  var memo=memoText((($('memo')||{}).value||'').trim());
  busy=true; var btn=$('sendbtn'); var oldLabel=btn?btn.textContent:'';
  if(btn){ btn.disabled=true; btn.textContent=tt('send_btn_busy',t('send_btn')); }
  resetSteps(); var rbox=$('receipt'); if(rbox) rbox.style.display='none';
  try{
    setStep(0,'active');
    var srv=server();
    var src=await srv.loadAccount(Wallet.address);
    var bal=balOf(src.balances,def);
    if(def.issuer && bal===null){ throw mkErr(t('send_sender_no_trust').replace('{a}',def.code)); }
    if(bal!==null && parseFloat(bal) < amt){ throw mkErr(t('send_no_balance').replace('{a}',def.code)); }
    try{
      var dacc=await srv.loadAccount(rcpt);
      if(def.issuer){ if(balOf(dacc.balances,def)===null) throw mkErr(t('send_dest_no_trust').replace('{a}',def.code)); }
    }catch(de){ if(de&&de._uimsg) throw de; throw mkErr(t('send_dest_missing')); }
    setStep(0,'done'); setStep(1,'active');
    var asset=def.issuer ? new S2.Asset(def.code,def.issuer) : S2.Asset.native();
    var b=new S2.TransactionBuilder(src,{fee:'1000000',networkPassphrase:PASS()})
      .addOperation(S2.Operation.payment({destination:rcpt,asset:asset,amount:trimAmount(amt)}));
    if(memo) b.addMemo(S2.Memo.text(memo));
    var tx=b.setTimeout(120).build();
    setStep(1,'done'); setStep(2,'active');
    var signed;
    try{ signed=await Wallet.signXDR(tx.toXDR()); }catch(se){ setStep(2,'fail'); throw mkErr(t('send_signed_rejected')); }
    if(!signed){ setStep(2,'fail'); throw mkErr(t('send_signed_rejected')); }
    setStep(2,'done'); setStep(3,'active');
    var stx=S2.TransactionBuilder.fromXDR(signed,PASS());
    var res=await srv.submitTransaction(stx);
    var hash=res&&(res.hash||res.id); if(!hash){ setStep(3,'fail'); throw mkErr('submit failed'); }
    if(res&&res.successful===false){ setStep(3,'fail'); throw mkErr(horizonError({response:{data:res}})||'Transaction failed on-chain'); }
    setStep(3,'done');
    showReceipt({from:Wallet.address,to:rcpt,amount:trimAmount(amt)+' '+def.code,memo:memo,hash:hash});
    if(S&&S.success) S.success(); toast(t('send_done'),'ok');
  }catch(e){
    for(var j=0;j<stepState.length;j++){ if(stepState[j]==='active') stepState[j]='fail'; } paintSteps();
    var msg=(e&&e._uimsg)||horizonError(e)||(e&&e.message)||'Error';
    toast(msg,'err'); if(S&&S.error) S.error();
  }finally{ busy=false; if(btn){ btn.disabled=false; btn.textContent=oldLabel||t('send_btn'); } }
}

/* ---------- QR (SEP-7) ---------- */
function doQR(){
  var rcpt=(($('rcpt')||{}).value||'').trim();
  var box=$('qr'); var hint=$('qrhint');
  if(!validRcpt(rcpt)){ if(box) box.innerHTML=''; toast(rcptReason(rcpt),'err'); markBad('rcpt',true); return; }
  var amt=parseFloat(($('amt')||{}).value)||0;
  var def=findAsset(($('asset')||{}).value);
  var memo=memoText((($('memo')||{}).value||'').trim());
  var uri=QR.sep7(rcpt, amt>0?trimAmount(amt):'', def.code, memo);
  if(box&&QR&&QR.renderQR){ QR.renderQR(box,uri); }
  if(hint){ hint.textContent=tt('send_qr_hint',''); hint.className='hint'; }
  if(S&&S.soft) S.soft();
}

/* ---------- disclosure (roadmap view-key preview) ---------- */
function doDisclosure(){
  var box=$('vkey'); var row=$('discrow'); if(!box) return;
  if(box.style.display!=='none' && box.textContent){ box.style.display='none'; if(row) row.style.display='none'; return; }
  var vk={ scheme:'groth16', curve:'bls12381', verifier:(CFG&&CFG.verifierContractId)||'', network:'stellar:testnet', statement:'amount >= 1 & amount <= balance & amount <= public_limit', viewing_key:'roadmap: per-transfer viewing keys for auditors' };
  box.textContent=JSON.stringify(vk,null,2); box.style.display='';
  if(row) row.style.display='';
  if(S&&S.soft) S.soft();
}
function copyDisc(){
  var box=$('vkey'); if(!box||!box.textContent) return;
  try{ navigator.clipboard.writeText(box.textContent); toast(tt('wm_copied','Copied'),'ok'); }catch(_){}
}

/* ---------- reset ---------- */
function resetForm(){
  var rbox=$('receipt'); if(rbox) rbox.style.display='none';
  resetSteps();
  var a=$('amt'); if(a) a.value='1';
  var m=$('memo'); if(m) m.value='';
  var r=$('rcpt'); if(r) r.value='';
  checkRcpt();
  try{ if(r) r.focus(); }catch(_){}
}

/* ---------- receipt download (PDF, Unicode-safe via canvas; PNG fallback) ---------- */
function receiptCanvas(){
  var d=lastReceipt||{}; var W=860,H=560;
  var c=document.createElement('canvas'); c.width=W; c.height=H; var x=c.getContext('2d');
  x.fillStyle='#ffffff'; x.fillRect(0,0,W,H);
  x.fillStyle='#0b1020'; x.font='700 30px Arial,sans-serif'; x.fillText('Zerolyn — '+t('send_receipt'),48,72);
  x.fillStyle='#1d4ed8'; x.fillRect(48,90,W-96,4);
  var rows=[[t('send_rcpt_from'),d.from||''],[t('send_rcpt_to'),d.to||''],[t('send_rcpt_amount'),d.amount||''],[t('send_rcpt_status'),t('send_rcpt_status_v')],[t('send_rcpt_proof'),d.memo||'—'],[t('send_rcpt_tx'),d.hash||''],[t('send_rcpt_time'),new Date().toLocaleString()]];
  var yy=152;
  rows.forEach(function(rw){ x.fillStyle='#5f7bb0'; x.font='400 18px Arial,sans-serif'; x.fillText(String(rw[0]),48,yy); x.fillStyle='#0b1020'; x.font='600 18px Arial,sans-serif'; var val=String(rw[1]); if(val.length>56) val=val.slice(0,53)+'…'; x.fillText(val,300,yy); yy+=48; });
  x.fillStyle='#8a93a6'; x.font='400 14px Arial,sans-serif'; x.fillText('Stellar Testnet · '+((CFG&&CFG.explorer)||''),48,H-32);
  return c;
}
function loadScript(src){ return new Promise(function(res,rej){ var s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
async function downloadReceipt(){
  if(!lastReceipt){ return; }
  var c=receiptCanvas();
  try{
    if(!(window.jspdf&&window.jspdf.jsPDF)){ await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'); }
    var JS=window.jspdf&&window.jspdf.jsPDF;
    if(JS){
      var pdf=new JS({orientation:'landscape',unit:'px',format:[c.width,c.height]});
      pdf.addImage(c.toDataURL('image/png'),'PNG',0,0,c.width,c.height);
      pdf.save('zerolyn-receipt.pdf'); if(S&&S.soft) S.soft(); return;
    }
  }catch(_){}
  var a=document.createElement('a'); a.href=c.toDataURL('image/png'); a.download='zerolyn-receipt.png'; document.body.appendChild(a); a.click(); document.body.removeChild(a); if(S&&S.soft) S.soft();
}

/* ---------- init (app.js calls window.SP.ready on DOMContentLoaded) ---------- */
window.SP={
  ready:function(){
    fillAssets(); renderWallet(); resetSteps(); checkRcpt();
    var bind=function(id,ev,fn){ var el=$(id); if(el&&!el._spw){ el._spw=1; el.addEventListener(ev,fn); } };
    bind('wbtn','click',function(){ if(Wallet.connected()){ Wallet.disconnect(); renderWallet(); } else { Wallet.connect().then(renderWallet); } });
    bind('sendbtn','click',doSend);
    bind('qrbtn','click',doQR);
    bind('discbtn','click',doDisclosure);
    bind('disccopy','click',copyDisc);
    bind('againbtn','click',resetForm);
    bind('pdfbtn','click',downloadReceipt);
    bind('rcpt','input',checkRcpt);
    bind('rcpt','blur',checkRcpt);
  },
  onLang:function(){ paintSteps(); renderWallet(); fillAssets(); }
};
if(document.readyState!=='loading'){ try{ window.SP.ready(); }catch(_){} }
})();

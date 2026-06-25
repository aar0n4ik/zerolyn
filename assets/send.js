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
  if(box){ box.inner
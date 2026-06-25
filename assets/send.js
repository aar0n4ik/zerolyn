/* Zerolyn — send page: REAL Stellar Testnet payments (single wallet: Freighter via official @stellar/freighter-api) */
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
    send_btn:'Sign and send payment',send_btn_busy:'Submitting\u2026',
    stepv_w:'Validate and prepare',stepv_wd:'address, balance and trustline',
    stepv_p:'Build transaction',stepv_pd:'Stellar payment operation',
    stepv_c:'Sign in wallet',stepv_cd:'you approve in your wallet',
    stepv_s:'Submit to Stellar',stepv_sd:'broadcast via Horizon',
    send_done:'Payment confirmed on Stellar Testnet',send_fail:'Payment failed',
    send_rcpt_status_v:'Confirmed on Stellar Testnet',send_rcpt_proof:'Memo',
    send_need_wallet:'Connect a wallet first.',send_need_valid:'Enter a valid recipient address.',send_need_amount:'Enter an amount greater than zero.',
    wallet_no_freighter:'Freighter not detected. See the hint below to connect.',wallet_wrong_net:'Switch Freighter to Stellar Testnet.',wallet_rejected:'Connection cancelled.',
    wallet_help:'Need Freighter? On desktop, install the extension at <a href=\"https://www.freighter.app/\" target=\"_blank\" rel=\"noopener\">freighter.app</a>, unlock it, then press Connect again. On phone, open this page inside the Freighter app\u2019s built-in browser.',
    send_no_balance:'Not enough {a} balance for this amount.',send_sender_no_trust:'You have no {a} trustline yet.',
    send_dest_missing:'Recipient account is not funded on Testnet.',send_dest_no_trust:'Recipient has no {a} trustline.',
    send_signed_rejected:'Signature was declined in your wallet.',bal_label:'Balance',
    send_disc_lead:'Per-transaction view keys for auditors ship with the shielded pool. A public Testnet payment is transparent by design.',
    send_disc_btn:'How disclosure will work',send_disc_note:'Roadmap: selective disclosure applies to shielded transfers, not public payments.',
    sdk_missing:'Payment library failed to load. Refresh the page.',
    wallet_connect:'Connect wallet',
    addr_bad_len:'A Stellar address is 56 characters \u2014 you entered {n}. Re-copy the full address.',
    addr_bad_checksum:'Address checksum failed \u2014 re-copy the full address.',
    addr_bad_charset:'Invalid characters \u2014 a Stellar address uses only A\u2013Z and 2\u20137.',
    addr_bad_type:'That is not a public address \u2014 it must start with G.'
  });
  M('es',{
    send_h:'Env\u00eda un pago real en Stellar',
    send_lead:'Un pago real en la Testnet de Stellar, firmado en tu billetera y enviado on-chain. Obtienes un hash de transacci\u00f3n real para verificar en Stellar Expert.',
    send_btn:'Firmar y enviar pago',send_btn_busy:'Enviando\u2026',
    stepv_w:'Validar y preparar',stepv_wd:'direcci\u00f3n, saldo y l\u00ednea de confianza',
    stepv_p:'Construir transacci\u00f3n',stepv_pd:'operaci\u00f3n de pago Stellar',
    stepv_c:'Firmar en la billetera',stepv_cd:'apruebas en tu monedero',
    stepv_s:'Enviar a Stellar',stepv_sd:'difundir v\u00eda Horizon',
    send_done:'Pago confirmado en la Testnet de Stellar',send_fail:'El pago fall\u00f3',
    send_rcpt_status_v:'Confirmado en la Testnet de Stellar',send_rcpt_proof:'Memo',
    send_need_wallet:'Conecta una billetera primero.',send_need_valid:'Introduce una direcci\u00f3n de destinatario v\u00e1lida.',send_need_amount:'Introduce un importe mayor que cero.',
    wallet_no_freighter:'Freighter no detectado. Mira la ayuda de abajo para conectar.',wallet_wrong_net:'Cambia Freighter a la Testnet de Stellar.',wallet_rejected:'Conexi\u00f3n cancelada.',
    wallet_help:'\u00bfNecesitas Freighter? En el ordenador instala la extensi\u00f3n en <a href=\"https://www.freighter.app/\" target=\"_blank\" rel=\"noopener\">freighter.app</a>, desbloqu\u00e9ala y pulsa Conectar de nuevo. En el m\u00f3vil, abre esta p\u00e1gina en el navegador integrado de la app Freighter.',
    send_no_balance:'Saldo de {a} insuficiente para este importe.',send_sender_no_trust:'A\u00fan no tienes l\u00ednea de confianza de {a}.',
    send_dest_missing:'La cuenta del destinatario no est\u00e1 financiada en la Testnet.',send_dest_no_trust:'El destinatario no tiene l\u00ednea de confianza de {a}.',
    send_signed_rejected:'La firma fue rechazada en tu billetera.',bal_label:'Saldo',
    send_disc_lead:'Las claves de visualizaci\u00f3n por transacci\u00f3n para auditores llegan con el pool privado. Un pago p\u00fablico en Testnet es transparente por dise\u00f1o.',
    send_disc_btn:'C\u00f3mo funcionar\u00e1 la divulgaci\u00f3n',send_disc_note:'Hoja de ruta: la divulgaci\u00f3n selectiva aplica a transferencias privadas, no a pagos p\u00fablicos.',
    sdk_missing:'La librer\u00eda de pagos no se carg\u00f3. Recarga la p\u00e1gina.',
    wallet_connect:'Conectar billetera',
    addr_bad_len:'Una direcci\u00f3n Stellar tiene 56 caracteres \u2014 escribiste {n}. Vuelve a copiar la direcci\u00f3n completa.',
    addr_bad_checksum:'Suma de verificaci\u00f3n fallida \u2014 vuelve a copiar la direcci\u00f3n completa.',
    addr_bad_charset:'Caracteres no v\u00e1lidos \u2014 una direcci\u00f3n Stellar solo usa A\u2013Z y 2\u20137.',
    addr_bad_type:'Eso no es una direcci\u00f3n p\u00fablica \u2014 debe empezar por G.'
  });
  M('de',{
    send_h:'Sende eine echte Stellar-Zahlung',
    send_lead:'Eine echte Zahlung im Stellar-Testnet, in deiner Wallet signiert und on-chain gesendet. Du erh\u00e4ltst einen echten Transaktions-Hash zur Pr\u00fcfung auf Stellar Expert.',
    send_btn:'Zahlung signieren und senden',send_btn_busy:'Wird gesendet\u2026',
    stepv_w:'Pr\u00fcfen und vorbereiten',stepv_wd:'Adresse, Guthaben und Trustline',
    stepv_p:'Transaktion erstellen',stepv_pd:'Stellar-Zahlungsoperation',
    stepv_c:'In der Wallet signieren',stepv_cd:'du best\u00e4tigst im Wallet',
    stepv_s:'An Stellar senden',stepv_sd:'\u00fcber Horizon \u00fcbertragen',
    send_done:'Zahlung im Stellar-Testnet best\u00e4tigt',send_fail:'Zahlung fehlgeschlagen',
    send_rcpt_status_v:'Best\u00e4tigt im Stellar-Testnet',send_rcpt_proof:'Memo',
    send_need_wallet:'Verbinde zuerst eine Wallet.',send_need_valid:'Gib eine g\u00fcltige Empf\u00e4ngeradresse ein.',send_need_amount:'Gib einen Betrag gr\u00f6\u00dfer als null ein.',
    wallet_no_freighter:'Freighter nicht erkannt. Siehe Hinweis unten zum Verbinden.',wallet_wrong_net:'Stelle Freighter auf das Stellar-Testnet um.',wallet_rejected:'Verbindung abgebrochen.',
    wallet_help:'Freighter n\u00f6tig? Am Desktop die Erweiterung unter <a href=\"https://www.freighter.app/\" target=\"_blank\" rel=\"noopener\">freighter.app</a> installieren, entsperren und erneut auf Verbinden klicken. Am Handy diese Seite im integrierten Browser der Freighter-App \u00f6ffnen.',
    send_no_balance:'Nicht genug {a}-Guthaben f\u00fcr diesen Betrag.',send_sender_no_trust:'Du hast noch keine {a}-Trustline.',
    send_dest_missing:'Empf\u00e4ngerkonto ist im Testnet nicht finanziert.',send_dest_no_trust:'Empf\u00e4nger hat keine {a}-Trustline.',
    send_signed_rejected:'Signatur in der Wallet abgelehnt.',bal_label:'Guthaben',
    send_disc_lead:'Transaktionsbezogene View-Keys f\u00fcr Pr\u00fcfer kommen mit dem Shielded Pool. Eine \u00f6ffentliche Testnet-Zahlung ist absichtlich transparent.',
    send_disc_btn:'So funktioniert die Offenlegung',send_disc_note:'Roadmap: selektive Offenlegung gilt f\u00fcr Shielded-Transfers, nicht f\u00fcr \u00f6ffentliche Zahlungen.',
    sdk_missing:'Zahlungsbibliothek nicht geladen. Seite neu laden.',
    wallet_connect:'Wallet verbinden',
    addr_bad_len:'Eine Stellar-Adresse hat 56 Zeichen \u2014 du hast {n} eingegeben. Kopiere die vollst\u00e4ndige Adresse erneut.',
    addr_bad_checksum:'Pr\u00fcfsumme fehlgeschlagen \u2014 kopiere die vollst\u00e4ndige Adresse erneut.',
    addr_bad_charset:'Ung\u00fcltige Zeichen \u2014 eine Stellar-Adresse nutzt nur A\u2013Z und 2\u20137.',
    addr_bad_type:'Das ist keine \u00f6ffentliche Adresse \u2014 sie muss mit G beginnen.'
  });
  M('ru',{
    send_h:'\u041e\u0442\u043f\u0440\u0430\u0432\u044c\u0442\u0435 \u0440\u0435\u0430\u043b\u044c\u043d\u044b\u0439 \u043f\u043b\u0430\u0442\u0451\u0436 \u0432 Stellar',
    send_lead:'\u0420\u0435\u0430\u043b\u044c\u043d\u044b\u0439 \u043f\u043b\u0430\u0442\u0451\u0436 \u0432 Stellar Testnet: \u043f\u043e\u0434\u043f\u0438\u0441\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0432 \u043a\u043e\u0448\u0435\u043b\u044c\u043a\u0435 \u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0432 \u0441\u0435\u0442\u044c. \u0412\u044b \u043f\u043e\u043b\u0443\u0447\u0430\u0435\u0442\u0435 \u043d\u0430\u0441\u0442\u043e\u044f\u0449\u0438\u0439 \u0445\u0435\u0448 \u0442\u0440\u0430\u043d\u0437\u0430\u043a\u0446\u0438\u0438 \u0434\u043b\u044f \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438 \u043d\u0430 Stellar Expert.',
    send_btn:'\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u0442\u044c \u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c',send_btn_busy:'\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430\u2026',
    stepv_w:'\u041f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u0438 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430',stepv_wd:'\u0430\u0434\u0440\u0435\u0441, \u0431\u0430\u043b\u0430\u043d\u0441 \u0438 trustline',
    stepv_p:'\u0421\u0431\u043e\u0440\u043a\u0430 \u0442\u0440\u0430\u043d\u0437\u0430\u043a\u0446\u0438\u0438',stepv_pd:'\u043f\u043b\u0430\u0442\u0451\u0436\u043d\u0430\u044f \u043e\u043f\u0435\u0440\u0430\u0446\u0438\u044f Stellar',
    stepv_c:'\u041f\u043e\u0434\u043f\u0438\u0441\u044c \u0432 \u043a\u043e\u0448\u0435\u043b\u044c\u043a\u0435',stepv_cd:'\u0432\u044b \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u0442\u0435 \u0432 \u043a\u043e\u0448\u0435\u043b\u044c\u043a\u0435',
    stepv_s:'\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430 \u0432 Stellar',stepv_sd:'\u0442\u0440\u0430\u043d\u0441\u043b\u044f\u0446\u0438\u044f \u0447\u0435\u0440\u0435\u0437 Horizon',
    send_done:'\u041f\u043b\u0430\u0442\u0451\u0436 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d \u0432 Stellar Testnet',send_fail:'\u041f\u043b\u0430\u0442\u0451\u0436 \u043d\u0435 \u043f\u0440\u043e\u0448\u0451\u043b',
    send_rcpt_status_v:'\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e \u0432 Stellar Testnet',send_rcpt_proof:'\u041c\u0435\u043c\u043e',
    send_need_wallet:'\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u0435 \u043a\u043e\u0448\u0435\u043b\u0451\u043a.',send_need_valid:'\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 \u0430\u0434\u0440\u0435\u0441 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044f.',send_need_amount:'\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0443\u043c\u043c\u0443 \u0431\u043e\u043b\u044c\u0448\u0435 \u043d\u0443\u043b\u044f.',
    wallet_no_freighter:'Freighter \u043d\u0435 \u043e\u0431\u043d\u0430\u0440\u0443\u0436\u0435\u043d. \u041f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0430 \u043d\u0438\u0436\u0435 \u043f\u043e\u043c\u043e\u0436\u0435\u0442 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c.',wallet_wrong_net:'\u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u0435 Freighter \u043d\u0430 Stellar Testnet.',wallet_rejected:'\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u043e.',
    wallet_help:'\u041d\u0443\u0436\u0435\u043d Freighter? \u041d\u0430 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u0435 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0435 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u0435 \u043d\u0430 <a href=\"https://www.freighter.app/\" target=\"_blank\" rel=\"noopener\">freighter.app</a>, \u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u0443\u0439\u0442\u0435 \u0435\u0433\u043e \u0438 \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c\u00bb \u0441\u043d\u043e\u0432\u0430. \u041d\u0430 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0435 \u043e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u044d\u0442\u0443 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0432\u043e \u0432\u0441\u0442\u0440\u043e\u0435\u043d\u043d\u043e\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f Freighter.',
    send_no_balance:'\u041d\u0435\u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e \u0431\u0430\u043b\u0430\u043d\u0441\u0430 {a} \u0434\u043b\u044f \u044d\u0442\u043e\u0439 \u0441\u0443\u043c\u043c\u044b.',send_sender_no_trust:'\u0423 \u0432\u0430\u0441 \u0435\u0449\u0451 \u043d\u0435\u0442 trustline \u0434\u043b\u044f {a}.',
    send_dest_missing:'\u0410\u043a\u043a\u0430\u0443\u043d\u0442 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044f \u043d\u0435 \u043f\u0440\u043e\u0444\u0438\u043d\u0430\u043d\u0441\u0438\u0440\u043e\u0432\u0430\u043d \u0432 Testnet.',send_dest_no_trust:'\u0423 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044f \u043d\u0435\u0442 trustline \u0434\u043b\u044f {a}.',
    send_signed_rejected:'\u041f\u043e\u0434\u043f\u0438\u0441\u044c \u043e\u0442\u043a\u043b\u043e\u043d\u0435\u043d\u0430 \u0432 \u043a\u043e\u0448\u0435\u043b\u044c\u043a\u0435.',bal_label:'\u0411\u0430\u043b\u0430\u043d\u0441',
    send_disc_lead:'\u041a\u043b\u044e\u0447\u0438 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u043f\u043e \u0442\u0440\u0430\u043d\u0437\u0430\u043a\u0446\u0438\u044f\u043c \u0434\u043b\u044f \u0430\u0443\u0434\u0438\u0442\u043e\u0440\u043e\u0432 \u043f\u043e\u044f\u0432\u044f\u0442\u0441\u044f \u0432\u043c\u0435\u0441\u0442\u0435 \u0441 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u044b\u043c \u043f\u0443\u043b\u043e\u043c. \u041f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 \u043f\u043b\u0430\u0442\u0451\u0436 \u0432 Testnet \u043f\u0440\u043e\u0437\u0440\u0430\u0447\u0435\u043d \u043f\u043e \u0441\u0432\u043e\u0435\u0439 \u043f\u0440\u0438\u0440\u043e\u0434\u0435.',
    send_disc_btn:'\u041a\u0430\u043a \u0431\u0443\u0434\u0435\u0442 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u0440\u0430\u0441\u043a\u0440\u044b\u0442\u0438\u0435',send_disc_note:'\u0412 \u043f\u043b\u0430\u043d\u0430\u0445: \u0432\u044b\u0431\u043e\u0440\u043e\u0447\u043d\u043e\u0435 \u0440\u0430\u0441\u043a\u0440\u044b\u0442\u0438\u0435 \u043a\u0430\u0441\u0430\u0435\u0442\u0441\u044f \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u044b\u0445 \u043f\u0435\u0440\u0435\u0432\u043e\u0434\u043e\u0432, \u0430 \u043d\u0435 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439.',
    sdk_missing:'\u0411\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0430 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439 \u043d\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u043b\u0430\u0441\u044c. \u041e\u0431\u043d\u043e\u0432\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443.',
    wallet_connect:'\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043a\u043e\u0448\u0435\u043b\u0451\u043a',
    addr_bad_len:'\u0410\u0434\u0440\u0435\u0441 Stellar \u0441\u043e\u0441\u0442\u043e\u0438\u0442 \u0438\u0437 56 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432 \u2014 \u0432\u044b \u0432\u0432\u0435\u043b\u0438 {n}. \u0421\u043a\u043e\u043f\u0438\u0440\u0443\u0439\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u0446\u0435\u043b\u0438\u043a\u043e\u043c.',
    addr_bad_checksum:'\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u044c\u043d\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u043d\u0435 \u0441\u043e\u0448\u043b\u0430\u0441\u044c \u2014 \u0441\u043a\u043e\u043f\u0438\u0440\u0443\u0439\u0442\u0435 \u043f\u043e\u043b\u043d\u044b\u0439 \u0430\u0434\u0440\u0435\u0441 \u0437\u0430\u043d\u043e\u0432\u043e.',
    addr_bad_charset:'\u041d\u0435\u0434\u043e\u043f\u0443\u0441\u0442\u0438\u043c\u044b\u0435 \u0441\u0438\u043c\u0432\u043e\u043b\u044b \u2014 \u0432 \u0430\u0434\u0440\u0435\u0441\u0435 Stellar \u0442\u043e\u043b\u044c\u043a\u043e A\u2013Z \u0438 2\u20137.',
    addr_bad_type:'\u042d\u0442\u043e \u043d\u0435 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0439 \u0430\u0434\u0440\u0435\u0441 \u2014 \u043e\u043d \u0434\u043e\u043b\u0436\u0435\u043d \u043d\u0430\u0447\u0438\u043d\u0430\u0442\u044c\u0441\u044f \u0441 G.'
  });
  M('uk',{
    send_h:'\u041d\u0430\u0434\u0456\u0448\u043b\u0456\u0442\u044c \u0440\u0435\u0430\u043b\u044c\u043d\u0438\u0439 \u043f\u043b\u0430\u0442\u0456\u0436 \u0443 Stellar',
    send_lead:'\u0420\u0435\u0430\u043b\u044c\u043d\u0438\u0439 \u043f\u043b\u0430\u0442\u0456\u0436 \u0443 Stellar Testnet: \u043f\u0456\u0434\u043f\u0438\u0441\u0443\u0454\u0442\u044c\u0441\u044f \u0443 \u0433\u0430\u043c\u0430\u043d\u0446\u0456 \u0456 \u043d\u0430\u0434\u0441\u0438\u043b\u0430\u0454\u0442\u044c\u0441\u044f \u0432 \u043c\u0435\u0440\u0435\u0436\u0443. \u0412\u0438 \u043e\u0442\u0440\u0438\u043c\u0443\u0454\u0442\u0435 \u0441\u043f\u0440\u0430\u0432\u0436\u043d\u0456\u0439 \u0445\u0435\u0448 \u0442\u0440\u0430\u043d\u0437\u0430\u043a\u0446\u0456\u0457 \u0434\u043b\u044f \u043f\u0435\u0440\u0435\u0432\u0456\u0440\u043a\u0438 \u043d\u0430 Stellar Expert.',
    send_btn:'\u041f\u0456\u0434\u043f\u0438\u0441\u0430\u0442\u0438 \u0456 \u043d\u0430\u0434\u0456\u0441\u043b\u0430\u0442\u0438',send_btn_busy:'\u041d\u0430\u0434\u0441\u0438\u043b\u0430\u043d\u043d\u044f\u2026',
    stepv_w:'\u041f\u0435\u0440\u0435\u0432\u0456\u0440\u043a\u0430 \u0456 \u043f\u0456\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430',stepv_wd:'\u0430\u0434\u0440\u0435\u0441\u0430, \u0431\u0430\u043b\u0430\u043d\u0441 \u0456 trustline',
    stepv_p:'\u0421\u043a\u043b\u0430\u0434\u0430\u043d\u043d\u044f \u0442\u0440\u0430\u043d\u0437\u0430\u043a\u0446\u0456\u0457',stepv_pd:'\u043f\u043b\u0430\u0442\u0456\u0436\u043d\u0430 \u043e\u043f\u0435\u0440\u0430\u0446\u0456\u044f Stellar',
    stepv_c:'\u041f\u0456\u0434\u043f\u0438\u0441 \u0443 \u0433\u0430\u043c\u0430\u043d\u0446\u0456',stepv_cd:'\u0432\u0438 \u043f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0443\u0454\u0442\u0435 \u0432 \u0433\u0430\u043c\u0430\u043d\u0446\u0456',
    stepv_s:'\u041d\u0430\u0434\u0441\u0438\u043b\u0430\u043d\u043d\u044f \u0443 Stellar',stepv_sd:'\u0442\u0440\u0430\u043d\u0441\u043b\u044f\u0446\u0456\u044f \u0447\u0435\u0440\u0435\u0437 Horizon',
    send_done:'\u041f\u043b\u0430\u0442\u0456\u0436 \u043f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043d\u043e \u0443 Stellar Testnet',send_fail:'\u041f\u043b\u0430\u0442\u0456\u0436 \u043d\u0435 \u043f\u0440\u043e\u0439\u0448\u043e\u0432',
    send_rcpt_status_v:'\u041f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043d\u043e \u0443 Stellar Testnet',send_rcpt_proof:'\u041c\u0435\u043c\u043e',
    send_need_wallet:'\u0421\u043f\u043e\u0447\u0430\u0442\u043a\u0443 \u043f\u0456\u0434\u043a\u043b\u044e\u0447\u0456\u0442\u044c \u0433\u0430\u043c\u0430\u043d\u0435\u0446\u044c.',send_need_valid:'\u0412\u0432\u0435\u0434\u0456\u0442\u044c \u043a\u043e\u0440\u0435\u043a\u0442\u043d\u0443 \u0430\u0434\u0440\u0435\u0441\u0443 \u043e\u0442\u0440\u0438\u043c\u0443\u0432\u0430\u0447\u0430.',send_need_amount:'\u0412\u0432\u0435\u0434\u0456\u0442\u044c \u0441\u0443\u043c\u0443 \u0431\u0456\u043b\u044c\u0448\u0435 \u043d\u0443\u043b\u044f.',
    wallet_no_freighter:'Freighter \u043d\u0435 \u0437\u043d\u0430\u0439\u0434\u0435\u043d\u043e. \u041f\u0456\u0434\u043a\u0430\u0437\u043a\u0430 \u043d\u0438\u0436\u0447\u0435 \u0434\u043e\u043f\u043e\u043c\u043e\u0436\u0435 \u043f\u0456\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u0438.',wallet_wrong_net:'\u041f\u0435\u0440\u0435\u043c\u043a\u043d\u0456\u0442\u044c Freighter \u043d\u0430 Stellar Testnet.',wallet_rejected:'\u041f\u0456\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u043d\u044f \u0441\u043a\u0430\u0441\u043e\u0432\u0430\u043d\u043e.',
    wallet_help:'\u041f\u043e\u0442\u0440\u0456\u0431\u0435\u043d Freighter? \u041d\u0430 \u043a\u043e\u043c\u043f\u02bc\u044e\u0442\u0435\u0440\u0456 \u0432\u0441\u0442\u0430\u043d\u043e\u0432\u0456\u0442\u044c \u0440\u043e\u0437\u0448\u0438\u0440\u0435\u043d\u043d\u044f \u043d\u0430 <a href=\"https://www.freighter.app/\" target=\"_blank\" rel=\"noopener\">freighter.app</a>, \u0440\u043e\u0437\u0431\u043b\u043e\u043a\u0443\u0439\u0442\u0435 \u0439\u043e\u0433\u043e \u0456 \u043d\u0430\u0442\u0438\u0441\u043d\u0456\u0442\u044c \u00ab\u041f\u0456\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u0438\u00bb \u0449\u0435 \u0440\u0430\u0437. \u041d\u0430 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0456 \u0432\u0456\u0434\u043a\u0440\u0438\u0439\u0442\u0435 \u0446\u044e \u0441\u0442\u043e\u0440\u0456\u043d\u043a\u0443 \u0443 \u0432\u0431\u0443\u0434\u043e\u0432\u0430\u043d\u043e\u043c\u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456 \u0437\u0430\u0441\u0442\u043e\u0441\u0443\u043d\u043a\u0443 Freighter.',
    send_no_balance:'\u041d\u0435\u0434\u043e\u0441\u0442\u0430\u0442\u043d\u044c\u043e \u0431\u0430\u043b\u0430\u043d\u0441\u0443 {a} \u0434\u043b\u044f \u0446\u0456\u0454\u0457 \u0441\u0443\u043c\u0438.',send_sender_no_trust:'\u0423 \u0432\u0430\u0441 \u0449\u0435 \u043d\u0435\u043c\u0430\u0454 trustline \u0434\u043b\u044f {a}.',
    send_dest_missing:'\u0410\u043a\u0430\u0443\u043d\u0442 \u043e\u0442\u0440\u0438\u043c\u0443\u0432\u0430\u0447\u0430 \u043d\u0435 \u043f\u0440\u043e\u0444\u0456\u043d\u0430\u043d\u0441\u043e\u0432\u0430\u043d\u043e \u0432 Testnet.',send_dest_no_trust:'\u0423 \u043e\u0442\u0440\u0438\u043c\u0443\u0432\u0430\u0447\u0430 \u043d\u0435\u043c\u0430\u0454 trustline \u0434\u043b\u044f {a}.',
    send_signed_rejected:'\u041f\u0456\u0434\u043f\u0438\u0441 \u0432\u0456\u0434\u0445\u0438\u043b\u0435\u043d\u043e \u0443 \u0433\u0430\u043c\u0430\u043d\u0446\u0456.',bal_label:'\u0411\u0430\u043b\u0430\u043d\u0441',
    send_disc_lead:'\u041a\u043b\u044e\u0447\u0456 \u043f\u0435\u0440\u0435\u0433\u043b\u044f\u0434\u0443 \u0437\u0430 \u0442\u0440\u0430\u043d\u0437\u0430\u043a\u0446\u0456\u0454\u044e \u0434\u043b\u044f \u0430\u0443\u0434\u0438\u0442\u043e\u0440\u0456\u0432 \u0437\u02bc\u044f\u0432\u043b\u044f\u0442\u044c\u0441\u044f \u0440\u0430\u0437\u043e\u043c \u0456\u0437 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u0438\u043c \u043f\u0443\u043b\u043e\u043c. \u041f\u0443\u0431\u043b\u0456\u0447\u043d\u0438\u0439 \u043f\u043b\u0430\u0442\u0456\u0436 \u0443 Testnet \u043f\u0440\u043e\u0437\u043e\u0440\u0438\u0439 \u0437\u0430 \u0441\u0432\u043e\u0454\u044e \u043f\u0440\u0438\u0440\u043e\u0434\u043e\u044e.',
    send_disc_btn:'\u042f\u043a \u043f\u0440\u0430\u0446\u044e\u0432\u0430\u0442\u0438\u043c\u0435 \u0440\u043e\u0437\u043a\u0440\u0438\u0442\u0442\u044f',send_disc_note:'\u0423 \u043f\u043b\u0430\u043d\u0430\u0445: \u0432\u0438\u0431\u0456\u0440\u043a\u043e\u0432\u0435 \u0440\u043e\u0437\u043a\u0440\u0438\u0442\u0442\u044f \u0441\u0442\u043e\u0441\u0443\u0454\u0442\u044c\u0441\u044f \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u0438\u0445 \u043f\u0435\u0440\u0435\u043a\u0430\u0437\u0456\u0432, \u0430 \u043d\u0435 \u043f\u0443\u0431\u043b\u0456\u0447\u043d\u0438\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0456\u0432.',
    sdk_missing:'\u0411\u0456\u0431\u043b\u0456\u043e\u0442\u0435\u043a\u0430 \u043f\u043b\u0430\u0442\u0435\u0436\u0456\u0432 \u043d\u0435 \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0438\u043b\u0430\u0441\u044c. \u041e\u043d\u043e\u0432\u0456\u0442\u044c \u0441\u0442\u043e\u0440\u0456\u043d\u043a\u0443.',
    wallet_connect:'\u041f\u0456\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u0438 \u0433\u0430\u043c\u0430\u043d\u0435\u0446\u044c',
    addr_bad_len:'\u0410\u0434\u0440\u0435\u0441\u0430 Stellar \u0441\u043a\u043b\u0430\u0434\u0430\u0454\u0442\u044c\u0441\u044f \u0437 56 \u0441\u0438\u043c\u0432\u043e\u043b\u0456\u0432 \u2014 \u0432\u0438 \u0432\u0432\u0435\u043b\u0438 {n}. \u0421\u043a\u043e\u043f\u0456\u044e\u0439\u0442\u0435 \u0430\u0434\u0440\u0435\u0441\u0443 \u043f\u043e\u0432\u043d\u0456\u0441\u0442\u044e.',
    addr_bad_checksum:'\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u044c\u043d\u0430 \u0441\u0443\u043c\u0430 \u043d\u0435 \u0437\u0456\u0439\u0448\u043b\u0430\u0441\u044c \u2014 \u0441\u043a\u043e\u043f\u0456\u044e\u0439\u0442\u0435 \u043f\u043e\u0432\u043d\u0443 \u0430\u0434\u0440\u0435\u0441\u0443 \u0449\u0435 \u0440\u0430\u0437.',
    addr_bad_charset:'\u041d\u0435\u043f\u0440\u0438\u043f\u0443\u0441\u0442\u0438\u043c\u0456 \u0441\u0438\u043c\u0432\u043e\u043b\u0438 \u2014 \u0432 \u0430\u0434\u0440\u0435\u0441\u0456 Stellar \u043b\u0438\u0448\u0435 A\u2013Z \u0442\u0430 2\u20137.',
    addr_bad_type:'\u0426\u0435 \u043d\u0435 \u043f\u0443\u0431\u043b\u0456\u0447\u043d\u0430 \u0430\u0434\u0440\u0435\u0441\u0430 \u2014 \u0432\u043e\u043d\u0430 \u043c\u0430\u0454 \u043f\u043e\u0447\u0438\u043d\u0430\u0442\u0438\u0441\u044f \u0437 G.'
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
/* native XLM has issuer null; drop any asset whose issuer is malformed (prevents "Issuer is invalid") */
ASSETS=ASSETS.filter(function(a){ return a.issuer? validIssuerKey(a.issuer) : true; });
/* guarantee native XLM exists and is the default option */
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
function horizonError(e){ try{ var ex=e&&e.response&&e.response.data&&e.response.data.extras; if(ex&&ex.result_codes){ var rc=ex.result_codes; var code=(rc.operations&&rc.operations[0])||rc.transaction||''; var map={op_underfunded:'Not enough balance.',op_no_trust:'No trustline for this asset.',op_no_destination:'Recipient account does not exist on Testnet.',tx_bad_seq:'Wallet out of sync \u2014 try again.',op_line_full:'Recipient balance limit reached.',tx_insufficient_fee:'Network fee too low \u2014 try again.'}; return map[code]||('Stellar error: '+code); } }catch(_){} return null; }
function explorerTx(hash){ var base=(CFG&&CFG.explorer)||'https://stellar.expert/explorer/testnet'; return base+'/tx/'+hash; }
function validRcpt(a){ if(!a) return false; var s=sdk(); try{ if(s&&s.StrKey&&s.StrKey.isValidEd25519PublicKey) return s.StrKey.isValidEd25519PublicKey(a); }catch(_){} return /^G[A-Z2-7]{55}$/.test(a); }
function rcptReason(a){
  if(!a) return t('send_need_valid');
  if(SV){ var r=SV(a,'G'); if(r&&!r.ok){ if(r.reason==='length') return t('addr_bad_len').replace('{n}',String(a.length)); if(r.reason==='checksum') return t('addr_bad_checksum'); if(r.reason==='charset') return t('addr_bad_charset'); if(r.reason==='type'||r.reason==='secret') return t('addr_bad_type'); } }
  if(/^[A-Z2-7]*$/.test(a)&&a.length!==56) return t('addr_bad_len').replace('{n}',String(a.length));
  return t('send_need_valid');
}
function memoText(str){ if(!str) return null; function blen(x){ return unescape(encodeURIComponent(x)).length; } if(blen(str)<=28) return str; var out=''; for(var i=0;i<str.length;i++){ if(blen(out+str[i])>28) break; out+=str[i]; } return out||null; }

/* ---------- Wallet: Freighter only (desktop extension + Freighter mobile in-app browser) ---------- */
/* Requires the official @stellar/freighter-api script, which exposes window.freighterApi and bridges to the extension. */
function FA(){ return window.freighterApi || (window.freighter && window.freighter.api) || null; }
function waitForFreighter(ms){
  return new Promise(function(res){
    if(FA()){ res(FA()); return; }
    var waited=0; var iv=setInterval(function(){
      if(FA()){ clearInterval(iv); res(FA()); return; }
      waited+=120; if(waited>=ms){ clearInterval(iv); res(FA()); }
    },120);
  });
}
function showWalletHelp(){ var ad=$('waddr'); if(!ad||!ad.parentNode) return; var h=$('whelp'); if(!h){ h=document.createElement('div'); h.id='whelp'; h.className='hint'; ad.parentNode.appendChild(h); } h.innerHTML=t('wallet_help'); }
function hideWalletHelp(){ var h=$('whelp'); if(h){ h.innerHTML=''; } }
var Wallet={ address:null, provider:'freighter' };
Wallet.connect=async function(){
  var api=await waitForFreighter(2500);
  if(!api){ toast(t('wallet_no_freighter'),'err'); S.error(); showWalletHelp(); return; }
  var present=true;
  try{ if(api.isConnected){ var c=await api.isConnected(); present=(c&&typeof c==='object')?(c.isConnected!==false):!!c; } }catch(_){ present=true; }
  if(!present){ toast(t('wallet_no_freighter'),'err'); S.error(); showWalletHelp(); return; }
  try{
    var addr=null,r;
    if(api.requestAccess){ r=await api.requestAccess(); if(r&&r.error) throw mkErr((r.error&&(r.error.message||r.error))||t('wallet_rejected')); addr=(r&&r.address)||(typeof r==='string'?r:null); }
    if(!addr&&api.getAddress){ r=await api.getAddress(); if(r&&r.error) throw mkErr(t('wallet_rejected')); addr=(r&&r.address)||(typeof r==='string'?r:null); }
    if(!addr&&api.getPublicKey){ addr=await api.getPublicKey(); }
    if(!addr) throw mkErr(t('wallet_rejected'));
    var net=null; try{ if(api.getNetworkDetails){ var nd=await api.getNetworkDetails(); net=(nd&&(nd.network||nd.networkPassphrase))||null; } else if(api.getNetwork){ var nn=await api.getNetwork(); net=(nn&&nn.network)||nn; } }catch(_){}
    if(net&&String(net).toUpperCase().indexOf('TEST')<0){ toast(t('wallet_wrong_net'),'err'); S.error(); return; }
    Wallet.address=addr; Wallet.provider='freighter'; hideWalletHelp(); S.success();
  }catch(e){ toast((e&&e._uimsg)||t('wallet_rejected'),'err'); S.error(); }
};
Wallet.disconnect=function(){ Wallet.address=null; };
Wallet.sign=async function(xdr){
  var api=FA(); if(!api) throw mkErr(t('wallet_no_freighter'));
  var opts={networkPassphrase:PASS(),network:'TESTNET',address:Wallet.address,accountToSign:Wallet.address};
  var r=await api.signTransaction(xdr,opts);
  if(typeof r==='string') return r;
  if(r&&r.error) throw mkErr((r.error&&(r.error.message||r.error))||t('send_signed_rejected'));
  if(r&&r.signedTxXdr) return r.signedTxXdr;
  if(r&&r.signedXDR) return r.signedXDR;
  throw mkErr(t('send_signed_rejected'));
};

/* ---------- pipeline UI ---------- */
var STEPS=[['stepv_w','stepv_wd'],['stepv_p','stepv_pd'],['stepv_c','stepv_cd'],['stepv_s','stepv_sd']];
function buildPipe(){ var p=$('pipe'); if(!p) return; p.innerHTML=''; STEPS.forEach(function(st,i){ var row=document.createElement('div'); row.className='step'; row.id='st'+i; row.innerHTML='<span class="step-ic" id="sti'+i+'">\u25cb</span><div class="step-tx"><b>'+t(st[0])+'</b><span>'+t(st[1])+'</span></div>'; p.appendChild(row); }); curStep=-1; }
function resetPipe(){ buildPipe(); }
function stepOn(i){ curStep=i; var r=$('st'+i), ic=$('sti'+i); if(r)r.className='step active'; if(ic)ic.textContent='\u25d0'; }
function stepDone(i){ var r=$('st'+i), ic=$('sti'+i); if(r)r.className='step done'; if(ic)ic.textContent='\u2713'; }
function pipeFail(){ if(curStep<0) return; var r=$('st'+curStep), ic=$('sti'+curStep); if(r)r.className='step fail'; if(ic)ic.textContent='\u2715'; }
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
  if($('r_proof')) $('r_proof').textContent=r.memo||'\u2014';
  if($('r_tx')) $('r_tx').textContent=sh(r.hash);
  if($('r_time')) $('r_time').textContent=r.time;
  var tv=$('txview'); if(tv) tv.href=explorerTx(r.hash);
  if($('receipt')) $('receipt').style.display='';
}

function reset(){ if($('receipt')) $('receipt').style.display='none'; resetPipe(); var q=$('qr'); if(q) q.innerHTML=''; var qh=$('qrhint'); if(qh) qh.textContent=''; }

/* ---------- wallet render + balances ---------- */
function renderWallet(){ var dot=$('wdot'), st=$('wstate'), ad=$('waddr'), btn=$('wbtn'); var on=!!Wallet.address; var sh=shorten||function(x){return x;}; if(dot) dot.className='dot '+(on?'on':'off'); if(st) st.textContent= on? sh(Wallet.address) : tt('wallet_not','Not connected'); if(ad) ad.textContent=''; if(btn) btn.textContent= on? tt('wallet_disconnect','Disconnect') : tt('wallet_connect','Connect wallet'); if(on){ hideWalletHelp(); fetchBalances(); startBalPoll(); } else { stopBalPoll(); var wb=$('wbal'); if(wb) wb.textContent=''; } }
var balTimer=null;
function startBalPoll(){ stopBalPoll(); balTimer=setInterval(function(){ if(!Wallet.address){ stopBalPoll(); return; } fetchBalances(); },7000); }
function stopBalPoll(){ if(balTimer){ clearInterval(balTimer); balTimer=null; } }
async function fetchBalances(){ if(!Wallet.address||!sdk()) return; var code=($('asset')&&$('asset').value)||'XLM'; var def=findAsset(code); var wb=$('wbal'); if(!wb){ wb=document.createElement('div'); wb.id='wbal'; wb.className='hint'; var ad=$('waddr'); if(ad&&ad.parentNode) ad.parentNode.appendChild(wb); else return; } try{ var acct=await server().loadAccount(Wallet.address); var bal=balOf(acct.balances,def); wb.textContent=tt('bal_label','Balance')+': '+(bal!=null?trimAmount(bal)+' '+def.code:'0 '+def.code); }catch(e){ wb.textContent=tt('bal_label','Balance')+': 0 '+def.code; } }

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
  var wb=$('wbtn'); if(wb) wb.addEventListener('click',function(){ if(Wallet.address){ Wallet.disconnect(); renderWallet(); } else { Wallet.connect().then(renderWallet); } });
  var sb=$('sendbtn'); if(sb) sb.addEventListener('click',doSend);
  var qb=$('qrbtn'); if(qb) qb.addEventListener('click',doQR);
  var db=$('discbtn'); if(db) db.addEventListener('click',doDisc);
  var pb=$('pdfbtn'); if(pb) pb.addEventListener('click',downloadPDF);
  var ab=$('againbtn'); if(ab) ab.addEventListener('click',reset);
  var rc=$('rcpt'); if(rc) rc.addEventListener('input',validateRcptUI);
  var as=$('asset'); if(as) as.addEventListener('change',fetchBalances);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden && Wallet.address) fetchBalances(); });
  window.addEventListener('focus',function(){ if(Wallet.address) fetchBalances(); });
  if(!sdk()){ toast(t('sdk_missing'),'err'); }
}
function ready(){ if(inited) return; inited=true; init(); }
window.SP={ ready:ready, onLang:function(){ buildPipe(); renderWallet(); validateRcptUI(); var sb=$('sendbtn'); if(sb&&!busy) sb.textContent=t('send_btn'); } };
if(document.readyState!=='loading') ready(); else document.addEventListener('DOMContentLoaded',ready);
})();

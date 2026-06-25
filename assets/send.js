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
    wallet_no_freighter:'Freighter wallet not found.',wallet_wrong_net:'Switch Freighter to Stellar Testnet.',wallet_rejected:'Connection cancelled.',
    wm_pc_t:'Connect on desktop',
    wm_pc_b:'Install the <a href="https://www.freighter.app/" target="_blank" rel="noopener">Freighter</a> browser extension, unlock it and pick your account, then press \u201cConnect wallet\u201d here.',
    wm_pc_cta:'Get Freighter extension',
    wm_mob_t:'Connect on phone',
    wm_mob_b:'Open this page inside the Freighter app: launch Freighter, open its built-in browser (Discover) and paste this link. The wallet connects automatically there.',
    wm_mob_cta:'Copy page link',
    wm_copied:'Link copied',
    wm_close:'Close',
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
    wallet_no_freighter:'Billetera Freighter no encontrada.',wallet_wrong_net:'Cambia Freighter a la Testnet de Stellar.',wallet_rejected:'Conexi\u00f3n cancelada.',
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
    wallet_no_freighter:'Freighter-Wallet nicht gefunden.',wallet_wrong_net:'Stelle Freighter auf das Stellar-Testnet um.',wallet_rejected:'Verbindung abgebrochen.',
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
    wallet_no_freighter:'\u041a\u043e\u0448\u0435\u043b\u0451\u043a Freighter \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d.',wallet_wrong_net:'\u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438\u0442\u0435 Freighter \u043d\u0430 Stellar Testnet.',wallet_rejected:'\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u043e\u0442\u043c\u0435\u043d\u0435\u043d\u043e.',
    wm_pc_t:'\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u043d\u0430 \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u0435',
    wm_pc_b:'\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0435 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u0435 <a href="https://www.freighter.app/" target="_blank" rel="noopener">Freighter</a> \u0434\u043b\u044f \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430, \u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u0443\u0439\u0442\u0435 \u0435\u0433\u043e \u0438 \u0432\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0430\u043a\u043a\u0430\u0443\u043d\u0442, \u0437\u0430\u0442\u0435\u043c \u043d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043a\u043e\u0448\u0435\u043b\u0451\u043a\u00bb \u0437\u0434\u0435\u0441\u044c.',
    wm_pc_cta:'\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c Freighter',
    wm_mob_t:'\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u043d\u0430 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0435',
    wm_mob_b:'\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u044d\u0442\u0443 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0432\u043d\u0443\u0442\u0440\u0438 \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f Freighter: \u0437\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 Freighter, \u043e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u0432\u0441\u0442\u0440\u043e\u0435\u043d\u043d\u044b\u0439 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 (Discover) \u0438 \u0432\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u044d\u0442\u0443 \u0441\u0441\u044b\u043b\u043a\u0443 \u2014 \u043a\u043e\u0448\u0435\u043b\u0451\u043a \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0438\u0442\u0441\u044f \u0442\u0430\u043c \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438.',
    wm_mob_cta:'\u0421\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u0441\u044b\u043b\u043a\u0443',
    wm_copied:'\u0421\u0441\u044b\u043b\u043a\u0430 \u0441\u043a\u043e\u043f\u0438\u0440\u043e\u0432\u0430\u043d\u0430',
    wm_close:'\u0417\u0430\u043a\u0440\u044b\u0442\u044c',
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
    wallet_no_freighter:'\u0413\u0430\u043c\u0430\u043d\u0435\u0446\u044c Freighter \u043d\u0435 \u0437\u043d\u0430\u0439\u0434\u0435\u043d\u043e.',wallet_wrong_net:'\u041f\u0435\u0440\u0435\u043c\u043a\u043d\u0456\u0442\u044c Freighter \u043d\u0430 Stellar Testnet.',wallet_rejected:'\u041f\u0456\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u043d\u044f \u0441\u043a\u0430\u0441\u043e\u0432\u0430\u043d\u043e.',
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
/* guarantee
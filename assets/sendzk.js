/* Zerolyn — send page ZK: bind a REAL Groth16 compliance proof to the payment
   you actually make on this page, and verify it ON-CHAIN on the live Soroban
   verifier (BLS12-381). The proof is GATED on a completed Stellar payment and
   attests: amount >= 1, amount <= your balance, amount <= a public compliance
   limit, and amount === the paid amount — without revealing amount or balance.

   Honesty model:
   - The Prove & verify button stays DISABLED until you actually send a payment
     above (a real Freighter tx, or a clearly-labelled demo). A live hint under
     the button explains why.
   - REAL payment -> prove the exact sent amount, fetch your real on-chain
     balance from Horizon for a genuine solvency statement
     (balance_before = balance_now + amount_sent), bind it via the public paid
     input (paid === amount in-circuit), and link the payment tx next to result.
   - DEMO payment -> still run the real on-chain pairing check, but label the
     result a demo and ask you to connect Freighter for a real transfer.

   Standalone: reads form fields, wallet readout and the receipt panel from the
   DOM, so it never couples to send.js internals. */
(function(){
'use strict';
var CFG=window.SP_CONFIG||{};
var toast=window.SP_toast||function(){};
var t=window.SP_t||function(k){return k;};
var $=function(id){return document.getElementById(id);};
var busy=false;

var RPC_URL=CFG.sorobanRpc||'https://soroban-testnet.stellar.org';
var NET_PASS=CFG.networkPassphrase||'Test SDF Network ; September 2008';
var G2ORDER=CFG.g2Order||'c1c0';
var ADMIN=CFG.adminAddress;
var HORIZON=CFG.horizon||'https://horizon-testnet.stellar.org';
var LIMIT_UNITS=CFG.complianceLimit||100000;   // public policy cap, in asset units

/* i18n (runs after app.js) */
(function(){ if(!window.I18N) return; function M(l,o){ window.I18N[l]=Object.assign(window.I18N[l]||{},o); }
  M('en',{zk_h:'Prove this transfer in zero-knowledge',zk_lead:'Send a real payment on Stellar Testnet above — then generate a Groth16 proof that THAT transfer is under the public compliance limit and within your balance (your balance stays hidden) and verify it ON-CHAIN on our Soroban verifier (BLS12-381 pairing inside Stellar’s host).',zk_btn:'Prove & verify on-chain',zk_busy:'Proving in browser…',zk_busy2:'Verifying on-chain…',zk_proofok:'Groth16 / BLS12-381 proof generated',zk_done:'This payment proven compliant & solvent — verified ON-CHAIN',zk_failed:'On-chain verification failed',zk_over:'This amount is above the public compliance limit ({l}) — the proof correctly refuses it.',zk_noart:'ZK prover artifacts not built yet. Run scripts/setup.sh, then set_vk on the verifier. Once installed, this verifies on-chain.',zk_sdk:'Stellar SDK or snarkjs not loaded — reload the page.',zk_amount:'Enter an amount greater than zero.',zk_stmt:'Public statement: amount ≤ {l} and amount ≤ balance; the paid amount is public and equals this amount. Hidden: your balance.',zk_contract:'Verifier contract',zk_needpay:'Send a payment above first — the proof attests that exact transfer.',zk_gate:'Send a payment above to enable — the proof binds to your actual transfer.',zk_gate_ready:'Ready — the proof will attest your on-chain payment {tx}…',zk_gate_ready_demo:'Ready (demo) — connect Freighter & send a real payment to bind a real transfer.',zk_bind:'Bound to the amount you just sent ({a} {c}) via the public input paid (paid === amount in-circuit).',zk_bind_demo:'Demo: proving the amount just sent ({a} {c}) — connect a wallet to bind it to a real on-chain payment.',zk_balreal:'Solvency proven against your real on-chain balance (Horizon).',zk_real_done:'This payment proven compliant & solvent in zero-knowledge — verified ON-CHAIN',zk_demo_done:'Groth16 proof verified ON-CHAIN — labelled demo. Connect Freighter & send a real Testnet payment to bind the proof to a real transfer.',zk_paytx:'Payment transaction',zk_demo_solv:'Demo: solvency uses a placeholder balance (balance set equal to amount) — connect Freighter and send a real payment to prove it against your real on-chain balance.'});
  M('ru',{zk_h:'Докажите перевод в zero-knowledge',zk_lead:'Сначала отправьте реальный платёж в Stellar Testnet выше — затем сгенерируйте Groth16-доказательство, что ИМЕННО этот перевод не превышает публичный комплаенс-лимит и укладывается в ваш баланс (баланс скрыт), и проверьте его ОНЧЕЙН на нашем верификаторе Soroban (спаривание BLS12-381 в хосте Stellar).',zk_btn:'Доказать и проверить ончейн',zk_busy:'Доказываю в браузере…',zk_busy2:'Проверяю ончейн…',zk_proofok:'Доказательство Groth16 / BLS12-381 сгенерировано',zk_done:'Платёж доказан как комплаентный и обеспеченный — проверено ОНЧЕЙН',zk_failed:'Ончейн-проверка не пройдена',zk_over:'Сумма выше публичного комплаенс-лимита ({l}) — доказательство корректно её отклоняет.',zk_noart:'Артефакты ZK-прувера ещё не собраны. Запустите scripts/setup.sh, затем set_vk на верификаторе. После установки проверка пойдёт ончейн.',zk_sdk:'Stellar SDK или snarkjs не загружены — обновите страницу.',zk_amount:'Введите сумму больше нуля.',zk_stmt:'Публичное утверждение: сумма ≤ {l} и сумма ≤ баланс; сумма paid публична и равна этой сумме. Скрыто: баланс.',zk_contract:'Контракт-верификатор',zk_needpay:'Сначала отправьте платёж выше — доказательство подтверждает именно этот перевод.',zk_gate:'Отправьте платёж выше, чтобы активировать — доказательство привязывается к вашему реальному переводу.',zk_gate_ready:'Готово — доказательство подтвердит ваш ончейн-платёж {tx}…',zk_gate_ready_demo:'Готово (демо) — подключите Freighter и отправьте реальный платёж, чтобы привязать настоящий перевод.',zk_bind:'Привязано к только что отправленной сумме ({a} {c}) через публичный вход paid (paid === amount в схеме).',zk_bind_demo:'Демо: доказываю только что отправленную сумму ({a} {c}) — подключите кошелёк, чтобы привязать к реальному ончейн-платежу.',zk_balreal:'Платёжеспособность доказана против вашего реального ончейн-баланса (Horizon).',zk_real_done:'Этот платёж доказан как комплаентный и обеспеченный в zero-knowledge — проверено ОНЧЕЙН',zk_demo_done:'Доказательство Groth16 проверено ОНЧЕЙН — помеченное демо. Подключите Freighter и отправьте реальный платёж в Testnet, чтобы привязать доказательство к настоящему переводу.',zk_paytx:'Транзакция платежа',zk_demo_solv:'Демо: платёжеспособность использует условный баланс (баланс равен сумме) — подключите Freighter и отправьте реальный платёж, чтобы доказать её против вашего реального ончейн-баланса.'});
  M('es',{zk_h:'Demuestra esta transferencia en conocimiento cero',zk_lead:'Envía primero un pago real en Stellar Testnet arriba — luego genera una prueba Groth16 de que ESA transferencia está por debajo del límite público de cumplimiento y dentro de tu saldo (tu saldo permanece oculto) y verifícala ON-CHAIN en nuestro verificador Soroban (BLS12-381).',zk_btn:'Probar y verificar on-chain',zk_busy:'Probando en el navegador…',zk_busy2:'Verificando on-chain…',zk_proofok:'Prueba Groth16 / BLS12-381 generada',zk_done:'Pago demostrado conforme y solvente — verificado ON-CHAIN',zk_failed:'La verificación on-chain falló',zk_over:'Este importe supera el límite público de cumplimiento ({l}) — la prueba lo rechaza correctamente.',zk_noart:'Artefactos del probador ZK aún no compilados. Ejecuta scripts/setup.sh y luego set_vk.',zk_sdk:'Stellar SDK o snarkjs no cargados — recarga la página.',zk_amount:'Introduce un importe mayor que cero.',zk_stmt:'Enunciado público: importe ≤ {l} e importe ≤ saldo; el importe pagado es público e igual a este importe. Oculto: tu saldo.',zk_contract:'Contrato verificador',zk_needpay:'Envía primero un pago arriba — la prueba certifica esa transferencia exacta.',zk_gate:'Envía un pago arriba para activar — la prueba se vincula a tu transferencia real.',zk_gate_ready:'Listo — la prueba certificará tu pago on-chain {tx}…',zk_gate_ready_demo:'Listo (demo) — conecta Freighter y envía un pago real para vincular una transferencia real.',zk_bind:'Vinculado al importe que acabas de enviar ({a} {c}) mediante la entrada pública paid (paid === amount en el circuito).',zk_bind_demo:'Demo: probando el importe recién enviado ({a} {c}) — conecta una billetera para vincularlo a un pago real on-chain.',zk_balreal:'Solvencia probada contra tu saldo on-chain real (Horizon).',zk_real_done:'Pago demostrado conforme y solvente en conocimiento cero — verificado ON-CHAIN',zk_demo_done:'Prueba Groth16 verificada ON-CHAIN — demo etiquetada. Conecta Freighter y envía un pago real en Testnet para vincular la prueba a una transferencia real.',zk_paytx:'Transacción de pago',zk_demo_solv:'Demo: la solvencia usa un saldo de marcador de posición (saldo igual al importe) — conecta Freighter y envía un pago real para probarla contra tu saldo on-chain real.'});
  M('de',{zk_h:'Beweise diese Überweisung in Zero-Knowledge',zk_lead:'Sende oben zuerst eine echte Zahlung im Stellar Testnet — erzeuge dann einen Groth16-Beweis, dass GENAU diese Überweisung unter dem öffentlichen Compliance-Limit und innerhalb deines Guthabens liegt (dein Guthaben bleibt verborgen) und verifiziere ihn ON-CHAIN auf unserem Soroban-Verifier (BLS12-381).',zk_btn:'Beweisen & on-chain prüfen',zk_busy:'Beweise im Browser…',zk_busy2:'Prüfe on-chain…',zk_proofok:'Groth16 / BLS12-381 Beweis erzeugt',zk_done:'Zahlung als konform & solvent bewiesen — ON-CHAIN verifiziert',zk_failed:'On-chain-Verifikation fehlgeschlagen',zk_over:'Dieser Betrag liegt über dem öffentlichen Compliance-Limit ({l}) — der Beweis lehnt ihn korrekt ab.',zk_noart:'ZK-Prover-Artefakte noch nicht gebaut. Führe scripts/setup.sh aus, dann set_vk.',zk_sdk:'Stellar SDK oder snarkjs nicht geladen — Seite neu laden.',zk_amount:'Gib einen Betrag größer als null ein.',zk_stmt:'Öffentliche Aussage: Betrag ≤ {l} und Betrag ≤ Guthaben; der gezahlte Betrag ist öffentlich und gleich diesem Betrag. Verborgen: dein Guthaben.',zk_contract:'Verifier-Vertrag',zk_needpay:'Sende oben zuerst eine Zahlung — der Beweis bestätigt genau diese Überweisung.',zk_gate:'Sende oben eine Zahlung zum Aktivieren — der Beweis bindet an deine echte Überweisung.',zk_gate_ready:'Bereit — der Beweis bestätigt deine on-chain-Zahlung {tx}…',zk_gate_ready_demo:'Bereit (Demo) — verbinde Freighter & sende eine echte Zahlung, um eine echte Überweisung zu binden.',zk_bind:'An den soeben gesendeten Betrag ({a} {c}) gebunden über den öffentlichen Input paid (paid === amount im Circuit).',zk_bind_demo:'Demo: beweise den soeben gesendeten Betrag ({a} {c}) — verbinde eine Wallet, um ihn an eine echte On-Chain-Zahlung zu binden.',zk_balreal:'Solvenz gegen dein echtes On-Chain-Guthaben bewiesen (Horizon).',zk_real_done:'Diese Zahlung als konform & solvent in Zero-Knowledge bewiesen — ON-CHAIN verifiziert',zk_demo_done:'Groth16-Beweis ON-CHAIN verifiziert — markierte Demo. Verbinde Freighter & sende eine echte Testnet-Zahlung, um den Beweis an eine echte Überweisung zu binden.',zk_paytx:'Zahlungstransaktion',zk_demo_solv:'Demo: Solvenz nutzt einen Platzhalter-Kontostand (Kontostand gleich Betrag) — verbinde Freighter und sende eine echte Zahlung, um sie gegen dein echtes On-Chain-Guthaben zu beweisen.'});
  M('uk',{zk_h:'Доведіть переказ у zero-knowledge',zk_lead:'Спершу надішліть реальний платіж у Stellar Testnet вище — потім згенеруйте Groth16-доведення, що САМЕ цей переказ не перевищує публічний комплаєнс-ліміт і вкладається у ваш баланс (баланс прихований), і перевірте його ОНЧЕЙН на нашому верифікаторі Soroban (BLS12-381).',zk_btn:'Довести і перевірити ончейн',zk_busy:'Доводжу в браузері…',zk_busy2:'Перевіряю ончейн…',zk_proofok:'Доведення Groth16 / BLS12-381 згенеровано',zk_done:'Платіж доведено як комплаєнтний і забезпечений — перевірено ОНЧЕЙН',zk_failed:'Ончейн-перевірка не пройдена',zk_over:'Сума вища за публічний комплаєнс-ліміт ({l}) — доведення коректно її відхиляє.',zk_noart:'Артефакти ZK-прувера ще не зібрані. Запустіть scripts/setup.sh, потім set_vk.',zk_sdk:'Stellar SDK або snarkjs не завантажені — оновіть сторінку.',zk_amount:'Введіть суму більше нуля.',zk_stmt:'Публічне твердження: сума ≤ {l} і сума ≤ баланс; сума paid публічна та дорівнює цій сумі. Приховано: баланс.',zk_contract:'Контракт-верифікатор',zk_needpay:'Спершу надішліть платіж вище — доведення підтверджує саме цей переказ.',zk_gate:'Надішліть платіж вище, щоб активувати — доведення прив’язується до вашого реального переказу.',zk_gate_ready:'Готово — доведення підтвердить ваш ончейн-платіж {tx}…',zk_gate_ready_demo:'Готово (демо) — підключіть Freighter і надішліть реальний платіж, щоб прив’язати справжній переказ.',zk_bind:'Прив’язано до щойно надісланої суми ({a} {c}) через публічний вхід paid (paid === amount у схемі).',zk_bind_demo:'Демо: доводжу щойно надіслану суму ({a} {c}) — підключіть гаманець, щоб прив’язати до реального ончейн-платежу.',zk_balreal:'Платоспроможність доведено проти вашого реального ончейн-балансу (Horizon).',zk_real_done:'Цей платіж доведено як комплаєнтний і забезпечений у zero-knowledge — перевірено ОНЧЕЙН',zk_demo_done:'Доведення Groth16 перевірено ОНЧЕЙН — помічене демо. Підключіть Freighter і надішліть реальний платіж у Testnet, щоб прив’язати доведення до справжнього переказу.',zk_paytx:'Транзакція платежу',zk_demo_solv:'Демо: платоспроможність використовує умовний баланс (баланс дорівнює сумі) — підключіть Freighter і надішліть реальний платіж, щоб довести її проти вашого реального ончейн-балансу.'});
})();

function sdk(){ return window.StellarSdk; }
function rpcMod(){ var S=sdk(); return S.rpc||S.SorobanRpc; }
function server(){ var R=rpcMod(); return new R.Server(RPC_URL,{allowHttp:RPC_URL.indexOf('https')!==0}); }
function isSimErr(sim){ var R=rpcMod(); if(R&&R.Api&&R.Api.isSimulationError) return R.Api.isSimulationError(sim); return !!(sim&&sim.error); }
function fp(n){ return BigInt(n).toString(16).padStart(96,'0'); }
function g1hex(P){ return fp(P[0])+fp(P[1]); }
function g2hex(P){ var x=P[0],y=P[1]; return G2ORDER==='c1c0'?fp(x[1])+fp(x[0])+fp(y[1])+fp(y[0]):fp(x[0])+fp(x[1])+fp(y[0])+fp(y[1]); }
function fr32(n){ return BigInt(n).toString(16).padStart(64,'0'); }
function hexToBytes(h){ var a=new Uint8Array(h.length/2); for(var i=0;i<a.length;i++) a[i]=parseInt(h.substr(i*2,2),16); return a; }
function scBytes(h){ return sdk().xdr.ScVal.scvBytes(hexToBytes(h)); }
function proofScVal(a,b,c){ var X=sdk().xdr; return X.ScVal.scvMap([
  new X.ScMapEntry({key:X.ScVal.scvSymbol('a'),val:scBytes(a)}),
  new X.ScMapEntry({key:X.ScVal.scvSymbol('b'),val:scBytes(b)}),
  new X.ScMapEntry({key:X.ScVal.scvSymbol('c'),val:scBytes(c)})
]); }
function inputsScVal(sigs){ return sdk().xdr.ScVal.scvVec(sigs.map(function(s){ return scBytes(fr32(s)); })); }

function out(){ return $('zkout'); }
function clear(){ var o=out(); if(o){ o.innerHTML=''; o.style.display=''; } }
function line(cls,txt){ var o=out(); if(!o) return; var d=document.createElement('div'); d.className='ln '+(cls||''); d.textContent=txt; o.appendChild(d); return d; }

function connectedAddr(){ var el=$('waddr'); var a=el&&el.textContent&&el.textContent.trim(); return /^G[A-Z2-7]{55}$/.test(a||'')?a:null; }
function toStroops(x){ return BigInt(Math.round(Number(x)*1e7)); }

/* ---- payment coupling (DOM only) ---- */
function receiptVisible(){ var r=$('receipt'); if(!r) return false; var st; try{ st=getComputedStyle(r).display; }catch(e){ st=r.style.display; } return st!=='none'; }
function txText(){ var el=$('r_tx'); return el?((el.textContent||'').trim()):''; }
function txHref(){ var el=$('txview'); return el&&el.getAttribute('href')||''; }
function paymentDone(){ return receiptVisible() && !!txText(); }
function isRealPayment(){ var tx=(txText()||'').toLowerCase(); var dep=(CFG.verifierTxHash||'').toLowerCase(); var dem=(CFG.demoTxHash||'').toLowerCase(); return /^[0-9a-f]{64}$/.test(tx) && tx!==dep && tx!==dem && !!connectedAddr(); }
function assetCode(){ var r=$('r_amt'); var s=r&&(r.textContent||''); var m=s&&s.match(/\b(XLM|USDC|EURC)\b/); if(m) return m[1]; var sel=$('asset'); if(sel&&sel.value){ var v=String(sel.value); var mm=v.match(/\b(XLM|USDC|EURC)\b/); if(mm) return mm[1]; return v.split(':')[0]; } return 'XLM'; }
function sentAmountUnits(){ var r=$('r_amt'); var s=r&&(r.textContent||''); var m=s&&s.match(/([0-9]+(?:[.,][0-9]+)?)/); if(m) return parseFloat(m[1].replace(',','.')); var a=$('amt'); return a?parseFloat(a.value||'0'):0; }
async function fetchBalanceUnits(addr,code){ try{ var res=await fetch(HORIZON+'/accounts/'+encodeURIComponent(addr)); if(!res.ok) return null; var j=await res.json(); var bals=(j&&j.balances)||[]; for(var i=0;i<bals.length;i++){ var bb=bals[i]; if((code==='XLM'||!code)&&bb.asset_type==='native') return parseFloat(bb.balance); if(bb.asset_code===code) return parseFloat(bb.balance); } return null; }catch(e){ return null; } }

async function run(){
  if(busy) return;
  var S=sdk();
  if(!S||!window.snarkjs){ toast(t('zk_sdk'),'err'); return; }
  if(!paymentDone()){ toast(t('zk_needpay'),'err'); refreshGate(); return; }
  var real=isRealPayment();
  var amtF=sentAmountUnits();
  if(!(amtF>0)){ toast(t('zk_amount'),'err'); return; }
  var b=$('zkbtn'); busy=true; b.disabled=true; var old=b.textContent;
  clear();
  var amount=toStroops(amtF);
  var limit=toStroops(LIMIT_UNITS);
  if(amount>limit){ line('warn',t('zk_over').replace('{l}',String(LIMIT_UNITS))); busy=false; b.disabled=false; b.textContent=old; refreshGate(); return; }
  var code=assetCode();
  var from=connectedAddr();
  // Genuine solvency: amount <= balance held at time of payment.
  // balance_before = balance_now + amount_sent (real on-chain data via Horizon).
  var balBeforeUnits=amtF, realBal=false;
  if(real && from){ var balNow=await fetchBalanceUnits(from,code); if(balNow!=null){ balBeforeUnits=balNow+amtF; realBal=true; } }
  var balance=toStroops(balBeforeUnits);
  line('mut',t('zk_stmt').replace('{l}',String(LIMIT_UNITS)));
  line('mut',(real?t('zk_bind'):t('zk_bind_demo')).replace('{a}',String(amtF)).replace('{c}',code));
  b.textContent=t('zk_busy');
  try{
    var r=await window.snarkjs.groth16.fullProve({amount:amount.toString(),balance:balance.toString(),limit:limit.toString(),paid:amount.toString()},'assets/zk/transfer.wasm','assets/zk/transfer_final.zkey');
    line('ok','✓ '+t('zk_proofok'));
    b.textContent=t('zk_busy2');
    var a=g1hex(r.proof.pi_a), bb=g2hex(r.proof.pi_b), c=g1hex(r.proof.pi_c);
    var contract=new S.Contract(CFG.verifierContractId);
    var op=contract.call('verify', proofScVal(a,bb,c), inputsScVal(r.publicSignals));
    var srv=server();
    var srcAddr=from||ADMIN;
    var src=await srv.getAccount(srcAddr);
    var tx=new S.TransactionBuilder(src,{fee:'1000000',networkPassphrase:NET_PASS}).addOperation(op).setTimeout(60).build();
    var sim=await srv.simulateTransaction(tx);
    if(isSimErr(sim)){ line('er','✗ '+t('zk_failed')); line('mut',String(sim.error||'').slice(0,180)); busy=false; b.disabled=false; b.textContent=old; refreshGate(); return; }
    var ok=true; try{ if(sim.result&&sim.result.retval) ok=(S.scValToNative(sim.result.retval)===true); }catch(e){ ok=true; }
    if(!ok){ line('er','✗ '+t('zk_failed')); busy=false; b.disabled=false; b.textContent=old; refreshGate(); return; }
    if(realBal) line('mut',t('zk_balreal')); else line('warn',t('zk_demo_solv'));
    var doneMsg=real?t('zk_real_done'):t('zk_demo_done');
    line('ok','✅ '+doneMsg);
    if(real){ var href=txHref()||((CFG.explorer||'')+'/tx/'+(txText()||'')); var pl=document.createElement('a'); pl.className='link-ext'; pl.target='_blank'; pl.rel='noopener'; pl.href=href; pl.textContent=t('zk_paytx')+' ↗'; out().appendChild(pl); }
    var ex=document.createElement('a'); ex.className='link-ext'; ex.target='_blank'; ex.rel='noopener'; ex.href=(CFG.explorer||'')+'/contract/'+CFG.verifierContractId; ex.textContent=t('zk_contract')+' ↗'; out().appendChild(ex);
    if(window.SP_Sound&&window.SP_Sound.success) window.SP_Sound.success();
    toast(doneMsg,'ok');
  }catch(e){
    var em=(e&&e.message)?e.message:String(e);
    var art=/fetch|wasm|zkey|404|network|not.?found|failed to (load|fetch)/i.test(em);
    if(art){ line('warn',t('zk_noart')); } else { line('er','✗ '+t('zk_failed')); line('mut',em.slice(0,200)); }
  }finally{ busy=false; b.disabled=false; b.textContent=old; refreshGate(); }
}

/* ---- gating UI ---- */
function gateHint(){ var b=$('zkbtn'); if(!b) return null; var h=$('zkgate'); if(!h){ h=document.createElement('div'); h.id='zkgate'; h.className='hint'; if(b.parentNode) b.parentNode.insertBefore(h,b.nextSibling); } return h; }
function refreshGate(){ var b=$('zkbtn'); if(!b||busy) return; var h=gateHint(); if(paymentDone()){ b.disabled=false; b.classList.remove('is-disabled'); if(h){ var sx=(txText()||'').slice(0,10); h.textContent=(isRealPayment()?t('zk_gate_ready'):t('zk_gate_ready_demo')).replace('{tx}',sx); } } else { b.disabled=true; b.classList.add('is-disabled'); if(h) h.textContent=t('zk_gate'); } }
function wire(){ var b=$('zkbtn'); if(b&&!b._wired){ b._wired=1; b.addEventListener('click',run); } refreshGate(); var r=$('receipt'); if(r&&window.MutationObserver){ try{ new MutationObserver(refreshGate).observe(r,{attributes:true,attributeFilter:['style','class'],childList:true,subtree:true,characterData:true}); }catch(e){} } setInterval(refreshGate,1200); }
if(document.readyState!=='loading') wire(); else document.addEventListener('DOMContentLoaded',wire);
})();

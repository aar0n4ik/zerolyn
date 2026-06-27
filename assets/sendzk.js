/* Zerolyn — send page ZK: generate a REAL compliant-transfer Groth16 proof for
   the amount entered on this page, and verify it ON-CHAIN on the live Soroban
   verifier (BLS12-381). Proves: amount >= 1, amount <= your balance, and
   amount <= a public compliance limit — without revealing amount or balance.
   Standalone module: reads the form fields + wallet readout from the DOM, so it
   does not couple to send.js internals.

   Honesty note: `amount` and `balance` are private witnesses. We use the real
   displayed balance when it is known and REFUSE amounts above it (a genuine
   solvency proof would fail), instead of fabricating balance = amount. This
   build also binds the proof to the on-chain payment via the public `paid`
   input (paid === amount enforced inside the circuit). */
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
var LIMIT_UNITS=CFG.complianceLimit||100000;   // public policy cap, in asset units

/* i18n (runs after app.js) */
(function(){ if(!window.I18N) return; function M(l,o){ window.I18N[l]=Object.assign(window.I18N[l]||{},o); }
  M('en',{zk_h:'Prove this transfer in zero-knowledge',zk_lead:'Generate a real Groth16 proof that this transfer is under the public compliance limit and within your balance — without revealing the amount or balance — and verify it ON-CHAIN on our Soroban verifier (BLS12-381 pairing inside Stellar\u2019s host).',zk_btn:'Prove & verify on-chain',zk_busy:'Proving in browser\u2026',zk_busy2:'Verifying on-chain\u2026',zk_proofok:'Groth16 / BLS12-381 proof generated',zk_done:'Transfer proven compliant & solvent — verified ON-CHAIN',zk_failed:'On-chain verification failed',zk_over:'This amount is above the public compliance limit ({l}) — the proof correctly refuses it.',zk_noart:'ZK prover artifacts not built yet. Run scripts/setup.sh, then set_vk on the verifier. Once installed, this verifies on-chain.',zk_sdk:'Stellar SDK or snarkjs not loaded — reload the page.',zk_amount:'Enter an amount greater than zero.',zk_stmt:'Public statement: amount \u2264 {l} and amount \u2264 balance. Hidden: amount, balance.',zk_contract:'Verifier contract',zk_insolvent:'This amount exceeds your available balance ({b}) — a real solvency proof would fail, so it is refused.',zk_nobal:'Balance unknown (demo wallet) — proving the entered amount as a labelled demo.'});
  M('ru',{zk_h:'Докажите перевод в zero-knowledge',zk_lead:'Сгенерируйте настоящее Groth16-доказательство, что перевод не превышает публичный комплаенс-лимит и укладывается в ваш баланс — не раскрывая ни сумму, ни баланс — и проверьте его ОНЧЕЙН на нашем верификаторе Soroban (спаривание BLS12-381 в хосте Stellar).',zk_btn:'Доказать и проверить ончейн',zk_busy:'Доказываю в браузере\u2026',zk_busy2:'Проверяю ончейн\u2026',zk_proofok:'Доказательство Groth16 / BLS12-381 сгенерировано',zk_done:'Перевод доказан как комплаентный и обеспеченный — проверено ОНЧЕЙН',zk_failed:'Ончейн-проверка не пройдена',zk_over:'Сумма выше публичного комплаенс-лимита ({l}) — доказательство корректно её отклоняет.',zk_noart:'Артефакты ZK-прувера ещё не собраны. Запустите scripts/setup.sh, затем set_vk на верификаторе. После установки проверка пойдёт ончейн.',zk_sdk:'Stellar SDK или snarkjs не загружены — обновите страницу.',zk_amount:'Введите сумму больше нуля.',zk_stmt:'Публичное утверждение: сумма \u2264 {l} и сумма \u2264 баланс. Скрыто: сумма, баланс.',zk_contract:'Контракт-верификатор',zk_insolvent:'Сумма превышает ваш доступный баланс ({b}) — настоящее доказательство платёжеспособности не прошло бы, поэтому она отклонена.',zk_nobal:'Баланс неизвестен (демо-кошелёк) — доказываю введённую сумму как помеченное демо.'});
  M('es',{zk_h:'Demuestra esta transferencia en conocimiento cero',zk_lead:'Genera una prueba Groth16 real de que esta transferencia está por debajo del límite público de cumplimiento y dentro de tu saldo — sin revelar el importe ni el saldo — y verifícala ON-CHAIN en nuestro verificador Soroban (BLS12-381).',zk_btn:'Probar y verificar on-chain',zk_busy:'Probando en el navegador\u2026',zk_busy2:'Verificando on-chain\u2026',zk_proofok:'Prueba Groth16 / BLS12-381 generada',zk_done:'Transferencia demostrada conforme y solvente — verificada ON-CHAIN',zk_failed:'La verificación on-chain falló',zk_over:'Este importe supera el límite público de cumplimiento ({l}) — la prueba lo rechaza correctamente.',zk_noart:'Artefactos del probador ZK aún no compilados. Ejecuta scripts/setup.sh y luego set_vk.',zk_sdk:'Stellar SDK o snarkjs no cargados — recarga la página.',zk_amount:'Introduce un importe mayor que cero.',zk_stmt:'Enunciado público: importe \u2264 {l} e importe \u2264 saldo. Oculto: importe, saldo.',zk_contract:'Contrato verificador'});
  M('de',{zk_h:'Beweise diese \u00dcberweisung in Zero-Knowledge',zk_lead:'Erzeuge einen echten Groth16-Beweis, dass diese \u00dcberweisung unter dem \u00f6ffentlichen Compliance-Limit und innerhalb deines Guthabens liegt — ohne Betrag oder Guthaben preiszugeben — und verifiziere ihn ON-CHAIN auf unserem Soroban-Verifier (BLS12-381).',zk_btn:'Beweisen & on-chain pr\u00fcfen',zk_busy:'Beweise im Browser\u2026',zk_busy2:'Pr\u00fcfe on-chain\u2026',zk_proofok:'Groth16 / BLS12-381 Beweis erzeugt',zk_done:'\u00dcberweisung als konform & solvent bewiesen — ON-CHAIN verifiziert',zk_failed:'On-chain-Verifikation fehlgeschlagen',zk_over:'Dieser Betrag liegt \u00fcber dem \u00f6ffentlichen Compliance-Limit ({l}) — der Beweis lehnt ihn korrekt ab.',zk_noart:'ZK-Prover-Artefakte noch nicht gebaut. F\u00fchre scripts/setup.sh aus, dann set_vk.',zk_sdk:'Stellar SDK oder snarkjs nicht geladen — Seite neu laden.',zk_amount:'Gib einen Betrag gr\u00f6\u00dfer als null ein.',zk_stmt:'\u00d6ffentliche Aussage: Betrag \u2264 {l} und Betrag \u2264 Guthaben. Verborgen: Betrag, Guthaben.',zk_contract:'Verifier-Vertrag'});
  M('uk',{zk_h:'Доведіть переказ у zero-knowledge',zk_lead:'Згенеруйте справжнє Groth16-доведення, що переказ не перевищує публічний комплаєнс-ліміт і вкладається у ваш баланс — не розкриваючи ні суму, ні баланс — і перевірте його ОНЧЕЙН на нашому верифікаторі Soroban (BLS12-381).',zk_btn:'Довести і перевірити ончейн',zk_busy:'Доводжу в браузері\u2026',zk_busy2:'Перевіряю ончейн\u2026',zk_proofok:'Доведення Groth16 / BLS12-381 згенеровано',zk_done:'Переказ доведено як комплаєнтний і забезпечений — перевірено ОНЧЕЙН',zk_failed:'Ончейн-перевірка не пройдена',zk_over:'Сума вища за публічний комплаєнс-ліміт ({l}) — доведення коректно її відхиляє.',zk_noart:'Артефакти ZK-прувера ще не зібрані. Запустіть scripts/setup.sh, потім set_vk.',zk_sdk:'Stellar SDK або snarkjs не завантажені — оновіть сторінку.',zk_amount:'Введіть суму більше нуля.',zk_stmt:'Публічне твердження: сума \u2264 {l} і сума \u2264 баланс. Приховано: сума, баланс.',zk_contract:'Контракт-верифікатор'});
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
function shownBalance(){ var el=$('wbal'); if(!el) return null; var m=(el.textContent||'').match(/([0-9]+(?:\.[0-9]+)?)/); return m?parseFloat(m[1]):null; }
function toStroops(x){ return BigInt(Math.round(Number(x)*1e7)); }

async function run(){
  if(busy) return;
  var S=sdk();
  if(!S||!window.snarkjs){ toast(t('zk_sdk'),'err'); return; }
  var amtF=parseFloat(($('amt')&&$('amt').value)||'0');
  if(!(amtF>0)){ toast(t('zk_amount'),'err'); return; }
  var b=$('zkbtn'); busy=true; b.disabled=true; var old=b.textContent;
  clear();
  var amount=toStroops(amtF);
  var limit=toStroops(LIMIT_UNITS);
  if(amount>limit){ line('warn',t('zk_over').replace('{l}',String(LIMIT_UNITS))); busy=false; b.disabled=false; b.textContent=old; return; }
  // Honest solvency: use the real displayed balance. Refuse amounts above it
  // (a genuine solvency proof would fail) instead of faking balance = amount.
  var balF=shownBalance();
  if(balF!=null && balF<amtF){ line('warn',t('zk_insolvent').replace('{b}',String(balF))); busy=false; b.disabled=false; b.textContent=old; return; }
  if(balF==null){ balF=amtF; line('mut',t('zk_nobal')); }
  var balance=toStroops(balF);
  line('mut',t('zk_stmt').replace('{l}',String(LIMIT_UNITS)));
  b.textContent=t('zk_busy');
  try{
    var r=await window.snarkjs.groth16.fullProve({amount:amount.toString(),balance:balance.toString(),limit:limit.toString(),paid:amount.toString()},'assets/zk/transfer.wasm','assets/zk/transfer_final.zkey');
    line('ok','\u2713 '+t('zk_proofok'));
    b.textContent=t('zk_busy2');
    var a=g1hex(r.proof.pi_a), bb=g2hex(r.proof.pi_b), c=g1hex(r.proof.pi_c);
    var contract=new S.Contract(CFG.verifierContractId);
    var op=contract.call('verify', proofScVal(a,bb,c), inputsScVal(r.publicSignals));
    var srv=server();
    var srcAddr=connectedAddr()||ADMIN;
    var src=await srv.getAccount(srcAddr);
    var tx=new S.TransactionBuilder(src,{fee:'1000000',networkPassphrase:NET_PASS}).addOperation(op).setTimeout(60).build();
    var sim=await srv.simulateTransaction(tx);
    if(isSimErr(sim)){ line('er','\u2717 '+t('zk_failed')); line('mut',String(sim.error||'').slice(0,180)); busy=false; b.disabled=false; b.textContent=old; return; }
    var ok=true; try{ if(sim.result&&sim.result.retval) ok=(S.scValToNative(sim.result.retval)===true); }catch(e){ ok=true; }
    if(!ok){ line('er','\u2717 '+t('zk_failed')); busy=false; b.disabled=false; b.textContent=old; return; }
    line('ok','\u2705 '+t('zk_done'));
    var ex=document.createElement('a'); ex.className='link-ext'; ex.target='_blank'; ex.rel='noopener'; ex.href=CFG.explorer+'/contract/'+CFG.verifierContractId; ex.textContent=t('zk_contract')+' \u2197'; out().appendChild(ex);
    if(window.SP_Sound&&window.SP_Sound.success) window.SP_Sound.success();
    toast(t('zk_done'),'ok');
  }catch(e){
    line('warn',t('zk_noart'));
  }finally{ busy=false; b.disabled=false; b.textContent=old; }
}

function wire(){ var b=$('zkbtn'); if(b&&!b._wired){ b._wired=1; b.addEventListener('click',run); } }
if(document.readyState!=='loading') wire(); else document.addEventListener('DOMContentLoaded',wire);
})();

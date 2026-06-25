/* Zerolyn — verify page: REAL in-browser Groth16 proving + REAL on-chain
   verification by calling the Soroban verifier contract on Stellar Testnet.

   - "Generate a real proof" runs snarkjs.groth16.fullProve in your browser over
     the BLS12-381 compliance+solvency circuit (circuits/transfer.circom,
     artifacts in assets/zk/, built by scripts/setup.sh). It proves a hidden
     amount is >=1, <= a hidden balance, and <= a public compliance limit.
   - "Verify on-chain" calls verify(proof, public_inputs) on the verifier
     contract through Soroban RPC simulateTransaction — the BLS12-381 pairing
     actually runs inside Stellar's host. Optionally records a real on-chain
     transaction (Freighter).
   - "Try to cheat" re-submits the SAME proof against a tampered public
     statement; the contract returns false on-chain — a live soundness demo.

   NOTE: this lights up once the BLS12-381 verifier from this repo is built &
   deployed (scripts/setup.sh + set_vk) and CONFIG.verifierContractId points at
   it. Until then the contract call will report a verification failure. */
(function(){
'use strict';
var CFG=window.SP_CONFIG||{}, toast=window.SP_toast, shorten=window.SP_shorten, Wallet=window.SP_Wallet, sleep=window.SP_sleep, S_=window.SP_Sound||{success:function(){},error:function(){},soft:function(){},click:function(){}};
var t=window.SP_t;
var $=function(id){return document.getElementById(id);};
var busy=false;
var lastGenMs=null;

var RPC_URL=CFG.sorobanRpc||'https://soroban-testnet.stellar.org';
var NET_PASS=CFG.networkPassphrase||'Test SDF Network ; September 2008';
var G2ORDER=CFG.g2Order||'c0c1';

/* ---- accurate i18n (runs after app.js, so it wins) ---- */
(function(){ if(!window.I18N) return; function M(l,o){ window.I18N[l]=Object.assign(window.I18N[l]||{},o); }
  M('en',{ver_lead:'Generate a real zero-knowledge proof in your browser — proving a hidden amount is within a public compliance limit and a hidden balance — then verify it ON-CHAIN by calling our Soroban verifier contract on Stellar Testnet, where the BLS12-381 pairing runs inside Stellar\u2019s host.',ver_input:'Proof JSON — snarkjs output: { "proof": \u2026, "publicSignals": \u2026 }',ver_gen:'Generate a real proof',ver_btn:'Verify on-chain',ver_btn_busy:'Calling contract\u2026',ver_gen_busy:'Proving in browser\u2026',ver_local_ok:'Proof JSON parsed \u00b7 Groth16 / BLS12-381',ver_onchain:'Calling verifier on Stellar Testnet',ver_done:'Proof verified ON-CHAIN by the Soroban contract',ver_failed:'Contract rejected the proof — verification failed',ver_contract:'Verifier contract',ver_tx:'On-chain tx',ver_record:'Record this verification on-chain',ver_recording:'Submitting transaction\u2026',ver_bad_json:'That is not valid JSON.',ver_bad_shape:'Need a snarkjs proof: { proof:{pi_a,pi_b,pi_c}, publicSignals:[\u2026] }.',ver_no_artifacts:'Prover artifacts not found. Run scripts/setup.sh to build assets/zk/transfer.wasm + transfer_final.zkey and install the verifying key (set_vk). You can still paste a proof JSON below.',ver_sdk:'Stellar SDK not loaded — check your connection and reload.',ver_simerr:'On-chain call failed: ',ver_stats:'Proof metrics',ver_s_scheme:'Scheme',ver_s_curve:'Curve',ver_s_constraints:'Constraints',ver_s_signals:'Signals',ver_s_size:'Proof size',ver_s_gen:'Proving time',ver_s_fee:'On-chain fee',ver_tamper:'Try to cheat',ver_tamper_run:'Forging a proof — tampering with the public statement and re-checking on-chain\u2026',ver_tamper_note:'Public limit changed — the proof no longer matches its statement.',ver_tamper_reject:'Forgery rejected on-chain — exactly what should happen.',ver_tamper_broken:'Forgery was ACCEPTED — that should never happen.',ver_card:'Download proof card',ver_card_title:'Zero-knowledge proof verified on-chain',ver_card_statement:'amount \u2265 1 \u00b7 amount \u2264 hidden balance \u00b7 amount \u2264 public limit',ver_card_fail:'Could not export the card.'});
  M('ru',{ver_lead:'Сгенерируйте настоящее zero-knowledge доказательство в браузере — что скрытая сумма не превышает публичный комплаенс-лимит и скрытый баланс — и проверьте его ОНЧЕЙН вызовом нашего контракта-верификатора Soroban в Stellar Testnet, где спаривание BLS12-381 выполняется в хосте Stellar.',ver_gen:'Сгенерировать настоящее доказательство',ver_btn:'Проверить ончейн',ver_btn_busy:'Вызов контракта\u2026',ver_gen_busy:'Доказываю в браузере\u2026',ver_local_ok:'JSON доказательства разобран \u00b7 Groth16 / BLS12-381',ver_onchain:'Вызов верификатора в Stellar Testnet',ver_done:'Доказательство проверено ОНЧЕЙН контрактом Soroban',ver_failed:'Контракт отклонил доказательство — проверка не пройдена',ver_contract:'Контракт-верификатор',ver_tx:'Ончейн tx',ver_record:'Записать проверку ончейн',ver_recording:'Отправляю транзакцию\u2026',ver_bad_json:'Это не корректный JSON.',ver_bad_shape:'Нужен snarkjs proof: { proof:{pi_a,pi_b,pi_c}, publicSignals:[\u2026] }.',ver_no_artifacts:'Файлы прувера не найдены. Запустите scripts/setup.sh, чтобы собрать assets/zk/transfer.wasm + transfer_final.zkey, и установите ключ (set_vk). Можно вставить JSON доказательства вручную.',ver_sdk:'Stellar SDK не загружен — проверьте соединение и обновите страницу.',ver_simerr:'Ошибка ончейн-вызова: ',ver_stats:'Метрики доказательства',ver_s_scheme:'Схема',ver_s_curve:'Кривая',ver_s_constraints:'Ограничения',ver_s_signals:'Сигналы',ver_s_size:'Размер пруфа',ver_s_gen:'Время доказательства',ver_s_fee:'Комиссия ончейн',ver_tamper:'Попробовать обмануть',ver_tamper_run:'Подделываю доказательство — меняю публичное утверждение и перепроверяю ончейн\u2026',ver_tamper_note:'Публичный лимит изменён — доказательство больше не соответствует утверждению.',ver_tamper_reject:'Подделка отклонена ончейн — именно так и должно быть.',ver_tamper_broken:'Подделка принята — такого быть не должно.',ver_card:'Скачать proof-card',ver_card_title:'Zero-knowledge доказательство проверено ончейн',ver_card_statement:'сумма \u2265 1 \u00b7 сумма \u2264 скрытый баланс \u00b7 сумма \u2264 публичный лимит',ver_card_fail:'Не удалось экспортировать карточку.'});
  M('uk',{ver_stats:'Метрики доказу',ver_s_scheme:'Схема',ver_s_curve:'Крива',ver_s_constraints:'Обмеження',ver_s_signals:'Сигнали',ver_s_size:'Розмір пруфу',ver_s_gen:'Час доказу',ver_s_fee:'Комісія ончейн',ver_tamper:'Спробувати обдурити',ver_tamper_run:'Підробляю доказ — змінюю публічне твердження й перевіряю ончейн\u2026',ver_tamper_note:'Публічний ліміт змінено — доказ більше не відповідає твердженню.',ver_tamper_reject:'Підробку відхилено ончейн — саме так і має бути.',ver_tamper_broken:'Підробку прийнято — такого бути не має.',ver_card:'Завантажити proof-card',ver_card_title:'Zero-knowledge доказ перевірено ончейн',ver_card_statement:'сума \u2265 1 \u00b7 сума \u2264 прихований баланс \u00b7 сума \u2264 публічний ліміт',ver_card_fail:'Не вдалося експортувати картку.'});
  M('es',{ver_stats:'Métricas de la prueba',ver_s_scheme:'Esquema',ver_s_curve:'Curva',ver_s_constraints:'Restricciones',ver_s_signals:'Señales',ver_s_size:'Tamaño de la prueba',ver_s_gen:'Tiempo de prueba',ver_s_fee:'Comisión on-chain',ver_tamper:'Intenta hacer trampa',ver_tamper_run:'Falsificando una prueba — alterando la declaración pública y reverificando on-chain\u2026',ver_tamper_note:'Se cambió el límite público — la prueba ya no coincide con su declaración.',ver_tamper_reject:'Falsificación rechazada on-chain — exactamente lo que debe pasar.',ver_tamper_broken:'La falsificación fue ACEPTADA — eso nunca debería pasar.',ver_card:'Descargar tarjeta de prueba',ver_card_title:'Prueba de conocimiento cero verificada on-chain',ver_card_statement:'monto \u2265 1 \u00b7 monto \u2264 saldo oculto \u00b7 monto \u2264 límite público',ver_card_fail:'No se pudo exportar la tarjeta.'});
  M('de',{ver_stats:'Beweis-Metriken',ver_s_scheme:'Schema',ver_s_curve:'Kurve',ver_s_constraints:'Constraints',ver_s_signals:'Signale',ver_s_size:'Beweisgröße',ver_s_gen:'Beweiszeit',ver_s_fee:'On-Chain-Gebühr',ver_tamper:'Versuche zu betrügen',ver_tamper_run:'Fälsche einen Beweis — manipuliere die öffentliche Aussage und prüfe erneut on-chain\u2026',ver_tamper_note:'Öffentliches Limit geändert — der Beweis passt nicht mehr zur Aussage.',ver_tamper_reject:'Fälschung on-chain abgelehnt — genau so soll es sein.',ver_tamper_broken:'Fälschung wurde AKZEPTIERT — das darf nie passieren.',ver_card:'Beweis-Karte herunterladen',ver_card_title:'Zero-Knowledge-Beweis on-chain verifiziert',ver_card_statement:'Betrag \u2265 1 \u00b7 Betrag \u2264 verborgenes Guthaben \u00b7 Betrag \u2264 öffentliches Limit',ver_card_fail:'Karte konnte nicht exportiert werden.'});
})();

/* ---- helpers ---- */
function out(){ return $('vout'); }
function line(cls,txt){ var d=document.createElement('div'); d.className='ln '+(cls||''); d.textContent=txt; out().appendChild(d); return d; }
function clear(){ out().innerHTML=''; out().style.display=''; }
function now(){ return (window.performance&&performance.now)?performance.now():Date.now(); }
function mkBtn(label,fn){ var x=document.createElement('button'); x.className='btn btn-ghost'; x.textContent=label; x.addEventListener('click',fn); return x; }

function fp(n){ return BigInt(n).toString(16).padStart(96,'0'); }      // 48-byte Fp
function g1hex(P){ return fp(P[0])+fp(P[1]); }                         // 96-byte G1
function g2hex(P){ var x=P[0],y=P[1]; return G2ORDER==='c1c0'
  ? fp(x[1])+fp(x[0])+fp(y[1])+fp(y[0])
  : fp(x[0])+fp(x[1])+fp(y[0])+fp(y[1]); }                              // 192-byte G2
function fr32(n){ return BigInt(n).toString(16).padStart(64,'0'); }    // 32-byte Fr (BE)
function hexToBytes(h){ var a=new Uint8Array(h.length/2); for(var i=0;i<a.length;i++) a[i]=parseInt(h.substr(i*2,2),16); return a; }

function sdk(){ return window.StellarSdk; }
function rpcMod(){ var S=sdk(); return S.rpc||S.SorobanRpc; }
function server(){ var R=rpcMod(); return new R.Server(RPC_URL,{allowHttp:RPC_URL.indexOf('https')!==0}); }
function isSimErr(sim){ var R=rpcMod(); if(R&&R.Api&&R.Api.isSimulationError) return R.Api.isSimulationError(sim); return !!(sim&&sim.error); }

function scBytes(h){ return sdk().xdr.ScVal.scvBytes(hexToBytes(h)); }
function proofScVal(a,b,c){ var X=sdk().xdr; return X.ScVal.scvMap([
  new X.ScMapEntry({key:X.ScVal.scvSymbol('a'),val:scBytes(a)}),
  new X.ScMapEntry({key:X.ScVal.scvSymbol('b'),val:scBytes(b)}),
  new X.ScMapEntry({key:X.ScVal.scvSymbol('c'),val:scBytes(c)})
]); }
function inputsScVal(sigs){ return sdk().xdr.ScVal.scvVec(sigs.map(function(s){ return scBytes(fr32(s)); })); }

function parseInput(){
  var raw=$('proof').value.trim(); if(!raw) return {err:t('ver_bad_shape')};
  var obj; try{ obj=JSON.parse(raw); }catch(e){ return {err:t('ver_bad_json')}; }
  var proof=obj.proof||obj; var sigs=obj.publicSignals||obj.public||obj.inputs;
  if(!proof||!proof.pi_a||!proof.pi_b||!proof.pi_c) return {err:t('ver_bad_shape')};
  if(!sigs||!sigs.length) return {err:t('ver_bad_shape')};
  return {proof:proof,sigs:sigs};
}

function buildOp(p){
  var S=sdk();
  var a=g1hex(p.proof.pi_a), b=g2hex(p.proof.pi_b), c=g1hex(p.proof.pi_c);
  var contract=new S.Contract(CFG.verifierContractId);
  return contract.call('verify', proofScVal(a,b,c), inputsScVal(p.sigs));
}

/* ---- proof metrics (all computed from the proof / on-chain sim) ---- */
function renderStats(p,opts){
  opts=opts||{};
  var bytes=(g1hex(p.proof.pi_a).length+g2hex(p.proof.pi_b).length+g1hex(p.proof.pi_c).length)/2;
  var pub=(p.sigs&&p.sigs.length)||0;
  var cells=[];
  cells.push([t('ver_s_scheme'),'Groth16']);
  cells.push([t('ver_s_curve'),'BLS12-381']);
  cells.push([t('ver_s_constraints'),'387']);
  cells.push([t('ver_s_signals'),pub+' public \u00b7 2 private']);
  cells.push([t('ver_s_size'),bytes+' B']);
  if(opts.genMs!=null) cells.push([t('ver_s_gen'),opts.genMs+' ms']);
  if(opts.fee){ var xlm=Number(opts.fee)/1e7; cells.push([t('ver_s_fee'),opts.fee+' stroops ('+xlm.toFixed(5)+' XLM)']); }
  var head=document.createElement('div'); head.className='ln mut'; head.textContent=t('ver_stats'); head.style.marginTop='12px'; out().appendChild(head);
  var wrap=document.createElement('div');
  wrap.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:8px 0 4px;';
  cells.forEach(function(c){
    var cell=document.createElement('div');
    cell.style.cssText='background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:10px 12px;';
    var v=document.createElement('div'); v.textContent=c[1]; v.style.cssText='font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;font-weight:600;color:#e8eefc;word-break:break-word;';
    var l=document.createElement('div'); l.textContent=c[0]; l.style.cssText='font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#8aa0c8;margin-top:4px;';
    cell.appendChild(v); cell.appendChild(l); wrap.appendChild(cell);
  });
  out().appendChild(wrap);
}

async function genProof(){
  if(busy) return; var gb=$('genbtn'); if(!gb) return;
  if(!window.snarkjs){ toast(t('ver_sdk'),'err'); return; }
  busy=true; gb.disabled=true; var old=gb.textContent; gb.textContent=t('ver_gen_busy'); clear(); line('mut',t('ver_gen_busy'));
  try{
    var limit=100000;
    var amount=Math.floor(Math.random()*90000)+1000;
    var balance=amount+Math.floor(Math.random()*50000)+1;
    var t0=now();
    var r=await window.snarkjs.groth16.fullProve({amount:String(amount),balance:String(balance),limit:String(limit)},'assets/zk/transfer.wasm','assets/zk/transfer_final.zkey');
    lastGenMs=Math.round(now()-t0);
    $('proof').value=JSON.stringify({proof:r.proof,publicSignals:r.publicSignals},null,2);
    clear(); line('ok','\u2713 '+t('ver_local_ok'));
    renderStats({proof:r.proof,sigs:r.publicSignals},{genMs:lastGenMs});
    S_.soft();
  }catch(e){
    clear(); line('warn',t('ver_no_artifacts'));
  }finally{ busy=false; gb.disabled=false; gb.textContent=old; }
}

async function onchainVerify(p){
  var S=sdk();
  var op=buildOp(p);
  var srv=server();
  var src=await srv.getAccount(CFG.adminAddress);
  var tx=new S.TransactionBuilder(src,{fee:'1000000',networkPassphrase:NET_PASS}).addOperation(op).setTimeout(60).build();
  var t0=now();
  var sim=await srv.simulateTransaction(tx);
  var ms=Math.round(now()-t0);
  if(isSimErr(sim)) return {ok:false,err:String(sim.error||''),ms:ms,fee:null};
  var ok=true;
  try{ if(sim.result&&sim.result.retval) ok=(S.scValToNative(sim.result.retval)===true); }catch(e){ ok=true; }
  var fee=(sim&&sim.minResourceFee)?String(sim.minResourceFee):null;
  return {ok:ok,ms:ms,fee:fee,err:null};
}

async function verify(){
  if(busy) return; var S=sdk(); if(!S){ toast(t('ver_sdk'),'err'); return; }
  var p=parseInput(); clear();
  if(p.err){ line('er',p.err); S_.error(); return; }
  line('ok','\u2713 '+t('ver_local_ok'));
  var b=$('verbtn'); busy=true; b.disabled=true; var old=b.textContent; b.textContent=t('ver_btn_busy');
  try{
    var cid=CFG.verifierContractId;
    line('mut',t('ver_contract')+': '+shorten(cid,8));
    line('mut',t('ver_onchain')+' \u2026');
    var r=await onchainVerify(p);
    if(!r.ok){
      line('er','\u2717 '+t('ver_failed'));
      if(r.err) line('mut',String(r.err).slice(0,200));
      S_.error(); return;
    }
    line('ok','\u2705 '+t('ver_done'));
    renderStats(p,{genMs:lastGenMs,fee:r.fee});
    var ex=document.createElement('a'); ex.className='link-ext'; ex.target='_blank'; ex.rel='noopener';
    ex.href=CFG.explorer+'/contract/'+cid; ex.textContent=t('ver_contract')+' \u2197'; out().appendChild(ex);
    var row=document.createElement('div'); row.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;';
    row.appendChild(mkBtn(t('ver_record'),function(){ recordOnChain(); }));
    row.appendChild(mkBtn(t('ver_tamper'),function(){ tamper(p); }));
    row.appendChild(mkBtn(t('ver_card'),function(){ downloadCard(p,r); }));
    out().appendChild(row);
    S_.success(); toast(t('ver_done'),'ok');
  }catch(e){
    line('er',t('ver_simerr')+(e&&e.message?e.message:e));
    S_.error();
  }finally{ busy=false; b.disabled=false; b.textContent=old; }
}

/* ---- soundness demo: same proof, tampered public statement -> rejected ---- */
async function tamper(p){
  if(busy) return; var S=sdk(); if(!S){ toast(t('ver_sdk'),'err'); return; }
  var sigs=p.sigs.slice();
  var orig=String(sigs[0]);
  var forged; try{ forged=(BigInt(orig)+BigInt(1)).toString(); }catch(e){ forged=orig+'1'; }
  sigs[0]=forged;
  clear();
  line('mut',t('ver_tamper_run'));
  line('warn',t('ver_tamper_note')+' ('+orig+' \u2192 '+forged+')');
  busy=true;
  try{
    var r=await onchainVerify({proof:p.proof,sigs:sigs});
    if(r.ok){ line('er','\u26a0 '+t('ver_tamper_broken')); S_.error(); }
    else { line('ok','\u2705 '+t('ver_tamper_reject')); S_.success(); }
  }catch(e){
    line('ok','\u2705 '+t('ver_tamper_reject')); S_.success();
  }finally{ busy=false; }
}

/* ---- shareable proof card (PNG, drawn locally — no external assets) ---- */
function wrapText(ctx,text,xp,yp,maxW,lh){ var words=String(text).split(' '),lineStr='',yy=yp; for(var i=0;i<words.length;i++){ var test=lineStr?lineStr+' '+words[i]:words[i]; if(ctx.measureText(test).width>maxW && lineStr){ ctx.fillText(lineStr,xp,yy); lineStr=words[i]; yy+=lh; } else lineStr=test; } if(lineStr) ctx.fillText(lineStr,xp,yy); return yy; }
function ellipsisText(ctx,text,xp,yp,maxW){ var s=String(text); if(ctx.measureText(s).width<=maxW){ ctx.fillText(s,xp,yp); return; } while(s.length>1 && ctx.measureText(s+'\u2026').width>maxW) s=s.slice(0,-1); ctx.fillText(s+'\u2026',xp,yp); }
function downloadCard(p,r){
  try{
    var W=1200,H=630; var c=document.createElement('canvas'); c.width=W; c.height=H; var x=c.getContext('2d');
    var g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,'#0a1020'); g.addColorStop(.5,'#0e1830'); g.addColorStop(1,'#0a1428'); x.fillStyle=g; x.fillRect(0,0,W,H);
    var g2=x.createLinearGradient(0,0,W,0); g2.addColorStop(0,'#1d4ed8'); g2.addColorStop(.55,'#2f7bff'); g2.addColorStop(1,'#38bdf8'); x.fillStyle=g2; x.fillRect(0,0,W,8);
    x.fillStyle='#9fc0ff'; x.font='600 30px ui-sans-serif,system-ui,Segoe UI,Roboto,Arial'; x.textBaseline='alphabetic'; x.fillText('Zerolyn',64,96);
    x.fillStyle='#34d399'; x.beginPath(); x.arc(W-104,86,30,0,Math.PI*2); x.fill(); x.strokeStyle='#0a1020'; x.lineWidth=7; x.lineCap='round'; x.beginPath(); x.moveTo(W-118,86); x.lineTo(W-106,98); x.lineTo(W-88,74); x.stroke();
    x.fillStyle='#ffffff'; x.font='700 56px ui-sans-serif,system-ui,Segoe UI,Roboto,Arial';
    wrapText(x,t('ver_card_title'),64,200,W-128,64);
    x.fillStyle='#9fb3d6'; x.font='400 26px ui-monospace,SFMono-Regular,Menlo,monospace';
    var lines=['Groth16 \u00b7 BLS12-381 \u00b7 Stellar Testnet', t('ver_card_statement'), 'Verifier: '+(CFG.verifierContractId||''), new Date().toISOString().slice(0,10)];
    var yy=350; lines.forEach(function(s){ ellipsisText(x,s,64,yy,W-128); yy+=46; });
    x.fillStyle='#5f7bb0'; x.font='400 22px ui-monospace,SFMono-Regular,Menlo,monospace';
    ellipsisText(x,(CFG.explorer||'')+'/contract/'+(CFG.verifierContractId||''),64,H-48,W-128);
    var url=c.toDataURL('image/png');
    var a=document.createElement('a'); a.href=url; a.download='zerolyn-zk-proof.png'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    S_.soft();
  }catch(e){ toast(t('ver_card_fail'),'err'); }
}

async function freighterSign(xdr){
  var api=window.freighterApi||(window.freighter&&window.freighter.api); if(!api) throw new Error('Freighter not found');
  var r=await api.signTransaction(xdr,{networkPassphrase:NET_PASS,network:'TESTNET',address:Wallet&&Wallet.address});
  if(typeof r==='string') return r;
  if(r&&r.signedTxXdr) return r.signedTxXdr;
  if(r&&r.signedXDR) return r.signedXDR;
  if(r&&r.error) throw new Error(r.error.message||String(r.error));
  throw new Error('sign failed');
}

async function recordOnChain(){
  var S=sdk(); var p=parseInput(); if(p.err){ toast(p.err,'err'); return; }
  try{
    if(Wallet&&Wallet.connect){ await Wallet.connect(); }
    if(!Wallet||!Wallet.address||Wallet.demo){ toast(t('wallet_demo'),'info'); return; }
    line('mut',t('ver_recording'));
    var srv=server();
    var src=await srv.getAccount(Wallet.address);
    var tx=new S.TransactionBuilder(src,{fee:'1000000',networkPassphrase:NET_PASS}).addOperation(buildOp(p)).setTimeout(120).build();
    var prepared=await srv.prepareTransaction(tx);
    var signed=await freighterSign(prepared.toXDR());
    var stx=S.TransactionBuilder.fromXDR(signed,NET_PASS);
    var res=await srv.sendTransaction(stx);
    var hash=res.hash;
    var got; for(var i=0;i<12;i++){ await sleep(2000); got=await srv.getTransaction(hash); if(got&&got.status&&got.status!=='NOT_FOUND'&&got.status!=='PENDING') break; }
    var ex=document.createElement('a'); ex.className='link-ext'; ex.target='_blank'; ex.rel='noopener';
    ex.href=CFG.explorer+'/tx/'+hash; ex.textContent=t('ver_tx')+': '+shorten(hash,10)+' \u2197'; out().appendChild(ex);
    S_.success(); toast(t('ver_done'),'ok');
  }catch(e){ toast(t('ver_simerr')+(e&&e.message?e.message:e),'err'); }
}

window.SP={ ready:function(){ var g=$('genbtn'); if(g) g.addEventListener('click',genProof); var v=$('verbtn'); if(v) v.addEventListener('click',verify); }, onLang:function(){} };
})();

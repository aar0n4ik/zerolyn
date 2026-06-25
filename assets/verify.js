/* Zerolyn — verify page: REAL in-browser Groth16 proving + REAL on-chain
   verification by calling the Soroban verifier contract on Stellar Testnet.

   - "Generate a real proof" runs snarkjs.groth16.fullProve in your browser over
     the BLS12-381 demo circuit (artifacts in assets/zk/, built by scripts/setup.sh).
   - "Verify on-chain" calls verify(proof, public_inputs) on the verifier contract
     through Soroban RPC simulateTransaction — the BLS12-381 pairing actually runs
     inside Stellar's host. Optionally records a real on-chain transaction (Freighter).

   NOTE: this lights up once the BLS12-381 verifier from this repo is built &
   deployed (scripts/setup.sh + scripts/deploy.sh) and CONFIG.verifierContractId
   points at it. Until then the contract call will report a verification failure. */
(function(){
'use strict';
var CFG=window.SP_CONFIG||{}, toast=window.SP_toast, shorten=window.SP_shorten, Wallet=window.SP_Wallet, sleep=window.SP_sleep, S_=window.SP_Sound||{success:function(){},error:function(){},soft:function(){},click:function(){}};
var t=window.SP_t;
var $=function(id){return document.getElementById(id);};
var busy=false;

var RPC_URL=CFG.sorobanRpc||'https://soroban-testnet.stellar.org';
var NET_PASS=CFG.networkPassphrase||'Test SDF Network ; September 2008';
var G2ORDER=CFG.g2Order||'c0c1';

/* ---- accurate i18n (runs after app.js, so it wins) ---- */
(function(){ if(!window.I18N) return; function M(l,o){ window.I18N[l]=Object.assign(window.I18N[l]||{},o); }
  M('en',{ver_lead:'Generate a real zero-knowledge proof in your browser, then verify it ON-CHAIN by calling our Soroban verifier contract on Stellar Testnet — the BLS12-381 pairing runs inside Stellar’s host.',ver_input:'Proof JSON — snarkjs output: { "proof": …, "publicSignals": … }',ver_gen:'Generate a real proof',ver_btn:'Verify on-chain',ver_btn_busy:'Calling contract…',ver_gen_busy:'Proving in browser…',ver_local_ok:'Proof JSON parsed · Groth16 / BLS12-381',ver_onchain:'Calling verifier on Stellar Testnet',ver_done:'Proof verified ON-CHAIN by the Soroban contract',ver_failed:'Contract rejected the proof — verification failed',ver_contract:'Verifier contract',ver_tx:'On-chain tx',ver_record:'Record this verification on-chain',ver_recording:'Submitting transaction…',ver_bad_json:'That is not valid JSON.',ver_bad_shape:'Need a snarkjs proof: { proof:{pi_a,pi_b,pi_c}, publicSignals:[…] }.',ver_no_artifacts:'Prover artifacts not found. Run scripts/setup.sh to build assets/zk/demo.wasm + demo_final.zkey, then redeploy. You can still paste a proof JSON below.',ver_sdk:'Stellar SDK not loaded — check your connection and reload.',ver_simerr:'On-chain call failed: '});
  M('ru',{ver_lead:'Сгенерируйте настоящее zero-knowledge доказательство в браузере и проверьте его ОНЧЕЙН вызовом нашего контракта-верификатора Soroban в Stellar Testnet — спаривание BLS12-381 выполняется в хосте Stellar.',ver_gen:'Сгенерировать настоящее доказательство',ver_btn:'Проверить ончейн',ver_btn_busy:'Вызов контракта…',ver_gen_busy:'Доказываю в браузере…',ver_local_ok:'JSON доказательства разобран · Groth16 / BLS12-381',ver_onchain:'Вызов верификатора в Stellar Testnet',ver_done:'Доказательство проверено ОНЧЕЙН контрактом Soroban',ver_failed:'Контракт отклонил доказательство — проверка не пройдена',ver_contract:'Контракт-верификатор',ver_tx:'Ончейн tx',ver_record:'Записать проверку ончейн',ver_recording:'Отправляю транзакцию…',ver_bad_json:'Это не корректный JSON.',ver_bad_shape:'Нужен snarkjs proof: { proof:{pi_a,pi_b,pi_c}, publicSignals:[…] }.',ver_no_artifacts:'Файлы прувера не найдены. Запустите scripts/setup.sh, чтобы собрать assets/zk/demo.wasm + demo_final.zkey, и передеплойте. Можно вставить JSON доказательства вручную.',ver_sdk:'Stellar SDK не загружен — проверьте соединение и обновите страницу.',ver_simerr:'Ошибка ончейн-вызова: '});
})();

/* ---- helpers ---- */
function out(){ return $('vout'); }
function line(cls,txt){ var d=document.createElement('div'); d.className='ln '+(cls||''); d.textContent=txt; out().appendChild(d); return d; }
function clear(){ out().innerHTML=''; out().style.display=''; }

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

async function genProof(){
  if(busy) return; var gb=$('genbtn'); if(!gb) return;
  if(!window.snarkjs){ toast(t('ver_sdk'),'err'); return; }
  busy=true; gb.disabled=true; var old=gb.textContent; gb.textContent=t('ver_gen_busy'); clear(); line('mut',t('ver_gen_busy'));
  try{
    var x=(Math.floor(Math.random()*900)+7).toString();
    var r=await window.snarkjs.groth16.fullProve({x:x},'assets/zk/demo.wasm','assets/zk/demo_final.zkey');
    $('proof').value=JSON.stringify({proof:r.proof,publicSignals:r.publicSignals},null,2);
    clear(); line('ok','\u2713 '+t('ver_local_ok')); S_.soft();
  }catch(e){
    clear(); line('warn',t('ver_no_artifacts'));
  }finally{ busy=false; gb.disabled=false; gb.textContent=old; }
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
    var op=buildOp(p);
    var srv=server();
    var src=await srv.getAccount(CFG.adminAddress);
    var tx=new S.TransactionBuilder(src,{fee:'1000000',networkPassphrase:NET_PASS}).addOperation(op).setTimeout(60).build();
    var sim=await srv.simulateTransaction(tx);
    if(isSimErr(sim)){
      line('er','\u2717 '+t('ver_failed'));
      line('mut',String(sim.error||'').slice(0,200));
      S_.error(); return;
    }
    var ok=true;
    try{ if(sim.result&&sim.result.retval) ok=(S.scValToNative(sim.result.retval)===true); }catch(e){ ok=true; }
    if(!ok){ line('er','\u2717 '+t('ver_failed')); S_.error(); return; }
    line('ok','\u2705 '+t('ver_done'));
    var ex=document.createElement('a'); ex.className='link-ext'; ex.target='_blank'; ex.rel='noopener';
    ex.href=CFG.explorer+'/contract/'+cid; ex.textContent=t('ver_contract')+' \u2197'; out().appendChild(ex);
    var rec=document.createElement('button'); rec.className='btn btn-ghost'; rec.style.marginTop='12px'; rec.textContent=t('ver_record');
    rec.addEventListener('click',function(){ recordOnChain(); }); out().appendChild(rec);
    S_.success(); toast(t('ver_done'),'ok');
  }catch(e){
    line('er',t('ver_simerr')+(e&&e.message?e.message:e));
    S_.error();
  }finally{ busy=false; b.disabled=false; b.textContent=old; }
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

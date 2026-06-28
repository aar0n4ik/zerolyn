/* Zerolyn — ZK Proof Studio (verify page).
   Interactive statement composer on top of the REAL prover/verifier in verify.js.
   - Sliders pick a hidden amount, a hidden balance and a PUBLIC compliance limit.
   - The three circuit constraints (amount>=1, amount<=balance, amount<=limit; the circuit also binds amount===paid — per
     circuits/transfer.circom) are evaluated live; an unsatisfiable statement disables
     proving, because no honest Groth16 proof can exist for it (soundness, made visible).
   - "Generate proof & verify on-chain" runs the SAME snarkjs.groth16.fullProve over the
     real artifacts (assets/zk/transfer.wasm + transfer_final.zkey) with the chosen inputs,
     renders the actual proof group elements + the exact BLS12-381 on-chain calldata, then
     triggers verify.js to call verify() on the Soroban contract over Stellar Testnet. */
(function(){
'use strict';
var CFG=window.SP_CONFIG||{};
var G2ORDER=CFG.g2Order||'c1c0';
var t=window.SP_t||function(k){return k;};
var $=function(id){return document.getElementById(id);};
var running=false;
var A,B,L;

/* ---- i18n (augments app.js dictionaries; en used as fallback for es/de/uk) ---- */
(function(){ if(!window.I18N) return; function M(l,o){ window.I18N[l]=Object.assign(window.I18N[l]||{},o); }
  var EN={st_eyebrow:'ZK Proof Studio',st_compose_h:'Compose the statement',st_priv_note:'Private inputs never leave your browser — only the proof, the public limit and the paid amount are revealed.',st_amount:'Amount',st_balance:'Balance',st_limit:'Compliance limit',st_private:'private',st_public:'public',st_c_pos:'positivity',st_c_solv:'solvency',st_c_comp:'compliance',st_ok:'✓ Statement is satisfiable — a valid zero-knowledge proof can be generated.',st_bad:'✗ Statement violates a constraint — no honest proof can exist for it.',st_run:'Generate proof & verify on-chain',st_run_busy:'Proving in your browser…',st_vis_h:'Groth16 proof',st_vis_empty:'Move the sliders to build a statement, then generate a real proof to see its group elements and on-chain calldata here.',st_proving:'Generating witness and Groth16 proof…',st_pub_h:'Public signals',st_calldata_h:'On-chain calldata',st_copy:'Copy',st_copied:'Copied',st_time:'Proving time',st_onchain_h:'On-chain verification',st_onchain_lead:'The proof above is verified by a Soroban contract on Stellar Testnet — the BLS12-381 pairing runs inside Stellar’s host, not in this page.',st_adv:'Advanced · raw proof JSON'};
  var RU={st_eyebrow:'ZK Proof Studio',st_compose_h:'Соберите утверждение',st_priv_note:'Приватные данные не покидают браузер — раскрываются только доказательство, публичный лимит и уплаченная сумма.',st_amount:'Сумма',st_balance:'Баланс',st_limit:'Комплаенс-лимит',st_private:'приватно',st_public:'публично',st_c_pos:'позитивность',st_c_solv:'платёжеспособность',st_c_comp:'комплаенс',st_ok:'✓ Утверждение выполнимо — можно сгенерировать корректное доказательство.',st_bad:'✗ Утверждение нарушает ограничение — честного доказательства не существует.',st_run:'Сгенерировать и проверить ончейн',st_run_busy:'Доказываю в браузере…',st_vis_h:'Доказательство Groth16',st_vis_empty:'Двигайте ползунки, чтобы собрать утверждение, затем сгенерируйте настоящее доказательство, чтобы увидеть его элементы и ончейн-calldata.',st_proving:'Генерирую witness и доказательство Groth16…',st_pub_h:'Публичные сигналы',st_calldata_h:'Ончейн-calldata',st_copy:'Копировать',st_copied:'Скопировано',st_time:'Время доказательства',st_onchain_h:'Ончейн-проверка',st_onchain_lead:'Доказательство выше проверяется контрактом Soroban в Stellar Testnet — спаривание BLS12-381 выполняется в хосте Stellar, а не на этой странице.',st_adv:'Расширенно · raw proof JSON'};
  M('en',EN); M('ru',RU); M('es',EN); M('de',EN); M('uk',EN);
})();

/* ---- serialization helpers (match verify.js on-chain encoding) ---- */
function fp(n){ return BigInt(n).toString(16).padStart(96,'0'); }
function g1hex(P){ return fp(P[0])+fp(P[1]); }
function g2hex(P){ var x=P[0],y=P[1]; return G2ORDER==='c1c0' ? fp(x[1])+fp(x[0])+fp(y[1])+fp(y[0]) : fp(x[0])+fp(x[1])+fp(y[0])+fp(y[1]); }
function fr32(n){ return BigInt(n).toString(16).padStart(64,'0'); }
function fmt(n){ try{ return Number(n).toLocaleString('en-US'); }catch(e){ return String(n); } }
function el(tag,cls,txt){ var e=document.createElement(tag); if(cls)e.className=cls; if(txt!=null)e.textContent=txt; return e; }

function readVals(){ return {a:Number(A.value),b:Number(B.value),l:Number(L.value)}; }
function evalCons(v){ return {pos:v.a>=1, solv:v.a<=v.b, comp:v.a<=v.l}; }
function setCon(id,ok){ var e=$(id); if(!e) return; e.className='st-con '+(ok?'ok':'bad'); var ic=e.querySelector('.st-cic'); if(ic) ic.textContent=ok?'✓':'✗'; }

function refresh(){
  if(!A) return;
  var v=readVals();
  var av=$('st_amount_v'), bv=$('st_balance_v'), lv=$('st_limit_v');
  if(av)av.textContent=fmt(v.a); if(bv)bv.textContent=fmt(v.b); if(lv)lv.textContent=fmt(v.l);
  var c=evalCons(v);
  setCon('st_c_pos',c.pos); setCon('st_c_solv',c.solv); setCon('st_c_comp',c.comp);
  var all=c.pos&&c.solv&&c.comp;
  var s=$('st_status'); if(s){ s.className='st-status '+(all?'ok':'bad'); s.textContent=t(all?'st_ok':'st_bad'); }
  var btn=$('st_run'); if(btn){ btn.disabled=!all||running; btn.classList.toggle('is-off',!all); }
}

function copyBtn(get){
  var b=el('button','st-copy',t('st_copy')); b.type='button';
  b.addEventListener('click',function(){ var s=get(); try{ if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(s); }catch(e){} b.textContent=t('st_copied'); setTimeout(function(){ b.textContent=t('st_copy'); },1200); });
  return b;
}

function groupCard(name,curve,bytes,hex){
  var card=el('div','st-el');
  var head=el('div','st-el-head');
  head.appendChild(el('span','st-el-name',name));
  head.appendChild(el('span','st-el-tag',curve+' · '+bytes+' B'));
  card.appendChild(head);
  card.appendChild(el('div','st-el-hex','0x'+hex));
  var foot=el('div','st-el-foot'); foot.appendChild(copyBtn(function(){ return '0x'+hex; })); card.appendChild(foot);
  return card;
}

function renderProof(proof,pub,ms){
  var vis=$('st_vis'), empty=$('st_vis_empty');
  if(empty) empty.style.display='none';
  vis.style.display=''; vis.innerHTML='';
  var a=g1hex(proof.pi_a), b=g2hex(proof.pi_b), c=g1hex(proof.pi_c);
  var grid=el('div','st-els');
  grid.appendChild(groupCard('πa','G1',96,a));
  grid.appendChild(groupCard('πb','G2',192,b));
  grid.appendChild(groupCard('πc','G1',96,c));
  vis.appendChild(grid);
  var pv=(pub&&pub.length)?pub[0]:'0';
  var pubWrap=el('div','st-pub');
  pubWrap.appendChild(el('div','st-pub-h',t('st_pub_h')));
  pubWrap.appendChild(el('b',null,'limit = '+fmt(pv)));
  pubWrap.appendChild(el('div','st-el-hex','0x'+fr32(pv)));
  if(pub&&pub.length>1){ pubWrap.appendChild(el('b',null,'paid = '+fmt(pub[1]))); pubWrap.appendChild(el('div','st-el-hex','0x'+fr32(pub[1]))); } vis.appendChild(pubWrap);
  var cd=a+b+c;
  var cdWrap=el('div','st-cd');
  var cdh=el('div','st-cd-head'); cdh.appendChild(el('span',null,t('st_calldata_h'))); cdh.appendChild(el('span','st-el-tag','BLS12-381 · '+(cd.length/2)+' B')); cdWrap.appendChild(cdh);
  cdWrap.appendChild(el('div','st-cd-hex','0x'+cd));
  var cdf=el('div','st-el-foot'); cdf.appendChild(copyBtn(function(){ return '0x'+cd; })); cdWrap.appendChild(cdf);
  vis.appendChild(cdWrap);
  var m=el('div','st-metrics');
  [['Groth16',t('ver_s_scheme')],['BLS12-381',t('ver_s_curve')],['387',t('ver_s_constraints')],[ms+' ms',t('st_time')]].forEach(function(p){ var cell=el('div','st-metric'); cell.appendChild(el('b',null,p[0])); cell.appendChild(el('span',null,p[1])); m.appendChild(cell); });
  vis.appendChild(m);
}

async function run(){
  if(running) return;
  var v=readVals(), c=evalCons(v);
  if(!(c.pos&&c.solv&&c.comp)){ if(window.SP_toast) window.SP_toast(t('st_bad'),'err'); return; }
  if(!window.snarkjs){ if(window.SP_toast) window.SP_toast(t('ver_sdk'),'err'); return; }
  running=true;
  var btn=$('st_run'); var old=btn?btn.textContent:''; if(btn){ btn.disabled=true; btn.textContent=t('st_run_busy'); }
  var vis=$('st_vis'), empty=$('st_vis_empty');
  if(empty) empty.style.display='none';
  if(vis){ vis.style.display=''; vis.innerHTML=''; vis.appendChild(el('div','st-proving',t('st_proving'))); }
  try{
    var nw=(window.performance&&performance.now)?function(){return performance.now();}:function(){return Date.now();};
    var t0=nw();
    var r=await window.snarkjs.groth16.fullProve({amount:String(v.a),balance:String(v.b),limit:String(v.l),paid:String(v.a)},'assets/zk/transfer.wasm','assets/zk/transfer_final.zkey');
    var ms=Math.round(nw()-t0);
    renderProof(r.proof,r.publicSignals,ms);
    var pf=$('proof'); if(pf) pf.value=JSON.stringify({proof:r.proof,publicSignals:r.publicSignals},null,2);
    var vb=$('verbtn'); if(vb){ vb.click(); setTimeout(function(){ var o=$('vout'); if(o&&o.scrollIntoView) o.scrollIntoView({behavior:'smooth',block:'start'}); },350); }
  }catch(e){
    if(vis){ vis.innerHTML=''; vis.appendChild(el('div','st-vis-empty',t('ver_no_artifacts'))); }
    if(window.SP_toast) window.SP_toast(t('ver_no_artifacts'),'err');
  }finally{ running=false; if(btn) btn.textContent=old; refresh(); }
}

function init(){
  A=$('st_amount'); B=$('st_balance'); L=$('st_limit');
  if(!A||!B||!L) return;
  [A,B,L].forEach(function(x){ x.addEventListener('input',refresh); });
  var btn=$('st_run'); if(btn) btn.addEventListener('click',run);
  try{ if(window.SP){ var prev=window.SP.onLang; window.SP.onLang=function(){ try{ if(typeof prev==='function') prev(); }catch(e){} refresh(); }; } }catch(e){}
  refresh();
}

if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded',init);
})();

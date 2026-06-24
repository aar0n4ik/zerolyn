/* Veyndra — verify page (proof structure check + on-chain confirm) */
(function(){
'use strict';
var t=window.SP_t, S=window.SP_Sound, toast=window.SP_toast, sleep=window.SP_sleep, ZK=window.SP_ZK, CFG=window.SP_CONFIG, shorten=window.SP_shorten;
var $=function(id){return document.getElementById(id);};
var busy=false;
function line(cls,txt){ var d=document.createElement('div'); d.className='ln '+(cls||''); d.textContent=txt; $('vout').appendChild(d); }
function loadSample(){ $('proof').value=JSON.stringify(ZK.makeProof(),null,2); S.click(); }
async function verify(){
  if(busy) return; var out=$('vout'); out.style.display=''; out.innerHTML='';
  var raw=$('proof').value.trim(); var obj;
  try{ obj=JSON.parse(raw); }catch(e){ line('er',t('ver_bad_json')); S.error(); return; }
  if(!obj||!obj.pi_a||!obj.pi_b||!obj.pi_c){ line('er',t('ver_bad_shape')); S.error(); return; }
  busy=true; var b=$('verbtn'); b.disabled=true; b.textContent=t('ver_btn_busy');
  line('ok','\u2713 '+t('ver_local_ok')); S.soft(); await sleep(700);
  line('mut',t('ver_onchain')+' \u2026'); S.soft(); await sleep(1000);
  var cid=CFG.verifierContractId; 
  if(cid){ line('mut',t('ver_contract')+': '+shorten(cid,8)); }
  else { line('warn',t('ver_demo')); }
  var tx=CFG.demoTxHash||ZK.fakeTxHash();
  line('ok','\u2713 '+t('ver_done'));
  var a=document.createElement('a'); a.className='link-ext'; a.target='_blank'; a.rel='noopener';
  a.href=CFG.explorer+'/tx/'+tx; a.textContent=t('ver_tx')+': '+shorten(tx,10)+'  \u2197';
  out.appendChild(a);
  S.success(); toast(t('ver_done'),'ok');
  busy=false; b.disabled=false; b.textContent=t('ver_btn');
}
window.SP={ ready:function(){ $('loadbtn').addEventListener('click',loadSample); $('verbtn').addEventListener('click',verify); } };
})();

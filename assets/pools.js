/* Zerolyn — pools page (proof-of-innocence + proof of reserves; in-browser demo) */
(function(){
'use strict';
var t=window.SP_t, S=window.SP_Sound, toast=window.SP_toast, sleep=window.SP_sleep, ZK=window.SP_ZK;
var $=function(id){return document.getElementById(id);};
var busy=false;
async function run(btnId,doneId,toastKey){
  if(busy) return; busy=true; var b=$(btnId); b.disabled=true; $(doneId).style.display='none';
  for(var i=0;i<3;i++){ S.soft(); await sleep(500+Math.random()*340); }
  ZK.makeProof(); $(doneId).style.display=''; S.success(); toast(t(toastKey),'ok'); busy=false; b.disabled=false;
}
window.SP={ ready:function(){
  $('yourdep').textContent='0x'+ZK.rndHex(10)+'\u2026';
  $('innbtn').addEventListener('click',function(){ run('innbtn','inndone','pool_inn_done'); });
  $('porbtn').addEventListener('click',function(){ run('porbtn','pordone','por_done'); });
} };
})();

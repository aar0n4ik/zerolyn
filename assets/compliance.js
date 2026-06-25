/* Zerolyn — compliance page (zkKYC proof animation; in-browser demo) */
(function(){
'use strict';
var t=window.SP_t, S=window.SP_Sound, toast=window.SP_toast, sleep=window.SP_sleep, ZK=window.SP_ZK;
var $=function(id){return document.getElementById(id);};
var busy=false;
async function runKyc(){
  if(busy) return; busy=true;
  var b=$('kycbtn'); b.disabled=true;
  $('kycdone').style.display='none';
  for(var i=0;i<3;i++){ S.soft(); await sleep(520+Math.random()*360); }
  ZK.makeProof();
  $('kycdone').style.display=''; S.success(); toast(t('comp_kyc_done'),'ok');
  busy=false; b.disabled=false;
}
window.SP={ ready:function(){ $('kycbtn').addEventListener('click',runKyc); } };
})();

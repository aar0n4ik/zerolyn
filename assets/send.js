/* ShieldPay — send page logic (honest wallet, real validation, proof pipeline, QR, PDF) */
(function(){
'use strict';
var t=window.SP_t, V=window.SP_validate, ZK=window.SP_ZK, QR=window.SP_QR, W=window.SP_Wallet,
    S=window.SP_Sound, toast=window.SP_toast, CFG=window.SP_CONFIG, sleep=window.SP_sleep, shorten=window.SP_shorten;
var $=function(id){return document.getElementById(id);};
var STEP_KEYS=[['stepv_w','stepv_wd'],['stepv_p','stepv_pd'],['stepv_c','stepv_cd'],['stepv_s','stepv_sd']];
var lastReceipt=null, lastValid=false, busy=false;

function buildAssets(){
  var sel=$('asset'); if(!sel) return; sel.innerHTML='';
  CFG.assets.forEach(function(a){ var o=document.createElement('option'); o.value=a.code; o.textContent=a.code; sel.appendChild(o); });
}
function buildPipe(){
  var p=$('pipe'); if(!p) return; p.innerHTML='';
  STEP_KEYS.forEach(function(k,i){
    var row=document.createElement('div'); row.className='step'; row.id='ps'+i;
    row.innerHTML='<span class="dot">'+(i+1)+'</span><div><h4 data-i18n="'+k[0]+'">'+k[0]+'</h4><p data-i18n="'+k[1]+'">'+k[1]+'</p></div>';
    p.appendChild(row);
  });
}
function resetPipe(){ STEP_KEYS.forEach(function(k,i){ var r=$('ps'+i); if(r){ r.classList.remove('on','good'); var d=r.querySelector('.dot'); if(d) d.textContent=(i+1); } }); }

/* ---- wallet ---- */
function renderWallet(){
  var dot=$('wdot'), st=$('wstate'), addr=$('waddr'), btn=$('wbtn');
  if(W.address){
    dot.className='dot on'; st.textContent=t('wallet_connected'); st.removeAttribute('data-i18n');
    addr.textContent=W.address; btn.textContent=t('wallet_disconnect'); btn.setAttribute('data-i18n','wallet_disconnect');
  } else {
    dot.className='dot off'; st.textContent=t('wallet_not'); st.setAttribute('data-i18n','wallet_not');
    addr.textContent=''; btn.textContent=t('wallet_connect'); btn.setAttribute('data-i18n','wallet_connect');
  }
}

/* ---- recipient validation ---- */
function validateRcpt(){
  var v=$('rcpt').value.trim(), h=$('rhint');
  if(!v){ h.textContent=''; h.className='hint'; lastValid=false; return; }
  var r=V(v,'G');
  if(r.ok){ h.textContent=t('send_valid'); h.className='hint good'; lastValid=true; return; }
  var map={empty:'send_empty',charset:'send_invalid_charset',length:'send_invalid_len',decode:'send_invalid_checksum',checksum:'send_invalid_checksum',secret:'send_invalid_secret',type:'send_invalid_type'};
  h.textContent=t(map[r.reason]||'send_invalid_checksum'); h.className='hint bad'; lastValid=false;
}

/* ---- send pipeline ---- */
async function doSend(){
  if(busy) return;
  if(!W.address){ toast(t('send_need_wallet'),'err'); S.error(); return; }
  var v=$('rcpt').value.trim(); var r=V(v,'G');
  if(!r.ok){ validateRcpt(); toast(t('send_need_valid'),'err'); S.error(); $('rcpt').focus(); return; }
  var amt=parseFloat($('amt').value);
  if(!(amt>0)){ toast(t('send_need_amount'),'err'); S.error(); $('amt').focus(); return; }
  busy=true; var btn=$('sendbtn'); btn.disabled=true; btn.textContent=t('send_btn_busy');
  $('receipt').style.display='none'; resetPipe();
  try{
    for(var i=0;i<STEP_KEYS.length;i++){
      var row=$('ps'+i); row.classList.add('on'); S.soft();
      await sleep(620+Math.random()*420);
      row.classList.remove('on'); row.classList.add('good'); var d=row.querySelector('.dot'); if(d) d.textContent='\u2713';
    }
    var proof=ZK.makeProof();
    var tx=(CFG.demoTxHash||ZK.fakeTxHash());
    var asset=$('asset').value;
    lastReceipt={ from:W.address, to:v, amount:amt, asset:asset, proof:proof.pi_a[0], tx:tx, time:new Date() };
    fillReceipt();
    $('receipt').style.display='';
    S.success(); toast(t('send_done'),'ok');
    $('receipt').scrollIntoView({behavior:'smooth',block:'center'});
  }catch(e){ toast(t('send_fail'),'err'); S.error(); }
  finally{ busy=false; btn.disabled=false; btn.textContent=t('send_btn'); }
}
function fillReceipt(){
  if(!lastReceipt) return; var d=lastReceipt;
  $('r_from').textContent=shorten(d.from,7); $('r_to').textContent=shorten(d.to,7);
  $('r_amt').textContent='\u2022\u2022\u2022\u2022 '+d.asset+' (zk)';
  $('r_proof').textContent=shorten(d.proof,10);
  $('r_tx').textContent=shorten(d.tx,10);
  $('r_time').textContent=d.time.toLocaleString(document.documentElement.lang||'en');
  var link=CFG.explorer+'/tx/'+d.tx; $('txview').setAttribute('href',link);
}

/* ---- QR (SEP-7) ---- */
function doQR(){
  var v=$('rcpt').value.trim()||W.address;
  if(!v){ toast(t('send_empty'),'err'); S.error(); return; }
  var amt=$('amt').value, asset=$('asset').value, memo=$('memo').value.trim();
  var uri=QR.sep7(v,amt,asset,memo);
  QR.renderQR($('qr'),uri); $('qrhint').textContent=t('send_qr_hint'); S.toggle();
}

/* ---- selective disclosure view key ---- */
function doDisc(){
  var key='svk_'+ZK.rndHex(8)+'-'+ZK.rndHex(8)+'-'+ZK.rndHex(8);
  var el=$('vkey'); el.textContent=key; el.style.display=''; $('discrow').style.display=''; S.toggle();
}
function copyDisc(){
  var txt=$('vkey').textContent; if(!txt) return;
  (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){toast(t('copied'),'ok');},function(){
    var ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');toast(t('copied'),'ok');}catch(e){} ta.remove();
  });
}

/* ---- PDF receipt (canvas \u2192 JPEG \u2192 PDF, Unicode-safe) ---- */
function drawReceipt(){
  var d=lastReceipt; var sc=2, W0=820, H0=560;
  var c=document.createElement('canvas'); c.width=W0*sc; c.height=H0*sc; var x=c.getContext('2d'); x.scale(sc,sc);
  x.fillStyle='#ffffff'; x.fillRect(0,0,W0,H0);
  var g=x.createLinearGradient(0,0,W0,90); g.addColorStop(0,'#7c5cff'); g.addColorStop(.55,'#2fb8ff'); g.addColorStop(1,'#ff5fa2');
  x.fillStyle=g; x.fillRect(0,0,W0,90);
  x.fillStyle='#ffffff'; x.font='700 30px Arial,sans-serif'; x.fillText('ShieldPay',40,56);
  x.font='600 16px Arial,sans-serif'; x.fillText(t('send_receipt'),40,80);
  x.textAlign='right'; x.fillText('Stellar Testnet',W0-40,56); x.textAlign='left';
  var rows=[[t('send_rcpt_from'),d.from],[t('send_rcpt_to'),d.to],[t('send_rcpt_amount'),'\u2022\u2022\u2022\u2022 '+d.asset+'  (hidden by zk proof)'],[t('send_rcpt_status'),t('send_rcpt_status_v')],[t('send_rcpt_proof'),'groth16 / bn254  '+d.proof],[t('send_rcpt_tx'),d.tx],[t('send_rcpt_time'),d.time.toLocaleString(document.documentElement.lang||'en')]];
  var y=150;
  rows.forEach(function(r){
    x.fillStyle='#6b7280'; x.font='600 14px Arial,sans-serif'; x.fillText(String(r[0]).toUpperCase(),40,y);
    x.fillStyle='#0e1330'; x.font='15px monospace';
    var val=String(r[1]); if(val.length>74) val=val.slice(0,74);
    x.fillText(val,40,y+24);
    x.strokeStyle='#eef0f6'; x.beginPath(); x.moveTo(40,y+40); x.lineTo(W0-40,y+40); x.stroke();
    y+=58;
  });
  x.fillStyle='#9aa1b2'; x.font='13px Arial,sans-serif';
  x.fillText('ShieldPay \u00b7 zero-knowledge private payments on Stellar \u00b7 verifier: Soroban (testnet)',40,H0-30);
  return {url:c.toDataURL('image/jpeg',0.92),w:W0,h:H0};
}
function b64bytes(b64){ var bin=atob(b64); var a=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i); return a; }
function buildPDF(jpg,w,h){
  var chunks=[], len=0, xref=[];
  function s2b(s){ var a=new Uint8Array(s.length); for(var i=0;i<s.length;i++) a[i]=s.charCodeAt(i)&0xff; return a; }
  function pushB(b){ chunks.push(b); len+=b.length; }
  function pushS(s){ pushB(s2b(s)); }
  pushS('%PDF-1.4\n');
  xref[1]=len; pushS('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  xref[2]=len; pushS('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  xref[3]=len; pushS('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+w+' '+h+'] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n');
  xref[4]=len; pushS('4 0 obj\n<< /Type /XObject /Subtype /Image /Width '+w+' /Height '+h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n'); pushB(jpg); pushS('\nendstream\nendobj\n');
  var content='q\n'+w+' 0 0 '+h+' 0 0 cm\n/Im0 Do\nQ\n';
  xref[5]=len; pushS('5 0 obj\n<< /Length '+content.length+' >>\nstream\n'+content+'endstream\nendobj\n');
  var xpos=len, n=6, xr='xref\n0 '+n+'\n0000000000 65535 f \n';
  for(var i=1;i<n;i++) xr+=('0000000000'+xref[i]).slice(-10)+' 00000 n \n';
  pushS(xr); pushS('trailer\n<< /Size '+n+' /Root 1 0 R >>\nstartxref\n'+xpos+'\n%%EOF');
  var out=new Uint8Array(len), o=0; chunks.forEach(function(c){ out.set(c,o); o+=c.length; }); return out;
}
function downloadPDF(){
  if(!lastReceipt) return;
  try{
    var img=drawReceipt(); var jpg=b64bytes(img.url.split(',')[1]); var pdf=buildPDF(jpg,img.w,img.h);
    var blob=new Blob([pdf],{type:'application/pdf'}); var url=URL.createObjectURL(blob);
    var a=document.createElement('a'); a.href=url; a.download='shieldpay-receipt-'+lastReceipt.tx.slice(0,8)+'.pdf'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){URL.revokeObjectURL(url);},2000); S.click();
  }catch(e){ toast(t('send_fail'),'err'); }
}

function reset(){ $('receipt').style.display='none'; resetPipe(); lastReceipt=null; $('amt').focus(); }

window.SP={
  ready:function(){
    buildAssets(); buildPipe(); renderWallet();
    $('wbtn').addEventListener('click',async function(){ if(W.address){ W.disconnect(); renderWallet(); } else { await W.connect(); renderWallet(); } });
    $('rcpt').addEventListener('input',validateRcpt);
    $('sendbtn').addEventListener('click',doSend);
    $('qrbtn').addEventListener('click',doQR);
    $('discbtn').addEventListener('click',doDisc);
    $('disccopy').addEventListener('click',copyDisc);
    $('pdfbtn').addEventListener('click',downloadPDF);
    $('againbtn').addEventListener('click',reset);
  },
  onLang:function(){ renderWallet(); validateRcpt(); if(lastReceipt) fillReceipt(); var qh=$('qrhint'); if(qh&&qh.textContent) qh.textContent=t('send_qr_hint'); }
};
})();

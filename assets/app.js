/* ShieldPay core: i18n, sound, nav/footer, wallet, validation, QR */
(function(){
'use strict';

/* ---------------- CONFIG ---------------- */
const CONFIG = {
  network:'TESTNET',
  horizon:'https://horizon-testnet.stellar.org',
  explorer:'https://stellar.expert/explorer/testnet',
  // Fill these after running scripts/deploy.sh (see README). Empty => demo mode.
  verifierContractId:'',
  poolContractId:'',
  demoTxHash:'',
  social:{ github:'#', x:'#', instagram:'#' },
  assets:[
    {code:'USDC',issuer:'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',label:'USD Coin'},
    {code:'EURC',issuer:'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO',label:'Euro Coin'},
    {code:'XLM',issuer:'native',label:'Stellar Lumens'}
  ]
};
window.SP_CONFIG = CONFIG;

/* ---------------- LANGUAGES ---------------- */
const LANGS=[
  {code:'en',flag:'\uD83C\uDDEC\uD83C\uDDE7',name:'English'},
  {code:'es',flag:'\uD83C\uDDEA\uD83C\uDDF8',name:'Espa\u00f1ol'},
  {code:'de',flag:'\uD83C\uDDE9\uD83C\uDDEA',name:'Deutsch'},
  {code:'ru',flag:'\uD83C\uDDF7\uD83C\uDDFA',name:'\u0420\u0443\u0441\u0441\u043a\u0438\u0439'},
  {code:'uk',flag:'\uD83C\uDDFA\uD83C\uDDE6',name:'\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430'}
];
window.I18N = window.I18N || {};
function t(key){ const d=window.I18N[curLang()]||window.I18N.en||{}; return (d[key]!=null?d[key]:(window.I18N.en&&window.I18N.en[key]!=null?window.I18N.en[key]:key)); }
function curLang(){ let l=localStorage.getItem('sp_lang')||(navigator.language||'en').slice(0,2); if(!LANGS.some(x=>x.code===l)) l='en'; return l; }
function applyLang(code){
  if(!LANGS.some(x=>x.code===code)) code='en';
  localStorage.setItem('sp_lang',code);
  document.documentElement.lang=code;
  const d=window.I18N[code]||window.I18N.en||{};
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const k=el.getAttribute('data-i18n'); const v=(d[k]!=null?d[k]:(window.I18N.en&&window.I18N.en[k])); if(v!=null) el.textContent=v; });
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{ const k=el.getAttribute('data-i18n-html'); const v=(d[k]!=null?d[k]:(window.I18N.en&&window.I18N.en[k])); if(v!=null) el.innerHTML=v; });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{ const k=el.getAttribute('data-i18n-ph'); const v=(d[k]!=null?d[k]:(window.I18N.en&&window.I18N.en[k])); if(v!=null) el.setAttribute('placeholder',v); });
  if(document.title.indexOf('ShieldPay')<0||true){ const pk=document.body.getAttribute('data-title-key'); if(pk&&d[pk]) document.title=d[pk]+' \u2014 ShieldPay'; }
  const lb=document.querySelector('.lang-btn .flag'), ln=document.querySelector('.lang-btn .nm'); const L=LANGS.find(x=>x.code===code);
  if(lb&&L) lb.textContent=L.flag; if(ln&&L) ln.textContent=L.code.toUpperCase();
  document.querySelectorAll('.lang-menu button').forEach(b=>b.classList.toggle('sel',b.dataset.code===code));
  if(window.SP&&typeof window.SP.onLang==='function') try{window.SP.onLang(code);}catch(e){}
}

/* ---------------- SOUND (Web Audio) ---------------- */
let AC=null, master=null, muted=localStorage.getItem('sp_muted')==='1', started=false;
function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); master=AC.createGain(); master.gain.value=0.18; master.connect(AC.destination);}catch(e){} } if(AC&&AC.state==='suspended') AC.resume(); return AC; }
function tone(freq,start,dur,type,peak){ const c=ac(); if(!c||muted) return; const o=c.createOscillator(),g=c.createGain(); o.type=type||'sine'; o.frequency.value=freq; const t0=c.currentTime+start; g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(peak||0.5,t0+0.012); g.gain.exponentialRampToValueAtTime(0.0008,t0+dur); o.connect(g); g.connect(master); o.start(t0); o.stop(t0+dur+0.02); }
const Sound={
  click(){ tone(523.25,0,0.12,'sine',0.5); tone(784,0.0,0.10,'sine',0.18); },
  soft(){ tone(392,0,0.10,'sine',0.32); },
  hover(){ tone(880,0,0.045,'sine',0.10); },
  toggle(){ tone(466,0,0.07,'triangle',0.4); tone(622,0.06,0.09,'triangle',0.3); },
  success(){ [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,i*0.085,0.34,'sine',0.42)); tone(1318.5,0.34,0.5,'sine',0.18); },
  error(){ tone(311.13,0,0.18,'sine',0.4); tone(233.08,0.12,0.26,'sine',0.4); },
  chime(){ [659.25,830.6,987.77,1318.5].forEach((f,i)=>tone(f,i*0.1,0.6,'sine',0.3)); }
};
function firstGesture(){ if(started) return; started=true; ac(); if(!muted) setTimeout(()=>Sound.chime(),60); }
['pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,firstGesture,{once:true}));
window.SP_Sound=Sound;
function setMuted(m){ muted=m; localStorage.setItem('sp_muted',m?'1':'0'); document.querySelectorAll('.mute-ic').forEach(el=>el.textContent=m?'\uD83D\uDD07':'\uD83D\uDD0A'); if(!m){ac();Sound.toggle();} }

/* ---------------- TOAST ---------------- */
function toast(msg,kind){ let el=document.getElementById('toast'); if(!el){el=document.createElement('div');el.id='toast';document.body.appendChild(el);} el.className=''; el.classList.add(kind||'info'); el.innerHTML='<span>'+msg+'</span>'; void el.offsetWidth; el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),3200); }
window.SP_toast=toast;

/* ---------------- BRAND SVGS ---------------- */
const SVG={
  logo:'<svg class="logo" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="spg" x1="0" y1="0" x2="48" y2="48"><stop stop-color="#7c5cff"/><stop offset=".55" stop-color="#2fb8ff"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs><path d="M24 3l16 6v11c0 10-6.8 18.6-16 22-9.2-3.4-16-12-16-22V9l16-6z" fill="url(#spg)"/><path d="M24 16.5l-7 4v6.2c0 .9.5 1.7 1.3 2.1L24 32l5.7-3.2c.8-.4 1.3-1.2 1.3-2.1V20.5l-7-4z" fill="#fff" opacity=".95"/></svg>',
  github:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#181717" d="M12 .5C5.7.5.5 5.7.5 12.1c0 5.1 3.3 9.4 7.9 11 .6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.6 7.9-5.9 7.9-11C23.5 5.7 18.3.5 12 .5z"/></svg>',
  x:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#000" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>',
  instagram:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="ig" cx=".3" cy="1" r="1.1"><stop offset="0" stop-color="#fdf497"/><stop offset=".15" stop-color="#fdf497"/><stop offset=".35" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset=".9" stop-color="#285AEB"/></radialGradient></defs><rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#ig)"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.4" cy="6.6" r="1.4" fill="#fff"/></svg>',
  ext:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>'
};
window.SP_SVG=SVG;

/* ---------------- NAV PAGES ---------------- */
const PAGES=[
  {href:'index.html',key:'nav_home'},
  {href:'send.html',key:'nav_send'},
  {href:'compliance.html',key:'nav_compliance'},
  {href:'pools.html',key:'nav_pools'},
  {href:'verify.html',key:'nav_verify'},
  {href:'ecosystem.html',key:'nav_ecosystem'}
];
function here(){ let p=location.pathname.split('/').pop(); if(!p||p==='') p='index.html'; return p; }
function buildNav(){
  const cur=here();
  const links=PAGES.map(p=>'<a href="'+p.href+'" class="'+(p.href===cur?'active':'')+'" data-i18n="'+p.key+'">'+p.key+'</a>').join('');
  const menu=LANGS.map(l=>'<button data-code="'+l.code+'"><span class="flag">'+l.flag+'</span><span>'+l.name+'</span></button>').join('');
  const h=document.createElement('header'); h.className='nav';
  h.innerHTML='<div class="wrap nav-in">'+
    '<a class="brand" href="index.html">'+SVG.logo+'<span>ShieldPay</span></a>'+
    '<nav class="nav-links" id="navlinks">'+links+'</nav>'+
    '<div class="nav-right">'+
      '<a class="btn btn-primary" href="send.html" data-i18n="nav_cta" style="padding:10px 18px">nav_cta</a>'+
      '<div class="lang" id="lang"><button class="lang-btn" id="langbtn"><span class="flag"></span><span class="nm"></span><span class="chev">\u25be</span></button><div class="lang-menu">'+menu+'</div></div>'+
      '<button class="icon-btn mute" id="mutebtn" title="Sound"><span class="mute-ic">\uD83D\uDD0A</span></button>'+
      '<button class="icon-btn nav-toggle" id="navtoggle">\u2630</button>'+
    '</div></div>';
  document.body.insertBefore(h,document.body.firstChild);
  const lang=h.querySelector('#lang');
  h.querySelector('#langbtn').addEventListener('click',e=>{e.stopPropagation();lang.classList.toggle('open');Sound.soft();});
  document.addEventListener('click',()=>lang.classList.remove('open'));
  h.querySelectorAll('.lang-menu button').forEach(b=>b.addEventListener('click',()=>{applyLang(b.dataset.code);lang.classList.remove('open');Sound.toggle();toast(t('lang_changed'),'info');}));
  h.querySelector('#mutebtn').addEventListener('click',()=>setMuted(!muted));
  h.querySelector('#navtoggle').addEventListener('click',()=>{document.getElementById('navlinks').classList.toggle('open');Sound.soft();});
  document.querySelectorAll('.mute-ic').forEach(el=>el.textContent=muted?'\uD83D\uDD07':'\uD83D\uDD0A');
}

/* ---------------- FOOTER ---------------- */
function buildFooter(){
  const f=document.createElement('footer'); f.className='ft';
  const prod=PAGES.map(p=>'<a href="'+p.href+'" data-i18n="'+p.key+'">'+p.key+'</a>').join('');
  const eco=['Stellar','Soroban','Circle USDC','Freighter'].map(n=>'<a href="ecosystem.html">'+n+'</a>').join('');
  const res=[['ft_docs','https://developers.stellar.org/docs/build/apps/zk'],['ft_repo',CONFIG.social.github],['ft_video','#demo-video'],['ft_dorahacks','https://dorahacks.io/hackathon/stellar-hacks-zk/detail']]
    .map(r=>'<a href="'+r[1]+'" data-i18n="'+r[0]+'" '+(r[1].startsWith('http')?'target="_blank" rel="noopener"':'')+'>'+r[0]+'</a>').join('');
  f.innerHTML='<div class="wrap">'+
   '<div class="ft-top">'+
     '<div><a class="brand" href="index.html">'+SVG.logo+'<span>ShieldPay</span></a>'+
       '<p class="ft-desc" data-i18n="ft_desc">ft_desc</p>'+
       '<div class="socials">'+
         '<a class="soc" data-soc="github" href="'+CONFIG.social.github+'" target="_blank" rel="noopener" aria-label="GitHub">'+SVG.github+(CONFIG.social.github==='#'?'<span class="soon">SOON</span>':'')+'</a>'+
         '<a class="soc" data-soc="x" href="'+CONFIG.social.x+'" target="_blank" rel="noopener" aria-label="X">'+SVG.x+(CONFIG.social.x==='#'?'<span class="soon">SOON</span>':'')+'</a>'+
         '<a class="soc" data-soc="instagram" href="'+CONFIG.social.instagram+'" target="_blank" rel="noopener" aria-label="Instagram">'+SVG.instagram+(CONFIG.social.instagram==='#'?'<span class="soon">SOON</span>':'')+'</a>'+
       '</div></div>'+
     '<div class="ft-col"><h5 data-i18n="ft_product">ft_product</h5>'+prod+'</div>'+
     '<div class="ft-col"><h5 data-i18n="ft_ecosystem">ft_ecosystem</h5>'+eco+'</div>'+
     '<div class="ft-col"><h5 data-i18n="ft_resources">ft_resources</h5>'+res+'</div>'+
   '</div>'+
   '<div class="ft-bottom"><span data-i18n="ft_rights">ft_rights</span>'+
     '<div class="pill-row"><span class="tag">ZK</span><span class="tag">Stellar</span><span class="tag">Soroban</span><span class="tag">Groth16</span></div>'+
   '</div></div>';
  document.body.appendChild(f);
  f.querySelectorAll('.soc').forEach(s=>s.addEventListener('click',function(e){ const r=document.createElement('span'); r.className='ripple'; const rect=this.getBoundingClientRect(); const d=Math.max(rect.width,rect.height); r.style.width=r.style.height=d+'px'; r.style.left=(e.clientX-rect.left-d/2)+'px'; r.style.top=(e.clientY-rect.top-d/2)+'px'; this.appendChild(r); setTimeout(()=>r.remove(),600); Sound.click(); if(this.getAttribute('href')==='#'){e.preventDefault(); toast(t('soc_soon'),'info');} }));
}

/* ---------------- SOUND DELEGATION ---------------- */
function wireSounds(){
  document.addEventListener('click',e=>{ const b=e.target.closest('.btn,.icon-btn,a.more,.nav-links a,.logo-card,.link-ext'); if(b&&!b.classList.contains('soc')) Sound.click(); });
  let last=0; document.addEventListener('pointerover',e=>{ const b=e.target.closest('.btn,.card,.soc,.logo-card'); if(!b) return; const now=Date.now(); if(now-last<90) return; last=now; Sound.hover(); });
}

/* ---------------- REVEAL ---------------- */
function wireReveal(){ const io=new IntersectionObserver((ents)=>{ents.forEach(en=>{ if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{threshold:.12}); document.querySelectorAll('.reveal').forEach(el=>io.observe(el)); }

/* ---------------- STELLAR STRKEY VALIDATION ---------------- */
const B32='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function b32decode(s){ let bits=0,val=0; const out=[]; for(const c of s){ const i=B32.indexOf(c); if(i<0) return null; val=(val<<5)|i; bits+=5; if(bits>=8){ bits-=8; out.push((val>>bits)&0xff);} } return new Uint8Array(out); }
function crc16(bytes){ let crc=0; for(let i=0;i<bytes.length;i++){ let code=(crc>>>8)&0xff; code^=bytes[i]&0xff; code^=code>>>4; crc=(crc<<8)&0xffff; crc^=code; code=(code<<5)&0xffff; crc^=code; code=(code<<7)&0xffff; crc^=code; } return crc&0xffff; }
// versionByte: G(pubkey)=6<<3=48, M(muxed)=12<<3=96
function validateStrKey(addr,expect){
  if(!addr||typeof addr!=='string') return {ok:false,reason:'empty'};
  addr=addr.trim();
  if(!/^[A-Z2-7]+$/.test(addr)) return {ok:false,reason:'charset'};
  if((expect==='G'||!expect)&&addr.length!==56) { if(addr[0]==='G') return {ok:false,reason:'length'}; }
  const data=b32decode(addr); if(!data||data.length<3) return {ok:false,reason:'decode'};
  const ver=data[0]; const payload=data.slice(0,data.length-2); const checksum=data[data.length-2]|(data[data.length-1]<<8);
  if(crc16(payload)!==checksum) return {ok:false,reason:'checksum'};
  const map={48:'G',96:'M',144:'S',184:'T'};
  const kind=map[ver]||'?';
  if(expect&&kind!==expect) return {ok:false,reason:'type',kind};
  if(kind==='S') return {ok:false,reason:'secret'};
  return {ok:true,kind};
}
function shorten(a,n){ n=n||6; return a&&a.length>n*2?a.slice(0,n)+'\u2026'+a.slice(-n):a; }

/* ---------------- FREIGHTER WALLET ---------------- */
const Wallet={ address:null, connecting:false,
  api(){ return window.freighterApi||(window.freighter&&window.freighter.api)||null; },
  installed(){ return !!this.api(); },
  async connect(){ const api=this.api(); if(!api){ toast(t('wallet_install'),'err'); window.open('https://www.freighter.app/','_blank'); return null; } this.connecting=true; try{ if(api.setAllowed) await api.setAllowed(); let pk=null; if(api.getAddress){ const r=await api.getAddress(); pk=r&&(r.address||r); } else if(api.getPublicKey){ pk=await api.getPublicKey(); } this.address=pk; Sound.success(); toast(t('wallet_connected'),'ok'); return pk; }catch(e){ toast(t('wallet_rejected'),'err'); Sound.error(); return null; } finally{ this.connecting=false; } },
  disconnect(){ this.address=null; toast(t('wallet_disconnected'),'info'); }
};
window.SP_Wallet=Wallet;

/* ---------------- QR (SEP-7) ---------------- */
function sep7(dest,amount,asset,memo){ let u='web+stellar:pay?destination='+encodeURIComponent(dest); if(amount) u+='&amount='+encodeURIComponent(amount); if(asset&&asset!=='XLM') u+='&asset_code='+encodeURIComponent(asset); if(memo) u+='&memo='+encodeURIComponent(memo); return u; }
function renderQR(el,text){ el.innerHTML=''; if(window.QRCode){ try{ new window.QRCode(el,{text:text,width:180,height:180,colorDark:'#0e1330',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M}); return true;}catch(e){} } const img=document.createElement('img'); img.alt='QR'; img.width=180;img.height=180; img.src='https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+encodeURIComponent(text); el.appendChild(img); return true; }
window.SP_QR={sep7,renderQR};

/* ---------------- ZK PROOF SIM (Groth16-shaped, honest demo) ---------------- */
function rndHex(n){ const c='0123456789abcdef'; let s=''; for(let i=0;i<n;i++) s+=c[Math.floor(Math.random()*16)]; return s; }
function fieldEl(){ return '0x'+rndHex(62); }
function makeProof(){ return { protocol:'groth16', curve:'bn254', pi_a:[fieldEl(),fieldEl()], pi_b:[[fieldEl(),fieldEl()],[fieldEl(),fieldEl()]], pi_c:[fieldEl(),fieldEl()] }; }
function fakeTxHash(){ return rndHex(64); }
window.SP_ZK={makeProof,fakeTxHash,rndHex};

/* sleep + step animator */
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
window.SP_sleep=sleep;

/* ---------------- INIT ---------------- */
function init(){ buildNav(); buildFooter(); wireSounds(); wireReveal(); applyLang(curLang()); window.SP=window.SP||{}; if(typeof window.SP.ready==='function'){ try{window.SP.ready();}catch(e){console.error(e);} } }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
window.SP_applyLang=applyLang; window.SP_t=t; window.SP_validate=validateStrKey; window.SP_shorten=shorten;
})();

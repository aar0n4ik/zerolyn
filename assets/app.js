/* Zerolyn core: i18n, nav/footer, wallet, validation, QR (no audio) */
(function(){
'use strict';

/* ---------------- CONFIG ---------------- */
const CONFIG = {
  network:'TESTNET',
  horizon:'https://horizon-testnet.stellar.org',
  explorer:'https://stellar.expert/explorer/testnet',
  // Live Soroban contracts deployed to Stellar Testnet (see README for tx hashes).
  verifierContractId:'CCEMEBDWMAOOPFHFQNFCH5BNGYKX43EB44RNKQP3ESGKH2JZYUXXYV5Z',
  poolContractId:'CAIIMNX2IWN7PQDNWCTW6C4CBF2WNPTYQF6GMOSP6PVPNPSHTB3BGGYE',
  aspContractId:'CD6XBLR6AG5K5TNLKVO2JWLFYHBFXCEFT25Q2XEAE2XBYM7JZFZOEIO6',
  adminAddress:'GCY6UL7B6P5LNOEGAU2FULWNX6Q6RZFN4QUW2DC5CY26J6DKR6GFRJBE',
  verifierTxHash:'40542a580b4c09a91747cabb9ab629a06b88627a044d62d9c2cca5d5a1b1566e',
  demoTxHash:'40542a580b4c09a91747cabb9ab629a06b88627a044d62d9c2cca5d5a1b1566e',
  social:{ github:'https://github.com/aar0n4ik', x:'https://x.com/_AARON4IK_', instagram:'https://www.instagram.com/bohdan.aaron4ik/' },
  assets:[
    {code:'USDC',issuer:'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',label:'USD Coin'},
    {code:'EURC',issuer:'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO',label:'Euro Coin'},
    {code:'XLM',issuer:'native',label:'Stellar Lumens'}
  ]
};
window.SP_CONFIG = CONFIG;

/* ---------------- LANGUAGES (inline SVG flags: render on every OS incl. Windows) ---------------- */
const FLAG={
us:'<svg viewBox="0 0 20 14" class="flg" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#fff"/><rect width="20" height="2" y="0" fill="#b22234"/><rect width="20" height="2" y="4" fill="#b22234"/><rect width="20" height="2" y="8" fill="#b22234"/><rect width="20" height="2" y="12" fill="#b22234"/><rect width="9" height="6" fill="#3c3b6e"/></svg>',
es:'<svg viewBox="0 0 20 14" class="flg" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#c60b1e"/><rect width="20" height="7" y="3.5" fill="#ffc400"/></svg>',
de:'<svg viewBox="0 0 20 14" class="flg" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#000"/><rect width="20" height="4.7" y="4.7" fill="#dd0000"/><rect width="20" height="4.6" y="9.4" fill="#ffce00"/></svg>',
ru:'<svg viewBox="0 0 20 14" class="flg" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#fff"/><rect width="20" height="4.7" y="4.7" fill="#0039a6"/><rect width="20" height="4.6" y="9.4" fill="#d52b1e"/></svg>',
ua:'<svg viewBox="0 0 20 14" class="flg" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="14" fill="#0057b7"/><rect width="20" height="7" y="7" fill="#ffd700"/></svg>'
};
const LANGS=[
  {code:'en',flag:FLAG.us,name:'English'},
  {code:'es',flag:FLAG.es,name:'Español'},
  {code:'de',flag:FLAG.de,name:'Deutsch'},
  {code:'ru',flag:FLAG.ru,name:'Русский'},
  {code:'uk',flag:FLAG.ua,name:'Українська'}
];
window.I18N = window.I18N || {};

/* ---------- Truthful post-deploy copy overrides (contracts live on Stellar Testnet) ---------- */
(function(){ function M(l,o){ window.I18N[l]=Object.assign(window.I18N[l]||{},o); }
  M('en',{wallet_demo:'Demo wallet connected (no Freighter found)',hero_t2n:'3',hero_t2l:'Live Testnet contracts',f1_d:'Send USDC, EURC or XLM with amounts and balances hidden by a Groth16 proof. Our Soroban verifier contract is live on Stellar Testnet.',f6_d:'Proofs are checked against our Groth16 verifier; the public Soroban verifier contract is deployed and callable on Stellar Testnet — open it in the explorer.',how_s3d:'Our Soroban verifier contract — deployed on Stellar Testnet — checks the proof and is designed to settle the shielded transfer.',cta_p:'Connect a wallet, generate a zero-knowledge proof in your browser, and open our live verifier contract on Stellar Testnet.',send_lead:'Amounts and balances stay hidden behind a zero-knowledge proof. The recipient address is fully validated and the Groth16 proof is generated in your browser.',send_done:'Groth16 proof generated · shielded transfer simulated (demo)',stepv_cd:'verifier live on Stellar Testnet',stepv_sd:'Stellar Testnet (simulated)',ver_lead:'Paste any Zerolyn zero-knowledge proof. We check its Groth16 structure in your browser, then link our verifier contract — live on Stellar Testnet.',ver_onchain:'Verifier contract on Stellar Testnet',ver_done:'Structure valid · verifier live on Stellar Testnet',ver_tx:'Verifier deploy tx',send_rcpt_tx:'Verifier deploy tx',send_rcpt_status_v:'Shielded · amount hidden (demo)'});
  M('es',{wallet_demo:'Billetera demo conectada (no se encontró Freighter)',hero_t2n:'3',hero_t2l:'Contratos activos en Testnet',f1_d:'Envía USDC, EURC o XLM con importes y saldos ocultos por una prueba Groth16. Nuestro contrato verificador Soroban está activo en Stellar Testnet.',f6_d:'Las pruebas se comprueban con nuestro verificador Groth16; el contrato verificador Soroban público está desplegado y disponible en Stellar Testnet — ábrelo en el explorador.',how_s3d:'Nuestro contrato verificador Soroban — desplegado en Stellar Testnet — comprueba la prueba y está diseñado para liquidar la transferencia blindada.',cta_p:'Conecta una billetera, genera una prueba de conocimiento cero en tu navegador y abre nuestro contrato verificador activo en Stellar Testnet.',send_lead:'Los importes y saldos quedan ocultos tras una prueba de conocimiento cero. La dirección del destinatario se valida y la prueba Groth16 se genera en tu navegador.',send_done:'Prueba Groth16 generada · transferencia blindada simulada (demo)',stepv_cd:'verificador activo en Stellar Testnet',stepv_sd:'Stellar Testnet (simulado)',ver_lead:'Pega cualquier prueba de conocimiento cero de Zerolyn. Comprobamos su estructura Groth16 en tu navegador y enlazamos nuestro contrato verificador, activo en Stellar Testnet.',ver_onchain:'Contrato verificador en Stellar Testnet',ver_done:'Estructura válida · verificador activo en Stellar Testnet',ver_tx:'Tx de despliegue del verificador',send_rcpt_tx:'Tx de despliegue del verificador',send_rcpt_status_v:'Blindado · importe oculto (demo)'});
  M('de',{wallet_demo:'Demo-Wallet verbunden (kein Freighter gefunden)',hero_t2n:'3',hero_t2l:'Live-Contracts im Testnet',f1_d:'Sende USDC, EURC oder XLM mit von einem Groth16-Proof verborgenen Beträgen und Guthaben. Unser Soroban-Verifizierungsvertrag ist live im Stellar Testnet.',f6_d:'Proofs werden gegen unseren Groth16-Verifizierer geprüft; der öffentliche Soroban-Verifizierungsvertrag ist im Stellar Testnet deployt und aufrufbar — öffne ihn im Explorer.',how_s3d:'Unser Soroban-Verifizierungsvertrag — im Stellar Testnet deployt — prüft den Proof und ist darauf ausgelegt, die abgeschirmte Überweisung abzuschließen.',cta_p:'Verbinde eine Wallet, erzeuge im Browser einen Zero-Knowledge-Proof und öffne unseren Live-Verifizierungsvertrag im Stellar Testnet.',send_lead:'Beträge und Guthaben bleiben hinter einem Zero-Knowledge-Proof verborgen. Die Empfängeradresse wird validiert und der Groth16-Proof im Browser erzeugt.',send_done:'Groth16-Proof erzeugt · abgeschirmte Überweisung simuliert (Demo)',stepv_cd:'Verifizierer live im Stellar Testnet',stepv_sd:'Stellar Testnet (simuliert)',ver_lead:'Füge einen beliebigen Zerolyn-Zero-Knowledge-Proof ein. Wir prüfen seine Groth16-Struktur im Browser und verlinken unseren Verifizierungsvertrag — live im Stellar Testnet.',ver_onchain:'Verifizierungsvertrag im Stellar Testnet',ver_done:'Struktur gültig · Verifizierer live im Stellar Testnet',ver_tx:'Verifizierer-Deploy-Tx',send_rcpt_tx:'Verifizierer-Deploy-Tx',send_rcpt_status_v:'Abgeschirmt · Betrag verborgen (Demo)'});
  M('ru',{wallet_demo:'Подключён демо-кошелёк (Freighter не найден)',hero_t2n:'3',hero_t2l:'Контракта в Testnet',f1_d:'Отправляйте USDC, EURC или XLM со скрытыми доказательством Groth16 суммами и балансами. Наш контракт-верификатор Soroban развёрнут в Stellar Testnet.',f6_d:'Доказательства проверяются нашим верификатором Groth16; публичный контракт-верификатор Soroban развёрнут и доступен в Stellar Testnet — откройте его в эксплорере.',how_s3d:'Наш контракт-верификатор Soroban — развёрнут в Stellar Testnet — проверяет доказательство и предназначен для завершения защищённого перевода.',cta_p:'Подключите кошелёк, сгенерируйте zero-knowledge доказательство в браузере и откройте наш контракт-верификатор в Stellar Testnet.',send_lead:'Суммы и балансы остаются скрыты за zero-knowledge доказательством. Адрес получателя проверяется, а доказательство Groth16 генерируется в браузере.',send_done:'Доказательство Groth16 сгенерировано · защищённый перевод смоделирован (демо)',stepv_cd:'верификатор развёрнут в Stellar Testnet',stepv_sd:'Stellar Testnet (демо)',ver_lead:'Вставьте любое zero-knowledge доказательство Zerolyn. Мы проверяем его структуру Groth16 в браузере и даём ссылку на наш контракт-верификатор — развёрнут в Stellar Testnet.',ver_onchain:'Контракт-верификатор в Stellar Testnet',ver_done:'Структура верна · верификатор развёрнут в Stellar Testnet',ver_tx:'Tx развёртывания верификатора',send_rcpt_tx:'Tx развёртывания верификатора',send_rcpt_status_v:'Защищено · сумма скрыта (демо)'});
  M('uk',{wallet_demo:'Підключено демо-гаманець (Freighter не знайдено)',hero_t2n:'3',hero_t2l:'Контракти в Testnet',f1_d:'Надсилайте USDC, EURC або XLM із прихованими доказом Groth16 сумами та балансами. Наш контракт-верифікатор Soroban розгорнуто в Stellar Testnet.',f6_d:'Докази перевіряються нашим верифікатором Groth16; публічний контракт-верифікатор Soroban розгорнуто й доступний у Stellar Testnet — відкрийте його в експлорері.',how_s3d:'Наш контракт-верифікатор Soroban — розгорнуто в Stellar Testnet — перевіряє доказ і призначений завершувати захищений переказ.',cta_p:'Підключіть гаманець, згенеруйте zero-knowledge доказ у браузері й відкрийте наш контракт-верифікатор у Stellar Testnet.',send_lead:'Суми та баланси лишаються прихованими за zero-knowledge доказом. Адреса отримувача перевіряється, а доказ Groth16 генерується у браузері.',send_done:'Доказ Groth16 згенеровано · захищений переказ змодельовано (демо)',stepv_cd:'верифікатор розгорнуто в Stellar Testnet',stepv_sd:'Stellar Testnet (демо)',ver_lead:'Вставте будь-який zero-knowledge доказ Zerolyn. Ми перевіряємо його структуру Groth16 у браузері й даємо посилання на наш контракт-верифікатор — розгорнуто в Stellar Testnet.',ver_onchain:'Контракт-верифікатор у Stellar Testnet',ver_done:'Структура вірна · верифікатор розгорнуто в Stellar Testnet',ver_tx:'Tx розгортання верифікатора',send_rcpt_tx:'Tx розгортання верифікатора',send_rcpt_status_v:'Захищено · суму приховано (демо)'});
})();

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
  const pk=document.body.getAttribute('data-title-key'); if(pk&&d[pk]) document.title=d[pk]+' — Zerolyn';
  const lb=document.querySelector('.lang-btn .flag'), ln=document.querySelector('.lang-btn .nm'); const L=LANGS.find(x=>x.code===code);
  if(lb&&L) lb.innerHTML=L.flag; if(ln&&L) ln.textContent=L.code.toUpperCase();
  document.querySelectorAll('.lang-menu button').forEach(b=>b.classList.toggle('sel',b.dataset.code===code));
  if(window.SP&&typeof window.SP.onLang==='function') try{window.SP.onLang(code);}catch(e){}
}

/* ---------------- SOUND removed (no audio anywhere). No-op shim keeps page scripts working. ---------------- */
const Sound={click(){},soft(){},hover(){},toggle(){},success(){},error(){},chime(){}};
window.SP_Sound=Sound;

/* ---------------- TOAST ---------------- */
function toast(msg,kind){ let el=document.getElementById('toast'); if(!el){el=document.createElement('div');el.id='toast';document.body.appendChild(el);} el.className=''; el.classList.add(kind||'info'); el.innerHTML='<span>'+msg+'</span>'; void el.offsetWidth; el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),3200); }
window.SP_toast=toast;

/* ---------------- BRAND SVGS ---------------- */
const SVG={
  logo:'<svg class="logo" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="spg" x1="6" y1="3" x2="42" y2="45" gradientUnits="userSpaceOnUse"><stop stop-color="#1d4ed8"/><stop offset=".5" stop-color="#2f7bff"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs><path d="M24 3.2l16.4 5.7c.8.3 1.4 1.1 1.4 2v9.8c0 10.4-6.9 19.6-16.9 23.1a2.6 2.6 0 0 1-1.8 0C13.1 40.3 6.2 31.1 6.2 20.7v-9.8c0-.9.6-1.7 1.4-2L24 3.2z" fill="url(#spg)"/><path d="M24 14.2L33.4 23.6H28V33H20V23.6H14.6Z" fill="#fff" fill-opacity=".96"/><path d="M33.1 11.4l.85 2.35 2.35.85-2.35.85-.85 2.35-.85-2.35-2.35-.85 2.35-.85z" fill="#fff" fill-opacity=".9"/></svg>',
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
    '<a class="brand" href="index.html">'+SVG.logo+'<span>Zerolyn</span></a>'+
    '<nav class="nav-links" id="navlinks">'+links+'</nav>'+
    '<div class="nav-right">'+
      '<a class="btn btn-primary" href="send.html" data-i18n="nav_cta" style="padding:10px 18px">nav_cta</a>'+
      '<div class="lang" id="lang"><button class="lang-btn" id="langbtn"><span class="flag"></span><span class="nm"></span><span class="chev">▾</span></button><div class="lang-menu">'+menu+'</div></div>'+
      '<button class="icon-btn nav-toggle" id="navtoggle">☰</button>'+
    '</div></div>';
  document.body.insertBefore(h,document.body.firstChild);
  const lang=h.querySelector('#lang');
  h.querySelector('#langbtn').addEventListener('click',e=>{e.stopPropagation();lang.classList.toggle('open');});
  document.addEventListener('click',()=>lang.classList.remove('open'));
  h.querySelectorAll('.lang-menu button').forEach(b=>b.addEventListener('click',()=>{applyLang(b.dataset.code);lang.classList.remove('open');toast(t('lang_changed'),'info');}));
  h.querySelector('#navtoggle').addEventListener('click',()=>{document.getElementById('navlinks').classList.toggle('open');});
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
     '<div><a class="brand" href="index.html">'+SVG.logo+'<span>Zerolyn</span></a>'+
       '<p class="ft-desc" data-i18n="ft_desc">ft_desc</p>'+
       '<div class="socials">'+
         '<a class="soc" data-soc="github" href="'+CONFIG.social.github+'" target="_blank" rel="noopener" aria-label="GitHub">'+SVG.github+'</a>'+
         '<a class="soc" data-soc="x" href="'+CONFIG.social.x+'" target="_blank" rel="noopener" aria-label="X">'+SVG.x+'</a>'+
         '<a class="soc" data-soc="instagram" href="'+CONFIG.social.instagram+'" target="_blank" rel="noopener" aria-label="Instagram">'+SVG.instagram+'</a>'+
       '</div></div>'+
     '<div class="ft-col"><h5 data-i18n="ft_product">ft_product</h5>'+prod+'</div>'+
     '<div class="ft-col"><h5 data-i18n="ft_ecosystem">ft_ecosystem</h5>'+eco+'</div>'+
     '<div class="ft-col"><h5 data-i18n="ft_resources">ft_resources</h5>'+res+'</div>'+
   '</div>'+
   '<div class="ft-bottom"><span data-i18n="ft_rights">ft_rights</span>'+
     '<div class="pill-row"><span class="tag">ZK</span><span class="tag">Stellar</span><span class="tag">Soroban</span><span class="tag">Groth16</span></div>'+
   '</div></div>';
  document.body.appendChild(f);
  f.querySelectorAll('.soc').forEach(s=>s.addEventListener('click',function(e){ const r=document.createElement('span'); r.className='ripple'; const rect=this.getBoundingClientRect(); const d=Math.max(rect.width,rect.height); r.style.width=r.style.height=d+'px'; r.style.left=(e.clientX-rect.left-d/2)+'px'; r.style.top=(e.clientY-rect.top-d/2)+'px'; this.appendChild(r); setTimeout(()=>r.remove(),600); }));
}

/* ---------------- REVEAL ---------------- */
function wireReveal(){ const io=new IntersectionObserver((ents)=>{ents.forEach(en=>{ if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{threshold:.12}); document.querySelectorAll('.reveal').forEach(el=>io.observe(el)); }

/* ---------------- STELLAR STRKEY VALIDATION ---------------- */
const B32='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function b32decode(s){ let bits=0,val=0; const out=[]; for(const c of s){ const i=B32.indexOf(c); if(i<0) return null; val=(val<<5)|i; bits+=5; if(bits>=8){ bits-=8; out.push((val>>bits)&0xff);} } return new Uint8Array(out); }
function crc16(bytes){ let crc=0; for(let i=0;i<bytes.length;i++){ let code=(crc>>>8)&0xff; code^=bytes[i]&0xff; code^=code>>>4; crc=(crc<<8)&0xffff; crc^=code; code=(code<<5)&0xffff; crc^=code; code=(code<<7)&0xffff; crc^=code; } return crc&0xffff; }
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
function shorten(a,n){ n=n||6; return a&&a.length>n*2?a.slice(0,n)+'…'+a.slice(-n):a; }

/* ---------------- FREIGHTER WALLET (with honest demo fallback) ---------------- */
const DEMO_ADDR='GDEMOWALLET000000000000000000000000000000000000000TESTNET';
const Wallet={ address:null, connecting:false, demo:false,
  api(){ return window.freighterApi||(window.freighter&&window.freighter.api)||null; },
  installed(){ return !!this.api(); },
  async connect(){
    const api=this.api();
    if(!api){
      // No Freighter extension found: connect a clearly-labelled demo wallet so the flow is fully testable.
      this.address=DEMO_ADDR; this.demo=true; toast(t('wallet_demo'),'info'); return this.address;
    }
    this.connecting=true;
    try{
      if(api.setAllowed) await api.setAllowed();
      let pk=null;
      if(api.getAddress){ const r=await api.getAddress(); pk=r&&(r.address||r); }
      else if(api.getPublicKey){ pk=await api.getPublicKey(); }
      if(!pk){ this.address=DEMO_ADDR; this.demo=true; toast(t('wallet_demo'),'info'); return this.address; }
      this.address=pk; this.demo=false; toast(t('wallet_connected'),'ok'); return pk;
    }catch(e){ toast(t('wallet_rejected'),'err'); return null; }
    finally{ this.connecting=false; }
  },
  disconnect(){ this.address=null; this.demo=false; toast(t('wallet_disconnected'),'info'); }
};
window.SP_Wallet=Wallet;

/* ---------------- QR (SEP-7) ---------------- */
function sep7(dest,amount,asset,memo){ let u='web+stellar:pay?destination='+encodeURIComponent(dest); if(amount) u+='&amount='+encodeURIComponent(amount); if(asset&&asset!=='XLM') u+='&asset_code='+encodeURIComponent(asset); if(memo) u+='&memo='+encodeURIComponent(memo); return u; }
function renderQR(el,text){ el.innerHTML=''; if(window.QRCode){ try{ new window.QRCode(el,{text:text,width:180,height:180,colorDark:'#0b1020',colorLight:'#ffffff',correctLevel:window.QRCode.CorrectLevel.M}); return true;}catch(e){} } const img=document.createElement('img'); img.alt='QR'; img.width=180;img.height=180; img.src='https://api.qrserver.com/v1/create-qr-code/?size=180x180&data='+encodeURIComponent(text); el.appendChild(img); return true; }
window.SP_QR={sep7,renderQR};

/* ---------------- ZK PROOF SIM (Groth16-shaped, honest demo) ---------------- */
function rndHex(n){ const c='0123456789abcdef'; let s=''; for(let i=0;i<n;i++) s+=c[Math.floor(Math.random()*16)]; return s; }
function fieldEl(){ return '0x'+rndHex(62); }
function makeProof(){ return { protocol:'groth16', curve:'bn254', pi_a:[fieldEl(),fieldEl()], pi_b:[[fieldEl(),fieldEl()],[fieldEl(),fieldEl()]], pi_c:[fieldEl(),fieldEl()] }; }
function fakeTxHash(){ return rndHex(64); }
window.SP_ZK={makeProof,fakeTxHash,rndHex};

/* sleep */
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
window.SP_sleep=sleep;

/* ---------------- INIT ---------------- */
function init(){ buildNav(); buildFooter(); wireReveal(); applyLang(curLang()); window.SP=window.SP||{}; if(typeof window.SP.ready==='function'){ try{window.SP.ready();}catch(e){console.error(e);} } }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
window.SP_applyLang=applyLang; window.SP_t=t; window.SP_validate=validateStrKey; window.SP_shorten=shorten;
})();

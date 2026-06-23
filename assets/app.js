/* ShieldPay front-end logic: i18n, sounds, animations */
(function(){
  "use strict";
  var LANGS=[
    {code:"en",flag:"\uD83C\uDDEC\uD83C\uDDE7",name:"English"},
    {code:"es",flag:"\uD83C\uDDEA\uD83C\uDDF8",name:"Espa\u00f1ol"},
    {code:"de",flag:"\uD83C\uDDE9\uD83C\uDDEA",name:"Deutsch"},
    {code:"ru",flag:"\uD83C\uDDF7\uD83C\uDDFA",name:"\u0420\u0443\u0441\u0441\u043a\u0438\u0439"},
    {code:"uk",flag:"\uD83C\uDDFA\uD83C\uDDE6",name:"\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430"}
  ];
  var I18N=window.I18N||{};
  var cur=localStorage.getItem("sp_lang")||"en";
  if(!I18N[cur])cur="en";
  function dict(code){return I18N[code]||I18N.en||{};}
  function t(key){var d=dict(cur);if(d[key]!=null)return d[key];var e=I18N.en||{};return e[key]!=null?e[key]:"";}
  function applyLang(code){
    if(!I18N[code])code="en";
    cur=code;localStorage.setItem("sp_lang",code);
    document.documentElement.setAttribute("lang",code);
    var nodes=document.querySelectorAll("[data-i18n]");
    for(var i=0;i<nodes.length;i++){
      var k=nodes[i].getAttribute("data-i18n");
      var v=t(k);
      if(v!=="")nodes[i].innerHTML=v;
    }
    var info=LANGS.filter(function(l){return l.code===code;})[0]||LANGS[0];
    var curEl=document.getElementById("langCur");
    if(curEl)curEl.innerHTML=info.flag+" <span class=\"lc\">"+info.name+"</span>";
    var items=document.querySelectorAll("#langMenu .lang-item");
    for(var j=0;j<items.length;j++){
      items[j].setAttribute("aria-selected",items[j].getAttribute("data-code")===code?"true":"false");
    }
    updateMute();
  }
  /* ---------- Web Audio ---------- */
  var AC=null,muted=localStorage.getItem("sp_muted")==="1";
  function ctx(){if(muted)return null;try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();}catch(e){return null;}return AC;}
  function tone(freq,dur,type,vol,when){var c=ctx();if(!c)return;var t0=c.currentTime+(when||0);var o=c.createOscillator();var g=c.createGain();o.type=type||"sine";o.frequency.setValueAtTime(freq,t0);g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol||0.18,t0+0.012);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);o.connect(g);g.connect(c.destination);o.start(t0);o.stop(t0+dur+0.02);}
  function clickSound(){tone(523.25,0.12,"triangle",0.16);tone(783.99,0.14,"sine",0.10,0.04);}
  function hoverTick(){tone(880,0.05,"sine",0.05);}
  function successChord(){var n=[523.25,659.25,783.99,1046.5];for(var i=0;i<n.length;i++)tone(n[i],0.5,"sine",0.10,i*0.08);}
  function startupChime(){var n=[392,523.25,659.25,880];for(var i=0;i<n.length;i++)tone(n[i],0.6,"triangle",0.09,i*0.12);}
  function updateMute(){var b=document.getElementById("muteBtn");if(!b)return;b.innerHTML=muted?t("sound_off"):t("sound_on");b.setAttribute("aria-pressed",muted?"true":"false");}
  /* ---------- DOM ready ---------- */
  document.addEventListener("DOMContentLoaded",function(){
    /* build language menu */
    var menu=document.getElementById("langMenu");
    if(menu){
      menu.innerHTML="";
      LANGS.forEach(function(l){
        var it=document.createElement("button");
        it.className="lang-item";it.type="button";it.setAttribute("data-code",l.code);it.setAttribute("role","option");
        it.innerHTML="<span class=\"fl\">"+l.flag+"</span><span>"+l.name+"</span>";
        it.addEventListener("click",function(){applyLang(l.code);clickSound();closeLang();});
        it.addEventListener("mouseenter",hoverTick);
        menu.appendChild(it);
      });
    }
    var langBtn=document.getElementById("langBtn");
    function openLang(){var m=document.getElementById("langMenu");if(m){m.classList.add("open");if(langBtn)langBtn.setAttribute("aria-expanded","true");}}
    function closeLang(){var m=document.getElementById("langMenu");if(m){m.classList.remove("open");if(langBtn)langBtn.setAttribute("aria-expanded","false");}}
    if(langBtn){langBtn.addEventListener("click",function(e){e.stopPropagation();var m=document.getElementById("langMenu");if(m&&m.classList.contains("open")){closeLang();}else{openLang();clickSound();}});}
    document.addEventListener("click",function(e){var w=document.getElementById("langWrap");if(w&&!w.contains(e.target))closeLang();});
    window.__spCloseLang=closeLang;
    /* mute toggle */
    var mute=document.getElementById("muteBtn");
    if(mute){mute.addEventListener("click",function(){muted=!muted;localStorage.setItem("sp_muted",muted?"1":"0");updateMute();if(!muted)clickSound();});}
    /* smooth scroll for in-page anchors */
    var links=document.querySelectorAll('a[href^="#"]');
    for(var i=0;i<links.length;i++){
      links[i].addEventListener("click",function(e){var id=this.getAttribute("href");if(id.length>1){var el=document.querySelector(id);if(el){e.preventDefault();clickSound();el.scrollIntoView({behavior:"smooth",block:"start"});}}});
    }
    /* generic button/cta sounds */
    var clickers=document.querySelectorAll(".btn,.cta,.nav-link");
    for(var c=0;c<clickers.length;c++){clickers[c].addEventListener("mouseenter",hoverTick);}
    /* social ripple */
    var socials=document.querySelectorAll(".social");
    for(var s=0;s<socials.length;s++){
      socials[s].addEventListener("click",function(e){
        e.preventDefault();clickSound();
        var r=document.createElement("span");r.className="ripple";
        var rect=this.getBoundingClientRect();var size=Math.max(rect.width,rect.height);
        r.style.width=r.style.height=size+"px";
        r.style.left=(e.clientX-rect.left-size/2)+"px";
        r.style.top=(e.clientY-rect.top-size/2)+"px";
        this.appendChild(r);setTimeout(function(){r.remove();},620);
      });
      socials[s].addEventListener("mouseenter",hoverTick);
    }
    /* reveal on scroll */
    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(entries){entries.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);}});},{threshold:0.12});
      var rev=document.querySelectorAll(".reveal");for(var r2=0;r2<rev.length;r2++)io.observe(rev[r2]);
    }else{var rv=document.querySelectorAll(".reveal");for(var r3=0;r3<rv.length;r3++)rv[r3].classList.add("in");}
    /* demo console */
    var sendBtn=document.getElementById("demoSend");
    var out=document.getElementById("demoOut");
    if(sendBtn&&out){
      sendBtn.addEventListener("click",function(){
        var amtEl=document.getElementById("demoAmt");
        var amt=amtEl&&amtEl.value?amtEl.value:"250.00";
        sendBtn.disabled=true;out.innerHTML="";
        var steps=["js_s1","js_s2","js_s3","js_s4","js_s5","js_s6"];
        var d=0;
        steps.forEach(function(k,idx){
          setTimeout(function(){
            var line=document.createElement("div");line.className="cline";
            var txt=t(k).replace("{amt}",amt);
            line.innerHTML=txt;out.appendChild(line);out.scrollTop=out.scrollHeight;
            if(idx<steps.length-1){tone(660+idx*60,0.06,"sine",0.05);}else{successChord();sendBtn.disabled=false;}
          },d);
          d+=(idx===4?900:650);
        });
      });
    }
    /* init language + startup chime on first interaction */
    applyLang(cur);
    var chimed=false;
    function firstInteract(){if(chimed)return;chimed=true;startupChime();window.removeEventListener("pointerdown",firstInteract);window.removeEventListener("keydown",firstInteract);}
    window.addEventListener("pointerdown",firstInteract);
    window.addEventListener("keydown",firstInteract);
  });
})();

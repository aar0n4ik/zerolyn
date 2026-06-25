/* Zerolyn — Send page "Liquid Porcelain" progressive enhancement.
   Cinematic reveal, floating-label sync, and receipt micro-confetti.
   Pure vanilla, no deps. Every existing payment / ZK hook is left untouched. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1) Apple-style staggered intro: blur-fade + gentle scale-up */
  function intro() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal-lux'));
    if (!els.length) return;
    if (reduce) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    els.forEach(function (el, i) { el.style.transitionDelay = Math.min(i * 70, 560) + 'ms'; });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        els.forEach(function (el) { el.classList.add('in'); });
      });
    });
    // Clear the stagger delay after the entrance so later interactions feel instant.
    setTimeout(function () { els.forEach(function (el) { el.style.transitionDelay = ''; }); }, 1400);
  }

  /* 2) Floating-label sync for the premium fields */
  function syncField(input) {
    var field = input.closest ? input.closest('.lux-field') : null;
    if (!field) return;
    var filled;
    if (input.tagName === 'SELECT') {
      filled = true;
    } else {
      filled = !!(input.value && input.value.trim().length);
    }
    field.classList.toggle('filled', filled);
  }

  function fields() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.lux-field .input'));
    inputs.forEach(function (input) {
      ['input', 'change', 'blur', 'focus'].forEach(function (ev) {
        input.addEventListener(ev, function () { syncField(input); });
      });
      syncField(input);
    });
    // Re-sync after values may be set programmatically (wallet autofill, i18n, etc.).
    setTimeout(function () { inputs.forEach(syncField); }, 300);
    setTimeout(function () { inputs.forEach(syncField); }, 1000);
  }

  /* 3) High-end micro-confetti inside the receipt card on success */
  var confettiOn = false;

  function confetti(card) {
    if (reduce || !card) return;
    var canvas = document.createElement('canvas');
    canvas.className = 'lux-confetti';
    card.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    if (!ctx) { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); return; }
    var dpr = window.devicePixelRatio || 1;
    var rect = card.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var colors = ['#c9a86a', '#e3d6b6', '#b7bfcc', '#3b414c', '#9aa3b2', '#efe7d6'];
    var parts = [];
    var N = 72;
    for (var i = 0; i < N; i++) {
      parts.push({
        x: W * (0.3 + Math.random() * 0.4),
        y: H * 0.28 + (Math.random() * 20 - 10),
        vx: (Math.random() - 0.5) * 5.5,
        vy: -(2 + Math.random() * 5),
        g: 0.12 + Math.random() * 0.08,
        s: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        c: colors[(Math.random() * colors.length) | 0]
      });
    }

    var frame = 0, max = 150;
    function tick() {
      frame++;
      ctx.clearRect(0, 0, W, H);
      var alpha = Math.max(0, 1 - frame / max);
      parts.forEach(function (p) {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      });
      if (frame < max) {
        requestAnimationFrame(tick);
      } else if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
    requestAnimationFrame(tick);
  }

  function clearConfetti(card) {
    if (!card) return;
    var c = card.querySelector('.lux-confetti');
    if (c && c.parentNode) c.parentNode.removeChild(c);
  }

  function watchReceipt() {
    var receipt = document.getElementById('receipt');
    if (!receipt || !window.MutationObserver) return;
    var obs = new MutationObserver(function () {
      var visible = receipt.style.display !== 'none' &&
        getComputedStyle(receipt).display !== 'none';
      if (visible && !confettiOn) {
        confettiOn = true;
        receipt.classList.remove('lux-pop');
        void receipt.offsetWidth; // force reflow so the animation can replay
        receipt.classList.add('lux-pop');
        confetti(receipt);
      } else if (!visible && confettiOn) {
        confettiOn = false;
        clearConfetti(receipt);
      }
    });
    obs.observe(receipt, { attributes: true, attributeFilter: ['style', 'class'] });
  }

  function ready() {
    intro();
    fields();
    watchReceipt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();

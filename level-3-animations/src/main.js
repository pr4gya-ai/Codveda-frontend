import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Accessibility: respect the OS setting AND offer an in-page toggle.
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduced = mq.matches;
const toggle = $('#motion-toggle');

function setCounters(final) {
  $$('[data-to]').forEach((el) => { el.textContent = final ? el.dataset.to : '0'; });
}

function buildAnimations() {
  const ctx = gsap.context(() => {
    // 1) Intro timeline — a choreographed sequence
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.header', { y: -40, opacity: 0, duration: 0.7 })
      .from('.kicker', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3')
      .from('.word', { yPercent: 110, rotate: 4, duration: 1, stagger: 0.12 }, '-=0.3')
      .from('.sub', { y: 24, opacity: 0, duration: 0.7 }, '-=0.5')
      .from('.hero .btn', { scale: 0.7, opacity: 0, duration: 0.7, ease: 'back.out(2)' }, '-=0.4')
      .from('.scroll-cue', { opacity: 0, duration: 0.6 }, '-=0.2');

    // 2) Ambient blobs
    gsap.to('.b1', { x: -60, y: 50, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.b2', { x: 70, y: -40, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.scroll-cue', { y: 8, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    // 3) Hero parallax tied to scroll (scrub)
    gsap.to('.hero .blob', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // 4) Scroll progress bar
    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 } });

    // 5) Staggered cards on enter
    gsap.from('.card', { y: 60, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.cards', start: 'top 80%' } });

    // 6) Process steps: scrubbed timeline that "draws" each step in sequence
    const steps = gsap.timeline({ scrollTrigger: { trigger: '.process', start: 'top 65%', end: 'bottom 70%', scrub: 0.6 } });
    steps.from('.step', { opacity: 0.15, x: -30, stagger: 0.4, ease: 'none' });

    // 7) Count-up numbers
    $$('[data-to]').forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, { v: Number(el.dataset.to), duration: 1.8, ease: 'power2.out', snap: { v: 1 },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => { el.textContent = o.v; } });
    });

    // 8) Closing headline reveal
    gsap.from('.reveal-text', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.contact', start: 'top 70%' } });

    // 9) Hover interactions — magnetic buttons & card tilt (gsap.quickTo = cheap, no layout)
    const cleanups = [];
    $$('.magnetic').forEach((btn) => {
      const inner = $('span', btn);
      const bx = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
      const by = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
      const ix = gsap.quickTo(inner, 'x', { duration: 0.4, ease: 'power3' });
      const iy = gsap.quickTo(inner, 'y', { duration: 0.4, ease: 'power3' });
      const move = (e) => { const r = btn.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2); const dy = e.clientY - (r.top + r.height / 2); bx(dx * 0.3); by(dy * 0.3); ix(dx * 0.15); iy(dy * 0.15); };
      const leave = () => { bx(0); by(0); ix(0); iy(0); };
      btn.addEventListener('pointermove', move); btn.addEventListener('pointerleave', leave);
      cleanups.push(() => { btn.removeEventListener('pointermove', move); btn.removeEventListener('pointerleave', leave); });
    });
    $$('.tilt').forEach((card) => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
      gsap.set(card, { transformPerspective: 800 });
      const move = (e) => { const r = card.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width; const py = (e.clientY - r.top) / r.height; ry((px - 0.5) * 12); rx((0.5 - py) * 12); card.style.setProperty('--mx', px * 100 + '%'); card.style.setProperty('--my', py * 100 + '%'); };
      const leave = () => { rx(0); ry(0); };
      card.addEventListener('pointermove', move); card.addEventListener('pointerleave', leave);
      cleanups.push(() => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); });
    });
    return () => cleanups.forEach((fn) => fn());
  });
  return ctx;
}

let ctx = null;
function apply() {
  if (ctx) { ctx.revert(); ctx = null; }       // removes all tweens/triggers/inline styles
  ScrollTrigger.getAll().forEach((t) => t.kill());
  const off = reduced;
  toggle.setAttribute('aria-pressed', String(off));
  toggle.textContent = off ? 'Play motion' : 'Pause motion';
  if (off) { setCounters(true); gsap.set('#progress', { scaleX: 0 }); return; }
  setCounters(false);
  ctx = buildAnimations();
}

mq.addEventListener('change', (e) => { reduced = e.matches; apply(); });
toggle.addEventListener('click', () => { reduced = !reduced; apply(); });

// Smooth in-page anchor scrolling (disabled when motion is reduced)
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href') === '#') return;
  const t = document.querySelector(a.getAttribute('href'));
  if (!t) return;
  e.preventDefault();
  const top = t.getBoundingClientRect().top + window.scrollY - 10;
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
});

apply();

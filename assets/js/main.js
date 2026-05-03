/**
 * Orbitly – main.js
 * Handles: sticky nav, mobile menu, scroll-to-top,
 *          FAQ accordion, scroll animations,
 *          counter animation, pricing toggle
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ── Sticky Navbar ─────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('sticky', window.scrollY > 60);
    scrollTopBtn.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mobile Menu ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');

  const closeMenu = () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on nav link click
  navMenu.querySelectorAll('.nav-link, .btn').forEach(el =>
    el.addEventListener('click', closeMenu)
  );

  // Close on outside click
  document.addEventListener('click', e => {
    if (navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Scroll to Top ─────────────────────────────────────── */
  const scrollTopBtn = document.getElementById('scrollTop');
  scrollTopBtn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  /* ── FAQ Accordion ─────────────────────────────────────── */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('active');
        other.querySelector('.faq-question')
             .setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Scroll-triggered Animations ──────────────────────── */
  const animEls = document.querySelectorAll('[data-animate]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    animEls.forEach(el => {
      // floating cards stay in view always
      if (el.dataset.animate !== 'float') observer.observe(el);
      else el.classList.add('in-view');
    });
  } else {
    // Fallback: show all immediately
    animEls.forEach(el => el.classList.add('in-view'));
  }

  /* ── Counter Animation ─────────────────────────────────── */
  const counterEls = document.querySelectorAll('[data-count]');

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start    = performance.now();

    const formatNum = (n) => {
      if (n >= 10000) return (n / 1000).toFixed(0) + 'k+';
      if (n >= 1000)  return n.toLocaleString() + '+';
      return n + (el.nextElementSibling?.textContent.includes('%') ? '' : el.dataset.count > 10 ? '' : '×');
    };

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);
      el.textContent = formatNum(current);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = formatNum(target);
    };

    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const cObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => cObserver.observe(el));
  } else {
    counterEls.forEach(el => {
      el.textContent = parseInt(el.dataset.count, 10).toLocaleString();
    });
  }

  /* ── Pricing Toggle ────────────────────────────────────── */
  const billingToggle = document.getElementById('billing-toggle');
  const priceAmounts  = document.querySelectorAll('.p-amount[data-monthly]');

  if (billingToggle) {
    billingToggle.addEventListener('change', () => {
      const isAnnual = billingToggle.checked;
      priceAmounts.forEach(el => {
        const monthly = parseInt(el.dataset.monthly, 10);
        const annual  = parseInt(el.dataset.annual, 10);
        if (monthly === 0) { el.textContent = '$0'; return; }
        el.textContent = isAnnual ? `$${annual}` : `$${monthly}`;
      });
    });
  }

  /* ── Smooth anchor scrolling with navbar offset ──────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── CTA Email form – prevent default ─────────────────── */
  const ctaBtn = document.querySelector('.cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = document.querySelector('.cta-input');
      if (!input) return;
      if (!input.value || !input.value.includes('@')) {
        input.focus();
        input.style.borderColor = '#ef4444';
        input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,.15)';
        setTimeout(() => {
          input.style.borderColor = '';
          input.style.boxShadow   = '';
        }, 1600);
        return;
      }
      ctaBtn.textContent = '✓ You\'re on the list!';
      ctaBtn.style.background = '#10b981';
      ctaBtn.style.color = 'white';
      input.value = '';
    });
  }

});

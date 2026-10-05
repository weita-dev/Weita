/* WeiTA company pages (About, Careers, Contact, FAQ, Partner with us).
   Behaviour copied from the locked layouts. Every block is guarded, so this file is safe on any page.
   Form validation and sending live in the shared site script (form[data-form]); nothing here submits forms. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var scrollers = [];
  function onScroll(fn) { scrollers.push(fn); }

  /* Side index with scroll spy: About (.a2-nav) and FAQ (#f2 nav) */
  function spy(nav, targets) {
    if (!nav || !targets.length) return;
    var links = $$('a', nav);
    onScroll(function () {
      var cur = 0;
      targets.forEach(function (s, i) { if (!s.hidden && s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = i; });
      links.forEach(function (a, i) {
        a.classList.toggle('on', i === cur);
        if (i === cur && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = a.offsetLeft - 20;
      });
    });
  }
  (function () {
    var nav = $('.a2-nav');
    if (!nav) return;
    var targets = $$('a', nav).map(function (a) { return document.getElementById((a.getAttribute('href') || '').slice(1)); }).filter(Boolean);
    spy(nav, targets);
  })();
  (function () {
    var nav = $('#f2 nav');
    if (nav) spy(nav, $$('#f2 .grp'));
  })();

  /* FAQ: open all / close all, live search filter */
  (function () {
    var body = $('#f2-body');
    if (!body) return;
    var all = $('#f2-all'), search = $('#f2-search'), count = $('#f2-count');
    if (all) all.addEventListener('click', function () {
      var open = all.textContent.trim() === 'Open all';
      $$('details', body).forEach(function (d) { if (!d.hidden) d.open = open; });
      all.textContent = open ? 'Close all' : 'Open all';
    });
    if (search) search.addEventListener('input', function () {
      var t = search.value.toLowerCase().trim(), n = 0;
      $$('details', body).forEach(function (d) {
        var hit = !t || d.textContent.toLowerCase().indexOf(t) > -1;
        d.hidden = !hit;
        if (hit && t) { n++; d.open = true; }
        if (!t) d.open = false;
      });
      $$('.grp', body).forEach(function (g) { g.hidden = !!t && !g.querySelector('details:not([hidden])'); });
      if (count) count.textContent = t ? (n === 1 ? '1 question found' : n + ' questions found') : '';
      if (all) all.textContent = t && n ? 'Close all' : 'Open all';
    });
  })();

  /* Careers: "Apply for X" cards pre-fill roleInterest and bring the on-page form into view */
  (function () {
    var form = $('form[data-form="career"]');
    if (!form) return;
    var role = form.querySelector('[name="roleInterest"]');
    var target = document.getElementById('introduce') || form;
    $$('.apply-card[data-role]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        if (role) {
          role.value = card.getAttribute('data-role');
          role.classList.add('filled');
          role.dispatchEvent(new Event('input', { bubbles: true }));
        }
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var first = form.querySelector('[name="fullName"]');
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 450);
      });
    });

    /* Floating "Introduce yourself" button: shown once the reader is past the opening, hidden while the form is on screen */
    var af = $('#apply-float');
    if (!af) return;
    af.addEventListener('click', function (e) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var first = form.querySelector('[name="fullName"]');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 450);
    });
    onScroll(function () {
      var rf = target.getBoundingClientRect();
      var formOnScreen = rf.top < window.innerHeight && rf.bottom > 0;
      af.hidden = !(window.scrollY > window.innerHeight * 0.6 && !formOnScreen);
    });
  })();

  /* Partner form: "If Other, describe briefly" appears once "Other" is chosen (keeps the pinned form compact) */
  $$('[data-show-when]').forEach(function (box) {
    var form = box.closest('form');
    var sel = form && form.querySelector('select[name="describes"]');
    if (!sel) return;
    var sync = function () {
      var show = sel.value === box.getAttribute('data-show-when');
      box.hidden = !show;
      if (!show) { var i = box.querySelector('input'); if (i) i.value = ''; }
    };
    sel.addEventListener('change', sync);
    sync();
  });

  /* Run scroll handlers */
  if (scrollers.length) {
    var ticking = false;
    var run = function () { ticking = false; scrollers.forEach(function (fn) { fn(); }); };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    window.addEventListener('resize', run);
    run();
  }
})();

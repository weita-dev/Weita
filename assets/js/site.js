/* WeiTA site-wide script: header, menus, pop-up form, founder card, cookie bar, analytics, and every form[data-form].
   Settings arrive from the build as window.WEITA = {formUrl, bookingUrl, gaId, recaptchaKey, fallbackEmail}. */
(function () {
  var S = window.WEITA || {};
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- header: hides on scroll down, returns on scroll up ---------- */
  var hdr = $('#hdr'), lastY = window.scrollY;
  if (hdr) window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y > lastY && y > 120 && !$('.nav-item.open')) hdr.classList.add('hide'); else if (y < lastY) hdr.classList.remove('hide');
    hdr.classList.toggle('scrolled', y > 8); lastY = y;
  }, { passive: true });
  var cur = document.body.getAttribute('data-nav');
  if (cur) $$('[data-nav="' + cur + '"]').forEach(function (a) { a.classList.add('current'); a.setAttribute('aria-current', 'page'); });

  /* ---------- dropdowns ---------- */
  var drops = $$('[data-drop]');
  function closeDrops(except) { drops.forEach(function (d) { if (d !== except) { d.classList.remove('open'); d.querySelector('button').setAttribute('aria-expanded', 'false'); } }); }
  drops.forEach(function (d) {
    var btn = d.querySelector('button');
    btn.addEventListener('click', function (e) { e.stopPropagation(); var o = !d.classList.contains('open'); closeDrops(d); d.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); });
    d.addEventListener('mouseenter', function () { if (matchMedia('(hover:hover)').matches) { closeDrops(d); d.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); } });
    d.addEventListener('mouseleave', function () { if (matchMedia('(hover:hover)').matches) { d.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  });
  document.addEventListener('click', function () { closeDrops(null); });

  /* ---------- phone menu ---------- */
  var mm = $('#mmenu'), burger = $('#burger');
  function openMM() { mm.hidden = false; document.body.style.overflow = 'hidden'; burger.setAttribute('aria-expanded', 'true'); $('#mm-close').focus(); }
  function closeMM() { if (!mm) return; mm.hidden = true; document.body.style.overflow = ''; burger.setAttribute('aria-expanded', 'false'); }
  if (mm && burger) { burger.addEventListener('click', openMM); $('#mm-close').addEventListener('click', closeMM); $$('a', mm).forEach(function (a) { a.addEventListener('click', closeMM); }); }

  /* ---------- booking links ---------- */
  var noBookPages = ['careers', 'privacy'];
  $$('[data-book]').forEach(function (a) {
    if (S.bookingUrl) { a.href = S.bookingUrl; a.target = '_blank'; a.rel = 'noopener'; }
    else a.hidden = true;  /* no booking page set yet: keep the promise off the page */
  });
  if (!S.bookingUrl || noBookPages.indexOf(document.body.getAttribute('data-page')) > -1) { var t0 = $('#founder-toggle'); if (t0) t0.hidden = true; }
  if (!S.recaptchaKey) $$('.rc-note').forEach(function (n) { n.hidden = true; });

  /* ---------- founder card (opens by itself ~2 s after load on Home only) ---------- */
  var fc = $('#founder-card'), ft = $('#founder-toggle');
  function setFC(o) { if (!fc) return; fc.hidden = !o; ft.setAttribute('aria-expanded', String(o)); }
  if (fc && ft) {
    ft.addEventListener('click', function () { setFC(fc.hidden); });
    $('#fc-close').addEventListener('click', function () { setFC(false); store('weita_fc_closed', '1'); });
    if (document.body.getAttribute('data-page') === 'home' && store('weita_fc_closed') !== '1' && !ft.hidden && window.innerWidth >= 768)
      setTimeout(function () { if (ft.getAttribute('aria-expanded') === 'false' && $('#modal').hidden) setFC(true); }, 2000);
  }

  /* ---------- client pop-up ---------- */
  var modal = $('#modal'), lastFocus = null;
  function openModal() {
    if (!modal) return; lastFocus = document.activeElement; setFC(false); closeMM();
    modal.hidden = false; document.body.style.overflow = 'hidden';
    setTimeout(function () { var f = $('input[name=fullName]', modal); if (f) f.focus(); }, 40);
  }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  $$('[data-open-form]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); openModal(); }); });
  if (modal) { $('#m-close').addEventListener('click', closeModal); modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); }); }
  if (modal) modal.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = $$('a[href],button:not([disabled]),input:not([type=hidden]):not(.hp),select,textarea', modal).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return; var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (modal && !modal.hidden) closeModal(); else if (mm && !mm.hidden) closeMM(); closeDrops(null); if (fc && !fc.hidden) setFC(false); } });

  /* ---------- footer photo: grows on arrival, shrinks on leaving ---------- */
  var fph = $$('.fph');
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('in', e.isIntersecting); }); }, { threshold: 0.45 }); fph.forEach(function (el) { io.observe(el); }); }
  else fph.forEach(function (el) { el.classList.add('in'); });

  /* ---------- FAQ "Know more" (any page) ---------- */
  $$('.morebtn').forEach(function (b) {
    if (b.dataset.bound) return; b.dataset.bound = '1';
    b.addEventListener('click', function () {
      var m = b.parentNode.querySelector('.faqmore'); if (!m) return; var open = m.hasAttribute('hidden');
      if (open) m.removeAttribute('hidden'); else m.setAttribute('hidden', '');
      b.setAttribute('aria-expanded', open); b.firstChild.nodeValue = open ? 'Show fewer ' : 'Know more '; var sp = b.querySelector('span'); if (sp) sp.textContent = open ? '−' : '+';
    });
  });

  /* ---------- cookie bar + Google Analytics (only after Accept) ---------- */
  var bar = $('#cookie-bar');
  function loadGA() {
    if (!S.gaId || window.__ga) return; window.__ga = 1;
    var s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(S.gaId); document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', S.gaId, { anonymize_ip: true });
  }
  var choice = store('weita_cookies');
  if (choice === 'accept') loadGA(); else if (!choice && bar && S.gaId) bar.hidden = false;
  $$('[data-cookie]').forEach(function (b) { b.addEventListener('click', function () { var v = b.getAttribute('data-cookie'); store('weita_cookies', v); bar.hidden = true; if (v === 'accept') loadGA(); }); });
  $$('[data-cookie-settings]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); if (bar) { bar.hidden = false; var b = $('button', bar); if (b) b.focus(); } }); });

  /* ---------- article gate: subscribers read the full article ---------- */
  function unlockArticle() { var r = $('.art-rest'), g = $('#art-gate'), fd = $('.art-fade'); if (r) r.hidden = false; if (g) g.remove(); if (fd) fd.remove(); }
  if ($('.art-rest') && store('weita_sub') === '1') unlockArticle();

  /* ---------- country lists ---------- */
  var COUNTRIES = [['India','91'],['Australia','61'],['Austria','43'],['Bahrain','973'],['Bangladesh','880'],['Belgium','32'],['Bhutan','975'],['Brazil','55'],['Canada','1'],['China','86'],['Czechia','420'],['Denmark','45'],['Egypt','20'],['Finland','358'],['France','33'],['Germany','49'],['Ghana','233'],['Greece','30'],['Hong Kong','852'],['Hungary','36'],['Indonesia','62'],['Ireland','353'],['Israel','972'],['Italy','39'],['Japan','81'],['Jordan','962'],['Kenya','254'],['Kuwait','965'],['Luxembourg','352'],['Malaysia','60'],['Maldives','960'],['Mauritius','230'],['Mexico','52'],['Nepal','977'],['Netherlands','31'],['New Zealand','64'],['Nigeria','234'],['Norway','47'],['Oman','968'],['Pakistan','92'],['Philippines','63'],['Poland','48'],['Portugal','351'],['Qatar','974'],['Romania','40'],['Saudi Arabia','966'],['Singapore','65'],['South Africa','27'],['South Korea','82'],['Spain','34'],['Sri Lanka','94'],['Sweden','46'],['Switzerland','41'],['Taiwan','886'],['Tanzania','255'],['Thailand','66'],['Turkey','90'],['Uganda','256'],['Ukraine','380'],['United Arab Emirates','971'],['United Kingdom','44'],['United States','1'],['Vietnam','84'],['Other (type the code with the number)','']];
  $$('select[name=country]').forEach(function (sel) {
    COUNTRIES.forEach(function (c, i) {
      var o = document.createElement('option'); o.value = c[1] || 'other'; o.textContent = c[0]; sel.appendChild(o);
      if (i === 0) { var s = document.createElement('option'); s.disabled = true; s.textContent = '──────────'; sel.appendChild(s); }
    });
    var code = sel.closest('.phone') && sel.closest('.phone').querySelector('.code');
    sel.addEventListener('change', function () { if (code) code.textContent = sel.value && sel.value !== 'other' ? '+' + sel.value : '+'; });
  });

  /* ---------- forms: check on leaving a field, clear once fixed, send to the WeiTA backend ---------- */
  var FREE = ['gmail.com','googlemail.com','yahoo.com','yahoo.co.in','outlook.com','hotmail.com','live.com','rediffmail.com','icloud.com','aol.com','proton.me','protonmail.com','zoho.com','ymail.com','msn.com'];
  var started = Date.now();
  function v(form, n) { var el = form.querySelector('[name="' + n + '"]'); if (!el) return ''; return el.type === 'checkbox' ? el.checked : String(el.value || '').trim(); }
  function has(form, n) { return !!form.querySelector('[name="' + n + '"]'); }
  var URLRE = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i;
  var RULES = {
    fullName: function (f) { return v(f, 'fullName') ? '' : 'Please enter your full name.'; },
    email: function (f) { var x = v(f, 'email').toLowerCase(); if (!x) return 'Please enter your email address.'; if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(x)) return 'Please check the email address, e.g. name@company.com.'; if (f.dataset.form === 'client' && FREE.indexOf(x.split('@')[1]) > -1) return 'Please use your company email address.'; return ''; },
    phone: function (f) { var c = v(f, 'country'), n = v(f, 'phone').replace(/[\s\-()]/g, ''); if (has(f, 'country') && !c) return 'Please choose your country.'; if (!n) return 'Please enter your phone number.'; if (c === '91' && !/^[6-9]\d{9}$/.test(n)) return 'Please enter a 10-digit Indian mobile number.'; if (c !== '91' && !/^\+?\d{6,15}$/.test(n)) return 'Please check the phone number.'; return ''; },
    jobTitle: function (f) { return v(f, 'jobTitle') ? '' : 'Please enter your job title.'; },
    organisation: function (f) { return f.dataset.form !== 'client' || v(f, 'organisation') ? '' : 'Please enter your organisation name.'; },
    website: function (f) { var x = v(f, 'website'); if (!x) return 'Please enter your organisation website.'; return URLRE.test(x) ? '' : 'Please enter a website like www.company.com.'; },
    city: function (f) { return v(f, 'city') ? '' : 'Please enter your city.'; },
    orgType: function (f) { return v(f, 'orgType') ? '' : 'Please choose Enterprise or Foundry.'; },
    helpWith: function (f) { return v(f, 'helpWith') ? '' : 'Please tell WeiTA briefly what you would like help with.'; },
    role: function (f) { return v(f, 'role') ? '' : 'Please enter your role or title.'; },
    link: function (f) { var x = v(f, 'link'); return !x || URLRE.test(x) ? '' : 'Please enter a full web address, e.g. www.company.com.'; },
    describes: function (f) { return v(f, 'describes') ? '' : 'Please choose the option that best describes you.'; },
    describesOther: function (f) { return v(f, 'describes') !== 'Other' || v(f, 'describesOther') ? '' : 'Please describe yourself in a few words.'; },
    linkedin: function (f) { var x = v(f, 'linkedin'); if (!x) return 'Please paste your LinkedIn profile link.'; return /linkedin\.com\/(in|pub)\//i.test(x) ? '' : 'Please paste your full LinkedIn profile link, e.g. linkedin.com/in/yourname.'; },
    currentRole: function (f) { return v(f, 'currentRole') ? '' : 'Please enter your current role.'; },
    currentOrganisation: function (f) { return v(f, 'currentOrganisation') ? '' : 'Please enter your current organisation.'; },
    roleInterest: function (f) { return v(f, 'roleInterest') ? '' : 'Please tell WeiTA the kind of role that interests you.'; },
    project: function (f) { return v(f, 'project') ? '' : 'Please walk WeiTA through a project in a few lines.'; },
    cv: function (f) { var el = f.querySelector('[name=cv]'); var file = el && el.files && el.files[0]; if (!file) return 'Please attach your CV.'; return fileErr(file); },
    coverLetter: function (f) { var el = f.querySelector('[name=coverLetter]'); var file = el && el.files && el.files[0]; return file ? fileErr(file) : ''; },
    consent: function (f) { return v(f, 'consent') ? '' : 'Please tick the box to continue.'; }
  };
  function fileErr(file) { if (file.size > 5 * 1024 * 1024) return 'Please attach a file up to 5 MB.'; if (!/\.(pdf|docx?)$/i.test(file.name)) return 'Please attach a PDF or Word file (.pdf, .docx or .doc).'; return ''; }
  function keysFor(form) { return Object.keys(RULES).filter(function (k) { return form.querySelector('[data-f="' + k + '"]') && (k !== 'organisation' || form.dataset.form === 'client'); }); }
  function show(form, key, msg) {
    var f = form.querySelector('[data-f="' + key + '"]'); if (!f) return; var e = f.querySelector('.err');
    f.classList.toggle('bad', !!msg); if (e) { e.textContent = msg; e.hidden = !msg; }
    var ctl = f.querySelector('input,select,textarea'); if (ctl) ctl.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function readFile(input) {
    var file = input && input.files && input.files[0]; if (!file) return Promise.resolve(null);
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res({ name: file.name, data: String(r.result).split(',')[1] }); }; r.onerror = function () { rej({ field: input.name, msg: 'Please attach the file again.' }); }; r.readAsDataURL(file); });
  }
  var captchaLoaded = false;
  function loadCaptcha() { if (captchaLoaded || !S.recaptchaKey) return; captchaLoaded = true; var s = document.createElement('script'); s.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(S.recaptchaKey); document.head.appendChild(s); }
  function token() {
    if (S.recaptchaKey && window.grecaptcha) return new Promise(function (res) { grecaptcha.ready(function () { grecaptcha.execute(S.recaptchaKey, { action: 'submit' }).then(res, function () { res(''); }); }); });
    return Promise.resolve('');
  }
  function say(form, cls, html) { var m = form.querySelector('.form-msg'); if (!m) return; m.className = 'form-msg ' + cls; m.innerHTML = html; m.hidden = false; }

  $$('form[data-form]').forEach(function (form) {
    form.addEventListener('focusin', loadCaptcha, { once: true });
    keysFor(form).forEach(function (key) {
      var f = form.querySelector('[data-f="' + key + '"]');
      $$('input,select,textarea', f).forEach(function (el) {
        el.addEventListener('blur', function () { var typed = el.type === 'checkbox' || el.type === 'file' ? false : el.value.trim() !== ''; if (typed || f.classList.contains('bad')) show(form, key, RULES[key](form)); });
        el.addEventListener('input', function () { if (f.classList.contains('bad') && !RULES[key](form)) show(form, key, ''); });
        el.addEventListener('change', function () { if (f.classList.contains('bad') || el.type === 'file') show(form, key, RULES[key](form)); });
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = []; keysFor(form).forEach(function (k) { var f = form.querySelector('[data-f="' + k + '"]'); if (f && f.offsetParent === null && k === 'describesOther' && v(form, 'describes') !== 'Other') return; var m = RULES[k](form); show(form, k, m); if (m) bad.push(k); });
      var sum = form.parentNode.querySelector('.summary');
      if (bad.length) {
        if (sum) { sum.hidden = false; sum.textContent = bad.length === 1 ? 'One field needs a quick fix.' : bad.length + ' fields need a quick fix.'; }
        var first = form.querySelector('[data-f="' + bad[0] + '"] input,[data-f="' + bad[0] + '"] select,[data-f="' + bad[0] + '"] textarea');
        if (first) { first.focus(); first.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); } return;
      }
      if (sum) sum.hidden = true;
      if (!S.formUrl) { say(form, 'bad', 'The form is being set up. Please write to <a href="mailto:' + (S.fallbackEmail || 'sales@weita.in') + '">' + (S.fallbackEmail || 'sales@weita.in') + '</a> for now.'); return; }
      var btn = form.querySelector('button[type=submit]'); var label = btn.textContent; btn.disabled = true; btn.textContent = 'Sending…';
      var data = { form: form.dataset.form, startedAt: started, page: location.pathname };
      $$('input,select,textarea', form).forEach(function (el) { if (!el.name || el.type === 'file' || el.name === 'country') return; data[el.name] = el.type === 'checkbox' ? el.checked : el.value; });
      if (has(form, 'country')) { var c = v(form, 'country'), n = v(form, 'phone'); data.phone = c && c !== 'other' ? '+' + c + ' ' + n : n; }
      var files = form.dataset.form === 'career' ? Promise.all([readFile(form.querySelector('[name=cv]')), readFile(form.querySelector('[name=coverLetter]'))]) : Promise.resolve([]);
      files.then(function (fs) { if (form.dataset.form === 'career') { data.cv = fs[0]; data.coverLetter = fs[1]; } return token(); })
        .then(function (t) { data.token = t; return fetch(S.formUrl, { method: 'POST', body: JSON.stringify(data) }); })
        .then(function (r) { return r.json(); })
        .then(function (out) {
          if (out.ok && form.dataset.form === 'subscribe') { store('weita_sub', '1'); unlockArticle(); return; }
          if (out.ok) {
            var who = { client: 'Our Engagement Partner will take it from here.', partner: 'WeiTA will read it and reply about working together.', career: 'WeiTA keeps your details with care and stays in touch about roles that fit.' }[form.dataset.form];
            form.outerHTML = '<div class="thanks" role="status"><h3>Thank you</h3><p>WeiTA has your details, and a confirmation email is on its way. ' + who + '</p></div>';
          } else {
            if (out.errors) Object.keys(out.errors).forEach(function (k) { show(form, k, out.errors[k]); });
            say(form, 'bad', out.message || 'Please check the highlighted fields.');
          }
        })
        .catch(function (err) {
          if (err && err.field) show(form, err.field, err.msg);
          say(form, 'bad', 'Something went wrong while sending. Please try again, or write to <a href="mailto:' + (S.fallbackEmail || 'sales@weita.in') + '">' + (S.fallbackEmail || 'sales@weita.in') + '</a>.');
        })
        .then(function () { if (document.body.contains(btn)) { btn.disabled = false; btn.textContent = label; } });
    });
  });
})();

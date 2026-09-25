/* Anake Lodge — site scripts (no dependencies) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Dates (local time, YYYY-MM-DD) ---------- */
  function ymd(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function parseYmd(v) { var p = (v || '').split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : null; }
  var params = new URLSearchParams(location.search);

  function linkDates(ci, co) {
    if (!ci || !co) return;
    var today = new Date();
    ci.min = ymd(today);
    ci.value = params.get('checkin') || ci.value || ymd(addDays(today, 1));
    var start = parseYmd(ci.value) || addDays(today, 1);
    co.min = ymd(addDays(start, 1));
    co.value = params.get('checkout') || co.value || ymd(addDays(start, 3));
    ci.addEventListener('change', function () {
      var s = parseYmd(ci.value); if (!s) return;
      co.min = ymd(addDays(s, 1));
      if (!co.value || co.value <= ci.value) co.value = ymd(addDays(s, 1));
      co.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  $$('form').forEach(function (f) { linkDates($('.js-ci', f), $('.js-co', f)); });

  /* ---------- Mobile menu ---------- */
  var nav = $('.nav'), menuBtn = $('.menu-btn');
  if (nav && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }); });
  }

  /* ---------- Hero slideshow ---------- */
  var slides = $$('.slides .slide');
  if (slides.length > 1) {
    var dots = $$('.dots button'), cap = $('.slide-cap'), cur = 0, timer;
    var show = function (n) {
      slides[cur].classList.remove('on'); if (dots[cur]) dots[cur].removeAttribute('aria-current');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('on'); if (dots[cur]) dots[cur].setAttribute('aria-current', 'true');
      if (cap) cap.textContent = slides[cur].getAttribute('data-cap') || '';
      var next = slides[(cur + 1) % slides.length]; if (next.loading === 'lazy') next.loading = 'eager';
    };
    var play = function () { clearInterval(timer); if (!reduceMotion) timer = setInterval(function () { show(cur + 1); }, 6000); };
    dots.forEach(function (b, i) { b.addEventListener('click', function () { show(i); play(); }); });
    $$('.sbtn').forEach(function (b) { b.addEventListener('click', function () { show(cur + (+b.getAttribute('data-dir'))); play(); }); });
    slides[1].loading = 'eager'; play();
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else play(); });
  }

  /* ---------- Lightbox (shared by rooms and gallery) ---------- */
  var lb = $('.lb'), openLB = function () {};
  if (lb) {
    var lbImg = $('.lb-stage img', lb), lbT = $('.lb-title', lb), lbC = $('.lb-count', lb), lbTh = $('.lb-thumbs', lb), set = [], li = 0, groupTitle = '';
    var lbShow = function (i) {
      li = (i + set.length) % set.length;
      lbImg.src = set[li].src; lbImg.alt = set[li].alt || '';
      lbT.textContent = set[li].caption || groupTitle;
      lbC.textContent = (li + 1) + ' of ' + set.length;
      Array.prototype.forEach.call(lbTh.children, function (t, k) {
        t.classList.toggle('on', k === li);
        if (k === li && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'center' });
      });
    };
    openLB = function (title, items, i) {
      set = items; groupTitle = title || ''; lbTh.innerHTML = '';
      set.forEach(function (it, k) {
        var t = document.createElement('img'); t.src = it.src; t.alt = ''; t.loading = 'lazy';
        t.addEventListener('click', function () { lbShow(k); }); lbTh.appendChild(t);
      });
      $$('.lb-nav', lb).forEach(function (b) { b.style.visibility = set.length > 1 ? 'visible' : 'hidden'; });
      lbTh.style.display = set.length > 1 ? 'flex' : 'none';
      if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
      lbShow(i || 0);
    };
    var closeLB = function () { if (lb.close) lb.close(); else lb.removeAttribute('open'); };
    $('.lb-x', lb).addEventListener('click', closeLB);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
    $$('.lb-nav', lb).forEach(function (b) { b.addEventListener('click', function () { lbShow(li + (+b.getAttribute('data-d'))); }); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') lbShow(li + 1);
      if (e.key === 'ArrowLeft') lbShow(li - 1);
      if (e.key === 'Escape' && !lb.close) closeLB();
    });
    var sx = 0;
    lbImg.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lbImg.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) lbShow(li + (dx < 0 ? 1 : -1)); });
  }
  var toItem = function (img, caption) { return { src: img.currentSrc || img.src, alt: img.alt, caption: caption }; };

  /* ---------- Room photo carousels ---------- */
  $$('.carousel').forEach(function (g) {
    var tr = $('.track', g), ims = $$('img', tr), ct = $('.count', g), title = g.getAttribute('data-title');
    if (!ims.length) return;
    var idx = function () { return Math.round(tr.scrollLeft / (tr.clientWidth || 1)); };
    var go = function (i) { i = (i + ims.length) % ims.length; tr.scrollTo({ left: i * tr.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' }); };
    tr.addEventListener('scroll', function () { if (ct) ct.textContent = (idx() + 1) + ' / ' + ims.length; }, { passive: true });
    var p = $('.prev', g), n = $('.next', g);
    if (p) p.addEventListener('click', function () { go(idx() - 1); });
    if (n) n.addEventListener('click', function () { go(idx() + 1); });
    tr.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(idx() + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(idx() - 1); e.preventDefault(); }
    });
    var items = function () { return ims.map(function (im) { return toItem(im, ''); }); };
    ims.forEach(function (im, i) { im.addEventListener('click', function () { openLB(title, items(), i); }); });
    var ex = $('.expand', g); if (ex) ex.addEventListener('click', function () { openLB(title, items(), idx()); });
  });

  /* ---------- Gallery page: filters + lightbox ---------- */
  var grid = $('#gallery-grid');
  if (grid) {
    var tiles = $$('.tile', grid), chips = $$('.chip');
    var applyFilter = function (f) {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-filter') === f ? 'true' : 'false'); });
      tiles.forEach(function (t) { t.hidden = !(f === 'all' || t.getAttribute('data-cat') === f); });
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-filter'); applyFilter(f);
        try { history.replaceState(null, '', f === 'all' ? location.pathname : '#' + encodeURIComponent(f)); } catch (e) {}
      });
    });
    var initial = decodeURIComponent(location.hash.slice(1));
    if (initial && chips.some(function (c) { return c.getAttribute('data-filter') === initial; })) applyFilter(initial);
    tiles.forEach(function (t) {
      $('.tile-btn', t).addEventListener('click', function () {
        var visible = tiles.filter(function (x) { return !x.hidden; });
        var items = visible.map(function (x) { var fc = $('figcaption', x); return toItem($('img', x), fc ? fc.lastChild.textContent.trim() : ''); });
        openLB('', items, visible.indexOf(t));
      });
    });
  }

  /* ---------- Booking form ---------- */
  var form = $('#booking-form'), cfgEl = $('#booking-config');
  if (form && cfgEl) {
    var cfg = JSON.parse(cfgEl.textContent);
    var el = function (n) { return form.elements[n]; };
    var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    var fmt = function (v) { var d = parseYmd(v); return d ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : ''; };

    // Pre-fill from links like /booking/?room=Family%20Room&guests=3
    var wantRoom = params.get('room') || params.get('category');
    if (wantRoom) {
      var w = wantRoom.toLowerCase().replace(/s$/, '');
      Array.prototype.forEach.call(el('room').options, function (o) {
        var v = o.value.toLowerCase(); if (v === w || v.indexOf(w) === 0 || w.indexOf(v) === 0) el('room').value = o.value;
      });
    }
    if (params.get('guests')) { var gv = params.get('guests'); if (+gv > 12) gv = '12'; el('guests').value = gv; }
    if (location.hash === '#transfer' && cfg.transfers.length) el('transfer').focus();

    var calc = function () {
      var room = cfg.rooms.filter(function (r) { return r.name === el('room').value; })[0] || cfg.rooms[0];
      var guests = +el('guests').value || 1, rooms = +el('rooms').value || 1;
      if (room.perPerson && rooms < guests) { el('rooms').value = String(Math.min(guests, 8)); rooms = +el('rooms').value; }
      var ci = parseYmd(el('checkin').value), co = parseYmd(el('checkout').value);
      var nights = ci && co ? Math.round((co - ci) / 864e5) : 0;
      var perNight = room.perPerson ? room.price * guests : room.price * rooms + room.extra * Math.max(0, guests - rooms);
      var tr = cfg.transfers.filter(function (t) { return t.name === el('transfer').value; })[0];
      var total = (nights > 0 ? nights * perNight : 0) + (tr ? tr.price : 0);
      return { room: room, guests: guests, rooms: rooms, nights: nights, perNight: perNight, transfer: tr, total: total };
    };

    var summary = function () {
      var c = calc();
      $('.js-s-room').textContent = c.room.name + (c.room.perPerson ? '' : ' × ' + c.rooms);
      $('.js-s-dates').textContent = c.nights > 0 ? fmt(el('checkin').value) + ' → ' + fmt(el('checkout').value) : 'Choose dates';
      $('.js-s-nights').textContent = c.nights > 0 ? c.nights : '–';
      var cap = c.room.perPerson ? Infinity : c.room.max * c.rooms;
      $('.js-s-guests').textContent = c.guests + (c.guests > cap ? ' (more than ' + cap + ' — add a room)' : '');
      $('.js-s-transfer').textContent = c.transfer ? c.transfer.name + ' (' + money(c.transfer.price) + ')' : 'None';
      $('.js-s-total').textContent = c.nights > 0 ? money(c.total) : '–';
      var arr = $('.js-arrival'); if (arr) arr.hidden = !c.transfer;
    };
    form.addEventListener('change', summary);
    form.addEventListener('input', function (e) { if (e.target.classList) e.target.classList.remove('invalid'); });
    summary();

    var errBox = $('.form-error', form);
    var fail = function (msg, field) {
      errBox.textContent = msg; errBox.hidden = false;
      if (field) { field.classList.add('invalid'); field.focus(); }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault(); errBox.hidden = true;
      var c = calc();
      var req = ['checkin', 'checkout', 'name', 'email', 'phone'];
      for (var i = 0; i < req.length; i++) {
        if (!el(req[i]).value.trim()) return fail('Please fill in: ' + el(req[i]).closest('label').firstChild.textContent.trim() + '.', el(req[i]));
      }
      if (c.nights < 1) return fail('Your check-out date must be after your check-in date.', el('checkout'));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el('email').value.trim())) return fail('Please enter a valid email address so we can confirm your booking.', el('email'));

      var d = {
        Name: el('name').value.trim(), Email: el('email').value.trim(), 'WhatsApp / phone': el('phone').value.trim(),
        Country: el('country').value.trim() || '-', Room: c.room.name + (c.room.perPerson ? '' : ' x ' + c.rooms),
        'Check in': fmt(el('checkin').value), 'Check out': fmt(el('checkout').value), Nights: String(c.nights),
        Guests: String(c.guests), Transfer: c.transfer ? c.transfer.name + ' ($' + c.transfer.price + ')' : 'None',
        'Arrival details': c.transfer ? (el('arrival').value.trim() || '-') : '-',
        'Estimated total': money(c.total) + ' USD', Message: el('message').value.trim() || '-'
      };
      var lines = Object.keys(d).map(function (k) { return k + ': ' + d[k]; });
      var text = 'New booking request – Anake Lodge\n\n' + lines.join('\n');
      var subject = 'Booking request: ' + d.Name + ', ' + d['Check in'] + ' (' + c.nights + ' night' + (c.nights > 1 ? 's' : '') + ')';
      var waUrl = 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(text);
      var mailUrl = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);

      var done = $('#booking-done');
      $('.js-done-wa', done).href = waUrl;
      $('.js-done-mail', done).href = mailUrl;
      var finish = function (emailed) {
        form.hidden = true; $('.summary').hidden = true; done.hidden = false;
        $('.js-done-msg', done).textContent = emailed
          ? 'Thank you, ' + d.Name.split(' ')[0] + '. Your request has been emailed to ' + cfg.email + '. We’ll confirm availability and payment by email or WhatsApp shortly. For the fastest reply, also send it on WhatsApp.'
          : 'We couldn’t send your request automatically. Please tap one of the buttons below to send it to us on WhatsApp or by email — it only takes a second.';
        window.scrollTo({ top: done.getBoundingClientRect().top + window.pageYOffset - 100, behavior: reduceMotion ? 'auto' : 'smooth' });
        done.focus({ preventScroll: true });
      };

      if (el('_honey').value) return finish(true); // spam bot

      // Open WhatsApp straight away (must happen inside the click to avoid pop-up blockers)
      if (el('send_whatsapp').checked) window.open(waUrl, '_blank', 'noopener');

      var btn = $('button[type=submit]', form); btn.disabled = true; btn.textContent = 'Sending…';
      var payload = { _subject: subject, _template: 'table', _captcha: 'false', email: d.Email };
      Object.keys(d).forEach(function (k) { payload[k] = d[k]; });
      fetch('https://formsubmit.co/ajax/' + cfg.email, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); })
        .then(function (j) { finish(j && (j.success === true || j.success === 'true')); })
        .catch(function () { finish(false); })
        .then(function () { btn.disabled = false; btn.textContent = 'Send booking request'; });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (r) { io.observe(r); });
  } else reveals.forEach(function (r) { r.classList.add('in'); });
})();

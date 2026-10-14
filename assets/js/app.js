/* ==========================================================================
   ZipSchedules × Altametrics purchase flow — app.js (v3, no dependencies)

   index.html ─Buy Now─▶ products.html ─Continue to checkout─▶ signup.html (email + cart)
   ─Continue─▶ login.html (sign-in) ─Login / Verify via Email─▶ verify.html (OTP)
   ─Validate─▶ confirm.html (saved card prefilled)            [returning customer]
   login.html ─Register Now─▶ registration.html ─▶ verify.html ─▶ payment-modes.html   [new customer] ─Add─▶ Forte checkout (card ▶ billing ▶ authorize)
   ─▶ confirm.html (Payment Method) ─Confirm─▶ Payment Message ─Ok─▶ manage.html

   Integration points:
     • api.*        every backend call (stubs that resolve success)
     • payments     Forte checkout adapter (prototype modal; swap for Forte hosted checkout)
     • CATALOG / PLANS   product + plan data
   ========================================================================== */
(function () {
  'use strict';

  /* 1. Catalog ------------------------------------------------------------- */
  var CDN = 'https://agcdn.altametrics.com/releaseHubWorks/agassets/v3/assets/images/';

  var CATALOG = [
    // Base product added by "Buy Now" on the landing page (not listed in the grid)
    { id: 'zipschedules', name: 'ZipSchedules', price: 19.99, image: CDN + 'common/zipSchedule.png', listed: false,
      label: 'Workforce', category: 'workforce', description: 'Employee scheduling and time tracking.' },

    // CONTENT: descriptions completed from the truncated design copy — review with product marketing.
    { id: 'zip-tunes', name: 'Zip Tunes', price: 9.99, image: CDN + 'common/zipSchedule.png', /* TODO: Zip Tunes artwork */
      label: 'Guest experience', category: 'recommended', description: 'Curated, licensed background music tailored to your restaurant.' },
    { id: 'zip-digital-signage', name: 'Zip Digital Signage', price: 15.00, image: CDN + 'dgx/svg/dgx_logo.svg',
      label: 'Guest experience', category: 'recommended', description: 'Engage customers with vibrant, easy-to-manage digital menu boards.' },
    { id: 'zip-clock', name: 'Zip Clock', price: 25.00, image: CDN + 'common/svg/zipclock.svg',
      label: 'Workforce', category: 'workforce', description: 'Simplify time tracking and prevent buddy punching.' },
    { id: 'zip-forecasting', name: 'Zip Forecasting', price: 49.00, image: CDN + 'common/zipForecast.png', featured: true,
      label: 'Workforce', category: 'workforce', description: 'Predict labor needs accurately using AI-driven sales forecasts.' },
    { id: 'zip-inventory', name: 'Zip Inventory', price: 39.00, image: CDN + 'common/zipInventory.png',
      label: 'Food', category: 'food', description: 'Manage stock levels, reduce waste, and streamline ordering.' },
    { id: 'zip-ordering', name: 'Zip Ordering', price: 29.00, image: CDN + 'common/zipordering-130.png',
      label: 'Food', category: 'food', description: 'Seamless integrated web and app ordering for your guests.' },
    { id: 'zip-checklist', name: 'Zip Checklist 1.0', price: 12.00, image: CDN + 'common/ZipChecklist.png',
      label: 'Food safety', category: 'food', description: 'Standardize operational procedures with digital checklists.' },
    { id: 'zip-reporting', name: 'Zip Reporting', price: 19.00, image: CDN + 'common/ZipReporting_Icon_150.png',
      label: 'Operations', category: 'recommended', description: 'Aggregated business intelligence and reporting across locations.' },
    { id: 'zip-shiftbook', name: 'Zip ShiftBook', price: 14.00, image: CDN + 'common/shiftBook.png',
      label: 'Workforce', category: 'workforce', description: 'Centralized digital logbook for communication between shifts.' }
  ];
  /* "Recommended" shows every app; Workforce / Food filter by `category`. Confirm the mapping with product. */

  /* ------------------------------------------------------------------------
     Plum POS hardware (one-time purchase, quantity per item).
     Names, descriptions and specs follow plumpos.com product pages.
     PRICES: placeholders until Plum POS confirms them; while HARDWARE_PRICES_FINAL is false,
     cards show an "Est." tag. IMAGES: replace the illustrations with Plum product photos.
     ------------------------------------------------------------------------ */
  var HARDWARE_PRICES_FINAL = false;
  var HW_IMG = 'assets/img/hardware/';
  var HARDWARE_GROUPS = [
    ['all', 'All hardware'], ['counter', 'Counter & POS'], ['payments', 'Payments'], ['mobile', 'Mobile & self-order'],
    ['kitchen', 'Kitchen'], ['accessories', 'Accessories'], ['guest', 'Guest experience'], ['time', 'Time & attendance']
  ];
  /* `photo: true` = product photo on white (blended into the card); false = illustration */
  var HARDWARE = [
    { id: 'hw-terminal', name: 'Plum POS Terminal', type: 'POS station', group: 'counter', price: 799, image: HW_IMG + 'pos-terminal.webp', photo: true,
      description: 'Countertop POS with a responsive 15.6" widescreen, built for busy counters and connected to every Plum device.',
      specs: ['15.6" widescreen', 'Magnetic stripe reader', 'Spill-resistant'] },
    { id: 'hw-handheld', name: 'Plum Handheld', type: 'Mobile POS', group: 'mobile', price: 499, image: HW_IMG + 'handheld.webp', photo: true,
      description: 'Take orders and payments tableside, at the drive-thru or curbside, synced straight to the kitchen.',
      specs: ['6.5"+ display', 'Drop-proof to 1.2 m', 'NFC & digital wallets'] },
    { id: 'hw-pax-a35', name: 'PAX A35 Payment Terminal', type: 'Payment terminal', group: 'payments', price: 399, image: HW_IMG + 'pax-a35.webp', photo: true,
      description: 'Fast, secure card terminal with a PIN pad that helps you take payments at the counter, drive-thru or curbside.',
      specs: ['PIN pad', 'Chip, swipe & tap', 'Drive-thru & curbside'] },
    { id: 'hw-kiosk', name: 'Plum Self-Service Kiosk', type: 'Self-order', group: 'mobile', price: 1499, image: HW_IMG + 'kiosk.webp', photo: true,
      description: 'Compact touchscreen kiosk where guests order and pay on their own; orders flow to POS and kitchen.',
      specs: ['Built-in printer', 'Scanner & payments', 'Small footprint'] },
    { id: 'hw-printer', name: 'Plum Receipt Printer', type: 'Printer', group: 'accessories', price: 249, image: HW_IMG + 'receipt-printer.webp', photo: true,
      description: 'Compact thermal receipt printer that sits next to your POS and keeps checkout moving.',
      specs: ['Thermal printing', 'Triple interface', 'Starter paper roll'] },
    { id: 'hw-drawer', name: 'Plum Cash Drawer', type: 'Cash management', group: 'accessories', price: 129, image: HW_IMG + 'cash-drawer.webp', photo: true,
      description: 'Heavy-duty cash drawer built to handle regular and high-volume use with ease.',
      specs: ['Heavy-duty build', 'High-volume use'] },
    { id: 'hw-scanner', name: 'Plum Scanner', type: 'Scanner', group: 'accessories', price: 149, image: HW_IMG + 'scanner.webp', photo: true,
      description: 'Countertop barcode scanner that pairs with Plum POS for fast item lookup at checkout.',
      specs: ['Barcode scanning', 'Pairs with Plum POS'] },
    // CONTENT: confirm name, description and specs for the Tunes device with Plum POS
    { id: 'hw-tunes-player', name: 'Zip Tunes Player', type: 'Music player', group: 'guest', price: 199, image: HW_IMG + 'tunes-player.webp', photo: true,
      description: 'In-store player for Zip Tunes. Connect it to your sound system to play your scheduled, licensed playlists.',
      specs: ['Pairs with Zip Tunes', 'Scheduled playlists'] },
    // No product photos supplied yet for these two; they use illustrations
    { id: 'hw-kds', name: 'Plum KDS', type: 'Kitchen display', group: 'kitchen', price: 599, image: HW_IMG + 'kds.svg',
      description: 'Replace paper tickets: route orders to stations, track prep times and show every modifier clearly.',
      specs: ['Station routing', 'Prep timers', 'Modifier display'] },
    { id: 'hw-timeclock', name: 'Plum Time Clock', type: 'Time & attendance', group: 'time', price: 349, image: HW_IMG + 'time-clock.svg',
      description: 'Time and attendance terminal with facial recognition that stops buddy punching and supports labor compliance.',
      specs: ['Facial recognition', 'Labor compliance'] }
  ];
  var HW_MAX_QTY = 99;
  function hardware(id) { for (var i = 0; i < HARDWARE.length; i++) if (HARDWARE[i].id === id) return HARDWARE[i]; return null; }

  /* ------------------------------------------------------------------------
     Demo accounts. PRODUCTION: api.checkEmail / api.signIn / api.registerAccount
     call your backend instead, and DEMO_MODE = false hides the demo tips.
     ------------------------------------------------------------------------ */
  var DEMO_MODE = true;
  var DEMO_EXISTING_EMAILS = ['test@altametrics.com'];
  var DEMO_ACCOUNT = { name: 'Test User', business: 'Altametrics Test Restaurant' };
  var DEMO_CARD = { token: 'fttok_saved_demo', brand: 'visa', last4: '1111', expMonth: 8, expYear: 2029 };
  function isExistingEmail(e) { return DEMO_EXISTING_EMAILS.indexOf(String(e || '').trim().toLowerCase()) !== -1; }

  var MERCHANT_NAME = 'Altametrics LLC';   // shown in the Forte checkout header (design also shows "HUBWORKS, LLC")
  var BASE_PRODUCT = 'zipschedules';
  var SUPPORT_URL = 'https://altametrics.com/contact.html';

  /* Plan tiers on the Manage page. Prices come from CATALOG unless a tier sets its own.
     The design reserves slots for "Standard" and "51+ Employees"; add them here when final. */
  var PLANS = [{ id: 'professional', name: 'Professional' }];

  /* Sign-in / OTP showcase carousel (Altametrics products). Each slide is either
     { image, alt } — a finished marketing banner — or structured content rendered in HTML.
     CONTENT: copy for Digital Signage, AI Forecast and ZIP Tunes is from the designs;
     TIP Pool & Share and ZIP Prep & Pull need their copy. */
  var SHOWCASE = [
    { id: 'signage', photo: 'assets/img/hardware/kiosk.webp', photoAlt: 'Plum display showing a digital food menu', tab: 'Digital Signage', zip: true, mark: '#2a63f6', name: 'Zip Digital Signage', theme: 'light',
      headline: 'Digital menus, dynamic sales',
      lead: 'User-friendly technology for displaying and updating multimedia content, including restaurant menus, with features like real-time updates, offline mode, and AI integration.',
      a: { title: 'Key Features', items: [
        ['Dynamic Content Display', 'It can showcase videos, images, animations, text, and even live feeds, making content more engaging and impactful.'],
        ['Remote Content Management', 'Content can be updated and managed remotely, allowing businesses to make real-time changes across multiple locations.'],
        ['Scheduling & Automation', 'Content can be scheduled to play at specific times, ensuring to have different menu at different time and days.'],
        ['High-Resolution Displays', 'ZIP Digital Signage often features vibrant, high-definition screens for clear and eye-catching visuals.'] ] },
      b: { layout: 'band', items: [
        ['Engagement', 'Digital signage captures audience attention effectively in various environments.'],
        ['Flexibility', 'Content can be updated in real-time to reflect current promotions or announcements.'],
        ['Cost Effective', 'Reduces printing costs and provides a sustainable advertising solution.'],
        ['Branding and Marketing', 'ZIP Digital signage strengthens brand presence and helps promote offers & services.'] ] } },
    { id: 'tips', photo: 'https://altametrics.com/assets/images/pages/precision_workforce-825-9a035acbc.png', photoAlt: 'Workforce management dashboard', tab: 'TIP Pool & Share', mark: '#f5a524', name: 'TIP Pool & Share', theme: 'light',
      headline: 'TIP Pool & Share', lead: 'Pool and distribute tips across your team.' /* CONTENT: needs final copy */ },
    { id: 'tunes', photo: 'assets/img/hardware/tunes-player.webp', photoAlt: 'Zip Tunes in-store player', tab: 'Tunes', zip: true, mark: '#2a63f6', name: 'Zip Tunes', theme: 'light',
      headline: 'Turn up the tunes, turn on the sales',
      lead: 'Intuitive and efficient way to control the music played within your establishment.',
      a: { title: 'Key Features of Zip Tunes', items: [
        ['Craft the perfect playlist', 'From elegant fine dining to cozy cafes, our vast music library caters to every taste.'],
        ['Brand Consistency', 'Ensures uniform music themes across multiple locations.'],
        ['Schedule playlists', 'Distinct musical accompaniment, enhancing the overall dining ambiance.'],
        ['Auto-recovery', 'Auto-recover upon restart so you can get back to business and won\u2019t miss a beat.'] ] },
      b: { layout: 'side', title: 'Why Choose Us', items: [
        ['Savor the symphony', 'Select schedule, and enjoy music that resonates with your restaurant.'],
        ['Seamless music management', 'Manage playlists, adjust volume levels, and schedule music for various dining hours.'],
        ['Time-specific playlists', 'Schedule music tailored to specific times of the day, from breakfast to dinner.'] ] } },
    { id: 'forecast', photo: 'https://altametrics.com/assets/images/pages/drive_rofitability_with_ai-826-6848e2af0.png', photoAlt: 'AI forecasting dashboard projecting sales and labor', tab: 'AI Forecast', mark: '#6a4dff', name: 'AI Forecasting', theme: 'dark',
      headline: 'Plan smarter and precisely with AI driven forecasting',
      lead: 'Understand trends, adjust plans, and stay ahead.',
      body: 'Decision-making becomes significantly more effective with AI-driven predictions which not only incorporates historical usage patterns but also considers real-time local factors such as weather conditions and ongoing events.',
      a: { title: 'How This Helps Your Business', items: [
        ['See Trends Before They Happen', 'Use data to understand when sales will go up or down.'],
        ['Manage Inventory More Easily', 'Order what you need without running out or overstocking.'],
        ['Schedule the Right People', 'Make sure you have enough staff without overspending.'],
        ['Make Faster Decisions', 'Access real-time data to adjust plans on the go.'] ] },
      b: { layout: 'side', title: 'What Makes It Work?', items: [
        ['AI That Learns Over Time', 'The system improves its predictions as it gathers more data.'],
        ['Seamless Connections', 'Syncs with payroll, scheduling, and inventory for a complete view.'],
        ['Customizable for Your Business', 'Adjust forecasts based on what matters most to you.'] ] } },
    { id: 'prep', photo: 'https://altametrics.com/assets/images/pages/automated_food_safety_and_haccp-822-875ec1f95.png', photoAlt: 'Kitchen operations on a mobile device', tab: 'Prep & Pull', zip: true, mark: '#7c4dff', name: 'Zip Prep & Pull', theme: 'light',
      headline: 'Predict & prep with minimal wastage', lead: 'Plan prep and pull quantities from your forecast so food is ready without waste.' /* CONTENT: needs final copy */ }
  ];
  var OTP_TTL_SECONDS = 600;   // match the backend's OTP lifetime

  var APP_ICON = {
    'zipschedules': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h2v2H8zM14 14h2v2h-2z"/>',
    'zip-tunes': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'zip-digital-signage': '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    'zip-clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'zip-forecasting': '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
    'zip-inventory': '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    'zip-ordering': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    'zip-checklist': '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    'zip-reporting': '<path d="M12 20V10M18 20V4M6 20v-4"/>',
    'zip-shiftbook': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>'
  };
  function appIcon(id, cls) {
    return '<svg class="' + (cls || 'auth-order__icon') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (APP_ICON[id] || APP_ICON['zip-reporting']) + '</svg>';
  }

  function product(id) {
    for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i];
    return null;
  }

  /* 2. API stubs — replace with real endpoints ---------------------------- */
  function delay(value, ms) { return new Promise(function (r) { setTimeout(function () { r(value); }, ms || 400); }); }

  var api = {
    /** New or existing user? Resolve { exists: boolean }. Existing users go to sign-in. */
    checkEmail: function (email) { return delay({ exists: isExistingEmail(email) }); },
    registerAccount: function (payload) {
      if (isExistingEmail(payload.email)) return delay({ ok: false, code: 'ACCOUNT_EXISTS', message: 'An account already exists for this email.' });
      return delay({ ok: true, accountId: 'acct_demo' });
    },
    sendVerificationCode: function (email) { return delay({ ok: true }); },
    verifyCode: function (email, code) { return delay({ ok: true }); },
    /** Persist the Forte token + non-sensitive card metadata on the account. */
    saveCard: function (card) { return delay({ ok: true }); },
    /** Subscribe the account to apps using the card on file.
        Resolve { ok: true, orderId } or { ok: false, code: 'ALREADY_PURCHASED' | ..., message }. */
    subscribe: function (ids, hardwareQty) {
      var owned = store.get().purchased || [];
      var dup = ids.filter(function (id) { return owned.indexOf(id) !== -1; });
      if (dup.length) return delay({ ok: false, code: 'ALREADY_PURCHASED', ids: dup,
        message: dup.map(function (id) { return product(id).name; }).join(', ') + (dup.length > 1 ? ' are' : ' is') + ' already subscribed' });
      return delay({ ok: true, orderId: 'ord_' + Date.now().toString(36) }, 800);
    },
    unsubscribe: function (id) { return delay({ ok: true }); },
    /** App ids the signed-in account already subscribes to. PRODUCTION: fetch from the backend. */
    getSubscriptions: function () { return delay(store.get().purchased || [], 0); },
    /** Password sign-in for returning customers. Resolve { ok, account, card, subscriptions } or { ok:false, message }.
        DEMO: returns a sample account with a saved Visa ending 1111. */
    signIn: function (email, password, remember) {
      if (!isExistingEmail(email)) return delay({ ok: false, code: 'NO_ACCOUNT', message: 'No account found for this email.' }, 500);
      // DEMO: any password is accepted for the demo account
      return delay({ ok: true, account: { name: DEMO_ACCOUNT.name, email: email.trim().toLowerCase(), business: DEMO_ACCOUNT.business },
        card: Object.assign({ name: DEMO_ACCOUNT.name, billing: { company: DEMO_ACCOUNT.business, name: DEMO_ACCOUNT.name } }, DEMO_CARD),
        subscriptions: store.get().purchased || [] }, 600);
    },
    /** Passwordless: send an OTP for an existing account (Verify via Email). Same response shape as signIn after OTP. */
    lookupAccount: function (email) { return api.signIn(email, null, false); },
    /** PRODUCTION: WebAuthn (navigator.credentials.get) against your passkey endpoint. */
    signInWithPasskey: function () { return delay({ ok: false, message: 'Passkey sign-in isn\u2019t set up for this account yet. Sign in with your password or verify via email.' }); }
  };

  /* 3. State (sessionStorage + memory fallback). Never stores PAN or CVV. -- */
  var STORE_KEY = 'zs_flow_v3';
  var memoryState = {};
  var store = {
    get: function () {
      try { var raw = sessionStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : memoryState; }
      catch (e) { return memoryState; }
    },
    set: function (patch) {
      var next = Object.assign({}, store.get(), patch);
      memoryState = next;
      try { sessionStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (e) { /* unavailable */ }
      return next;
    },
    /** Clear everything (used by Log out) */
    reset: function () {
      memoryState = {};
      try { sessionStorage.removeItem(STORE_KEY); } catch (e) { /* unavailable */ }
    },
    cart: function () { return (store.get().cart || []).filter(product); },
    addToCart: function (id) {
      var c = store.cart(), owned = store.get().purchased || [];
      if (c.indexOf(id) === -1 && owned.indexOf(id) === -1) c.push(id);
      return store.set({ cart: c });
    },
    removeFromCart: function (id) { return store.set({ cart: store.cart().filter(function (x) { return x !== id; }) }); },
    /** Hardware: { id: qty } */
    hw: function () {
      var h = store.get().hardware || {}, out = {};
      Object.keys(h).forEach(function (id) { if (hardware(id) && h[id] > 0) out[id] = h[id]; });
      return out;
    },
    setQty: function (id, qty) {
      var h = store.hw(); qty = Math.max(0, Math.min(HW_MAX_QTY, Math.floor(qty) || 0));
      if (qty) h[id] = qty; else delete h[id];
      return store.set({ hardware: h });
    },
    hwLines: function () {
      var h = store.hw();
      return HARDWARE.filter(function (x) { return h[x.id]; }).map(function (x) { return { p: x, qty: h[x.id], total: x.price * h[x.id] }; });
    },
    hasItems: function () { return store.cart().length > 0 || store.hwLines().length > 0; },
    totals: function () {
      var monthly = subtotal(store.cart());
      var hw = store.hwLines().reduce(function (s, l) { return s + l.total; }, 0);
      var units = store.hwLines().reduce(function (s, l) { return s + l.qty; }, 0);
      return { monthly: monthly, hardware: hw, due: monthly + hw, apps: store.cart().length, units: units };
    }
  };

  /* 4. Helpers -------------------------------------------------------------- */
  var money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  function fmt(n) { return money.format(n); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function subtotal(ids) { return ids.reduce(function (s, id) { return s + product(id).price; }, 0); }
  function nameList(ids) {
    var n = ids.map(function (id) { return '<strong>' + esc(product(id).name) + '</strong>'; });
    return n.length > 1 ? n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1] : n[0];
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function params() { return new URLSearchParams(window.location.search); }

  function setLoading(btn, on, label) {
    if (!btn) return;
    if (on) { btn.dataset.html = btn.innerHTML; btn.textContent = label || 'Please wait\u2026'; btn.classList.add('is-loading'); btn.disabled = true; }
    else { if (btn.dataset.html) btn.innerHTML = btn.dataset.html; btn.classList.remove('is-loading'); btn.disabled = false; }
  }
  function fieldError(input, message, errId) {
    var err = document.getElementById(errId || input.id + '-error');
    if (message) { input.setAttribute('aria-invalid', 'true'); if (err) { err.textContent = message; err.hidden = false; } }
    else { input.removeAttribute('aria-invalid'); if (err) { err.textContent = ''; err.hidden = true; } }
    return !message;
  }
  function clearErrorsOnInput(form) {
    $$('input, select', form).forEach(function (el) {
      ['input', 'change'].forEach(function (ev) {
        el.addEventListener(ev, function () { if (el.getAttribute('aria-invalid')) fieldError(el, ''); });
      });
    });
  }
  function focusFirstInvalid(root) { var b = $('[aria-invalid="true"]', root); if (b) b.focus(); }

  var ICON_CHECK = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var ICON_PLUS = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var ICON_X = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var ICON_CHECKC = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';

  /* Dialogs */
  var lastFocus = null;
  function openDialog(d, focusSel) {
    if (!d) return;
    if (!d.open) { lastFocus = lastFocus || document.activeElement; d.showModal(); }
    var t = focusSel ? $(focusSel, d) : null;
    if (t) t.focus();
  }
  function closeDialog(d, keepFocus) {
    if (d && d.open) d.close();
    if (!keepFocus && lastFocus && document.body.contains(lastFocus)) { lastFocus.focus(); lastFocus = null; }
  }
  function wireDialogs() {
    $$('dialog').forEach(function (d) {
      d.addEventListener('click', function (e) {
        if (e.target !== d || d.hasAttribute('data-static')) return;
        var r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(d);
      });
      if (d.hasAttribute('data-static')) d.addEventListener('cancel', function (e) { e.preventDefault(); });
    });
    $$('[data-close-dialog]').forEach(function (b) { b.addEventListener('click', function () { closeDialog(b.closest('dialog')); }); });
  }

  /* Header stepper */
  function setStep(n) {
    $$('.stepper__item').forEach(function (li) {
      var i = +li.getAttribute('data-step');
      var st = i < n ? 'done' : (i === n ? 'current' : 'upcoming');
      li.setAttribute('data-state', st);
      if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      var sr = $('.sr-only', li);
      if (sr) sr.textContent = st === 'done' ? ' (completed)' : (st === 'current' ? ' (current step)' : '');
    });
  }

  /* Landing / catalog hamburger */
  function wireNavToggle() {
    $$('[data-nav-toggle]').forEach(function (t) {
      var nav = document.getElementById(t.getAttribute('aria-controls'));
      if (!nav) return;
      function set(open) { t.setAttribute('aria-expanded', String(open)); t.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); nav.classList.toggle('is-open', open); }
      t.addEventListener('click', function () { set(t.getAttribute('aria-expanded') !== 'true'); });
      nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { set(false); t.focus(); } });
    });
  }

  /* Demo tips next to email fields */
  function wireDemoTips() {
    $$('[data-demo-tip]').forEach(function (tip) {
      tip.hidden = !DEMO_MODE;
      var btn = $('[data-demo-fill]', tip);
      if (btn) btn.addEventListener('click', function () {
        var input = document.getElementById(btn.getAttribute('data-demo-fill'));
        if (!input) return;
        input.value = DEMO_EXISTING_EMAILS[0];
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      });
    });
  }

  function isSignedIn() { var s = store.get(); return !!(s.verified && s.account); }
  function initials(name, email) {
    var src = (name || email || '').trim(); if (!src) return '';
    var parts = src.split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : src.slice(0, 2)).toUpperCase();
  }
  function fillProfile() {
    var s = store.get(), acct = s.account || {}, email = acct.email || s.email || '';
    $$('[data-profile-name]').forEach(function (el) { el.textContent = acct.name || (isSignedIn() ? 'Your account' : 'Guest'); });
    $$('[data-profile-email]').forEach(function (el) { el.textContent = email; });
    $$('[data-profile-initials]').forEach(function (el) { el.textContent = initials(acct.name, email); });
    $$('.profile').forEach(function (p) { p.classList.toggle('has-initials', !!initials(acct.name, email)); });
  }

  /** Log out: clear the session (keep the theme preference) and go home */
  function logout() {
    var theme = store.get().theme;
    // PRODUCTION: call your sign-out endpoint before clearing local state
    store.reset();
    store.set({ theme: theme, flash: 'You\u2019ve been signed out.' });
    window.location.href = 'index.html';
  }

  function wireProfile() {
    fillProfile();
    var signedIn = isSignedIn();
    $$('[data-profile-public]').forEach(function (p) { p.hidden = !signedIn; });
    $$('[data-signin-link]').forEach(function (a) { a.hidden = signedIn; });
    var btn = $('#profile-button'), menu = $('#profile-menu');
    if (btn && menu) {
      var set = function (open) { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; if (open) { var f = $('a, button', menu); if (f) f.focus(); } };
      btn.addEventListener('click', function () { set(menu.hidden); });
      document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) set(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
    }
    $$('[data-logout]').forEach(function (b) { b.addEventListener('click', logout); });
  }

  /** One-off message carried across a page change (e.g. after logging out) */
  function showFlash() {
    var msg = store.get().flash; if (!msg) return;
    store.set({ flash: null });
    var el = document.createElement('div');
    el.className = 'flash'; el.setAttribute('role', 'status');
    el.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg><span></span>';
    el.querySelector('span').textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.classList.add('is-leaving'); setTimeout(function () { el.remove(); }, 400); }, 4000);
  }

  /* In-app "My Apps" menu */
  function wireAppsMenu() {
    var btn = $('#apps-button'), menu = $('#apps-menu');
    if (!btn || !menu) return;
    function set(open) { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; if (open) $('a', menu).focus(); }
    btn.addEventListener('click', function () { set(menu.hidden); });
    document.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
  }

  /* Card on file → every [data-card-*] element */
  function renderCard(card) {
    var name = card ? card.name : '';
    $$('[data-card-name]').forEach(function (el) { el.textContent = name; });
    $$('[data-card-last4]').forEach(function (el) { el.textContent = card ? card.last4 : '\u2022\u2022\u2022\u2022'; });
    $$('[data-card-exp]').forEach(function (el) { el.textContent = card ? card.expMonth + '/' + card.expYear : ''; });
    $$('[data-card-exp-short]').forEach(function (el) { el.textContent = card ? String(card.expMonth).padStart(2, '0') + '/' + String(card.expYear).slice(-2) : ''; });
    var pc = $('#paycard');
    if (pc) pc.setAttribute('aria-label', card ? BRAND_LABEL[card.brand] + ' card ending in ' + card.last4 : 'No card on file');
  }

  /* Card helpers */
  var BRAND_LABEL = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', discover: 'Discover', card: 'Card' };
  function cardBrand(n) {
    if (/^4/.test(n)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
    if (/^3[47]/.test(n)) return 'amex';
    if (/^(6011|65|64[4-9])/.test(n)) return 'discover';
    return 'card';
  }
  var US_STATES = [['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming']];

  /* ========================================================================
     5. Payments adapter (CSG Forte)
     PRODUCTION: replace `open` with Forte's hosted checkout. Forte renders the
     card → billing → authorize steps itself and returns a token + card metadata;
     call onSuccess({ token, brand, last4, expMonth, expYear, name, billing }).
     The mock below drives the prototype dialogs in payment-modes.html.
     ======================================================================== */
  var payments = (function () {
    var draft = {}, onDone = null, amount = 0;
    var dCard, dBill, dReview;

    function init() {
      dCard = $('#forte-card'); dBill = $('#forte-billing'); dReview = $('#forte-review');
      if (!dCard) return false;
      $$('[data-merchant]').forEach(function (el) { el.textContent = MERCHANT_NAME; });

      /* Step 1: card */
      var num = $('#fc-number'), exp = $('#fc-exp'), cvv = $('#fc-cvv'), next = $('#fc-next');
      var chips = $('[data-brand-chips]', dCard);
      function sync() { /* No validation: Next is always available (demo checkout) */ }
      num.addEventListener('input', function () {
        var d = num.value.replace(/\D/g, '').slice(0, 19), b = d.length >= 2 ? cardBrand(d) : '';
        num.value = b === 'amex' ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, function (m, a, x, y) { return [a, x, y].filter(Boolean).join(' '); }) : d.replace(/(\d{4})(?=\d)/g, '$1 ');
        if (chips) {
          chips.classList.toggle('has-match', !!b && b !== 'card');
          $$('.brand-chip', chips).forEach(function (ch) { ch.classList.toggle('is-active', ch.getAttribute('data-brand') === b); });
        }
        sync();
      });
      exp.addEventListener('input', function () { var d = exp.value.replace(/\D/g, '').slice(0, 6); exp.value = d.length > 2 ? d.slice(0, 2) + ' ' + d.slice(2) : d; sync(); });
      cvv.addEventListener('input', function () { cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4); sync(); });
      clearErrorsOnInput($('#forte-card-form'));

      $('#forte-card-form').addEventListener('submit', function (e) {
        e.preventDefault();
        // No validation in the demo popup. Forte's hosted checkout validates cards in production.
        // Blank or partial entries fall back to a demo Visa ending 1111, exp 08/2029.
        var n = num.value.replace(/\D/g, ''), d = exp.value.replace(/\D/g, '');
        var mm = +d.slice(0, 2), yyyy = +d.slice(2);
        if (yyyy && yyyy < 100) yyyy += 2000;
        var valid = mm >= 1 && mm <= 12 && yyyy >= 2000;
        draft.card = { brand: n.length >= 2 && cardBrand(n) !== 'card' ? cardBrand(n) : DEMO_CARD.brand,
                       last4: n.length >= 4 ? n.slice(-4) : DEMO_CARD.last4,
                       expMonth: valid ? mm : DEMO_CARD.expMonth, expYear: valid ? yyyy : DEMO_CARD.expYear };
        num.value = ''; exp.value = ''; cvv.value = '';   // drop sensitive values
        if (chips) { chips.classList.remove('has-match'); $$('.brand-chip', chips).forEach(function (ch) { ch.classList.remove('is-active'); }); }
        go(dBill, '#fb-company');
      });

      /* Step 2: billing */
      var st = $('#fb-state');
      st.insertAdjacentHTML('beforeend', US_STATES.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join(''));
      clearErrorsOnInput($('#forte-billing-form'));
      $('#forte-billing-form').addEventListener('submit', function (e) {
        e.preventDefault();
        // No validation: blanks fall back to the account's details
        var acct = store.get().account || {};
        var f = {}; ['company', 'name', 'address1', 'address2', 'city', 'state', 'postal', 'phone', 'email'].forEach(function (k) { f[k] = $('#fb-' + k); });
        draft.billing = {};
        Object.keys(f).forEach(function (k) { draft.billing[k] = f[k].value.trim(); });
        draft.billing.company = draft.billing.company || acct.business || '';
        draft.billing.name = draft.billing.name || acct.name || 'Card holder';
        draft.billing.email = draft.billing.email || acct.email || store.get().email || '';
        go(dReview, '#forte-authorize');
      });

      /* Step 3: review + authorize */
      $('#forte-authorize').addEventListener('click', function () {
        var btn = this;
        setLoading(btn, true, 'Authorizing\u2026');
        // PRODUCTION: Forte returns the token; this mock fabricates one.
        delay({ ok: true, token: 'fttok_demo_' + Date.now() }, 900).then(function (res) {
          setLoading(btn, false);
          if (!res.ok) { var er = $('#forte-error'); er.textContent = res.message || 'The authorization didn\u2019t go through. Check the card details or try another card.'; er.hidden = false; return; }
          var card = Object.assign({ token: res.token, name: draft.billing.name, billing: draft.billing }, draft.card);
          closeDialog(dReview);
          draft = {};
          if (onDone) onDone(card);
        });
      });

      $$('[data-forte-edit]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.getAttribute('data-forte-edit') === 'card') go(dCard, '#fc-number'); else go(dBill, '#fb-company');
        });
      });
      return true;
    }

    function summaries() {
      var c = draft.card || {}, b = draft.billing || {}, acct = store.get().account || {};
      var company = (b.company || acct.business || '');
      $$('[data-review-brand]').forEach(function (el) { el.textContent = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX', discover: 'DISC' }[c.brand] || 'CARD'; });
      $$('[data-review-pay]').forEach(function (el) {
        el.innerHTML = (company ? '<strong>' + esc(company) + '</strong><br>' : '') +
          esc(b.name || acct.name || '') + '<br>' + esc(BRAND_LABEL[c.brand || 'card']) + ' Card - ' + esc(c.last4) + '<br>' +
          '<span class="forte-exp">Exp. ' + String(c.expMonth).padStart(2, '0') + '/' + esc(c.expYear) + '</span>';
      });
      $$('[data-review-bill]').forEach(function (el) {
        el.innerHTML = [esc(b.company), esc(b.name), esc([b.address1, b.address2].filter(Boolean).join(', ')),
          esc([b.city, b.state, b.postal].filter(Boolean).join(', '))].filter(Boolean).join('<br>');
      });
      $$('[data-review-amount]').forEach(function (el) { el.textContent = fmt(amount); });
      var er = $('#forte-error'); if (er) er.hidden = true;
    }

    function prefillBilling() {
      var s = store.get(), acct = s.account || {}, prev = (s.card && s.card.billing) || {};
      var v = { company: prev.company || acct.business, name: prev.name || acct.name, address1: prev.address1, address2: prev.address2,
                city: prev.city, state: prev.state, postal: prev.postal, phone: prev.phone, email: prev.email || s.email };
      Object.keys(v).forEach(function (k) { var el = $('#fb-' + k); if (el && !el.value) el.value = v[k] || ''; });
    }

    function go(dialog, focusSel) {
      [dCard, dBill, dReview].forEach(function (d) { if (d !== dialog && d.open) d.close(); });
      if (dialog === dBill) prefillBilling();
      summaries();
      openDialog(dialog, focusSel);
    }

    return {
      /** Open checkout. opts: { amount, onSuccess(card) } */
      open: function (opts) {
        if (!dCard && !init()) return;
        amount = opts.amount || 0; onDone = opts.onSuccess; draft = {};
        go(dCard, '#fc-number');
      }
    };
  })();

  /* ========================================================================
     6. Pages
     ======================================================================== */

  /* ---------- Landing ---------- */
  function initLanding() {
    var header = $('.l-header');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
    $$('[data-buy-now]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-buy-now') || BASE_PRODUCT;
        if ((store.get().purchased || []).indexOf(id) !== -1) store.set({ ribbonIds: [id] });   // products page shows the ribbon
        else store.addToCart(id);
        window.location.href = 'products.html';
      });
    });
  }

  /* ---------- Sign-up (email + cart) ---------- */
  function initSignup() {
    if (!store.hasItems()) store.addToCart(BASE_PRODUCT);
    var list = $('#signup-cart');
    function render() {
      var cart = store.cart();
      list.innerHTML = cart.length ? cart.map(function (id) {
        var p = product(id);
        return '<li class="cart-line"><img class="cart-line__icon" src="' + esc(p.image) + '" alt="" width="48" height="48">' +
          '<div><div class="cart-line__top"><span class="cart-line__name">' + esc(p.name) + '</span><span class="cart-line__price">US' + fmt(p.price) + '/mo</span></div>' +
          '<p class="cart-line__meta">' + esc(p.id === BASE_PRODUCT ? 'Workforce Management' : (p.label || '')) + '</p></div>' +
          '<button type="button" class="cart-line__remove" data-remove="' + p.id + '" aria-label="Remove ' + esc(p.name) + '">' + ICON_X + '</button></li>';
      }).join('') : '';
      list.innerHTML += store.hwLines().map(function (l) {
        return '<li class="cart-line cart-line--hw"><img class="cart-line__icon" src="' + esc(l.p.image) + '" alt="" width="48" height="48">' +
          '<div><div class="cart-line__top"><span class="cart-line__name">' + esc(l.p.name) + '</span><span class="cart-line__price">US' + fmt(l.total) + '</span></div>' +
          '<p class="cart-line__meta">Qty ' + l.qty + ' &middot; ' + fmt(l.p.price) + ' each, one-time</p></div>' +
          '<button type="button" class="cart-line__remove" data-remove-hw="' + l.p.id + '" aria-label="Remove ' + esc(l.p.name) + '">' + ICON_X + '</button></li>';
      }).join('');
      if (!store.hasItems()) list.innerHTML = '<li class="order-summary__empty">Your cart is empty. <a class="link-btn" href="products.html">Browse apps</a></li>';
      var t = store.totals();
      $('#signup-subtotal').textContent = 'US' + fmt(t.monthly) + '/mo';
      $('#signup-hw-row').hidden = !t.hardware;
      $('#signup-hw').textContent = 'US' + fmt(t.hardware);
      $('#signup-total').textContent = t.hardware ? 'US' + fmt(t.due) : 'US' + fmt(t.monthly) + '/mo';
      $('#signup-total-sub').textContent = t.hardware ? (t.monthly ? 'due today, then US' + fmt(t.monthly) + '/mo + TAX' : 'due today + TAX') : '+ TAX';
    }
    list.addEventListener('click', function (e) {
      var r = e.target.closest('[data-remove]'), rh = e.target.closest('[data-remove-hw]');
      if (r) store.removeFromCart(r.getAttribute('data-remove'));
      if (rh) store.setQty(rh.getAttribute('data-remove-hw'), 0);
      if (r || rh) { render(); $('#cart-title').focus(); }
    });
    $('#cart-title').setAttribute('tabindex', '-1');
    render();

    var input = $('#signup-email');
    if (store.get().email) input.value = store.get().email;
    clearErrorsOnInput($('#signup-form'));
    $('#signup-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!fieldError(input, !v ? 'Enter your email address.' : (isEmail(v) ? '' : 'Enter a valid email address, like name@company.com.'))) return input.focus();
      var btn = $('button[type="submit"]', this);
      setLoading(btn, true);
      api.checkEmail(v).then(function (res) {
        store.set({ email: v });
        // Existing account → sign in; anyone else → registration (new-customer flow)
        var prev = store.get().account;
        if (prev && (prev.email || '').toLowerCase() !== v.toLowerCase()) {
          // a different person: drop the previous session's account, card and verification
          store.set({ account: null, card: null, verified: false, purchased: [], authFlow: null });
        }
        store.set({ authFlow: res.exists ? 'signin' : 'register' });
        window.location.href = res.exists ? 'login.html' : 'registration.html';
      });
    });
  }

  var ICON_MINUS = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>';
  var ICON_TRASH = '<svg class="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>';
  var ICON_BOX = '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>';

  /** Quantity stepper used on hardware cards and in the order summary */
  function qtyHTML(p, qty, compact) {
    return '<div class="qty' + (compact ? ' qty--sm' : '') + '" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
      '<button type="button" class="qty__btn" data-qty-dec="' + p.id + '" aria-label="' + (qty <= 1 ? 'Remove ' + esc(p.name) : 'Decrease quantity') + '">' + (qty <= 1 ? ICON_TRASH : ICON_MINUS) + '</button>' +
      '<input class="qty__input" type="number" inputmode="numeric" min="1" max="' + HW_MAX_QTY + '" value="' + qty + '" data-qty-input="' + p.id + '" aria-label="Quantity">' +
      '<button type="button" class="qty__btn" data-qty-inc="' + p.id + '" aria-label="Increase quantity"' + (qty >= HW_MAX_QTY ? ' disabled' : '') + '>' + ICON_PLUS + '</button></div>';
  }
  /** Wire +/- / typed quantity inside a container; onChange re-renders */
  function wireQty(root, onChange) {
    root.addEventListener('click', function (e) {
      var inc = e.target.closest('[data-qty-inc]'), dec = e.target.closest('[data-qty-dec]');
      if (inc) { var id = inc.getAttribute('data-qty-inc'); store.setQty(id, (store.hw()[id] || 0) + 1); onChange(id, 'inc'); }
      if (dec) { var id2 = dec.getAttribute('data-qty-dec'); store.setQty(id2, (store.hw()[id2] || 0) - 1); onChange(id2, 'dec'); }
    });
    root.addEventListener('change', function (e) {
      var inp = e.target.closest('[data-qty-input]'); if (!inp) return;
      var id = inp.getAttribute('data-qty-input'), v = parseInt(inp.value, 10);
      store.setQty(id, isNaN(v) || v < 1 ? 1 : v); onChange(id, 'input');
    });
  }
  function refocus(root, id, kind) {
    var sel = kind === 'inc' ? '[data-qty-inc="' + id + '"]' : kind === 'dec' ? '[data-qty-dec="' + id + '"]' : '[data-qty-input="' + id + '"]';
    var el = $(sel, root) || $('[data-hw-add="' + id + '"]', root); if (el) el.focus();
  }
  function priceTag(p) {
    return fmt(p.price) + (HARDWARE_PRICES_FINAL ? '' : '<span class="est-tag" title="Estimated price">Est.</span>');
  }

  /* ---------- Products & cart ---------- */
  function itemRow(p, removable) {
    return '<li class="cart-item"><img class="cart-item__thumb" src="' + esc(p.image) + '" alt="" width="40" height="40">' +
      '<div><p class="cart-item__name">' + esc(p.name) + '</p><p class="cart-item__meta">Monthly subscription</p></div>' +
      '<p class="cart-item__price">' + fmt(p.price) + '<span class="cart-item__meta">/mo</span></p>' +
      (removable ? '<button type="button" class="cart-item__remove" data-remove="' + p.id + '" aria-label="Remove ' + esc(p.name) + '">' + ICON_X + '</button>' : '') + '</li>';
  }

  function initCatalog() {
    var grid = $('#product-grid'), hwGrid = $('#hardware-grid'), items = $('#summary-items'), active = 'recommended', hwGroup = 'all';
    var owned = store.get().purchased || [];
    function isOwned(id) { return owned.indexOf(id) !== -1; }

    /* "The product is already purchased." toast */
    var ribbon = $('#ribbon'), ribbonTimer;
    function showRibbon(ids) {
      if (!ribbon || !ids.length) return;
      var names = ids.map(function (id) { return product(id).name; }).join(', ');
      $('#ribbon-text').textContent = ids.length > 1 ? 'These products are already purchased.' : 'The product is already purchased.';
      var link = $('#ribbon-link');
      link.href = 'manage.html?app=' + encodeURIComponent(ids[0]);
      link.setAttribute('aria-label', 'Manage ' + names);
      ribbon.setAttribute('title', names);
      ribbon.hidden = true; void ribbon.offsetWidth; ribbon.hidden = false;
      clearTimeout(ribbonTimer);
      ribbonTimer = setTimeout(function () { ribbon.hidden = true; }, 6000);
    }
    if (ribbon) $('#ribbon-close').addEventListener('click', function () { ribbon.hidden = true; });
    function cardHTML(p) {
      var own = isOwned(p.id);
      return '<article class="pcard' + (p.featured ? ' pcard--featured' : '') + (own ? ' is-owned' : '') + '" data-id="' + p.id + '">' +
        (own ? '<span class="pcard__ribbon" aria-hidden="true">Subscribed</span>' : '') +
        '<div class="pcard__head"><img class="pcard__icon" src="' + esc(p.image) + '" alt="" width="56" height="56" loading="lazy">' +
        '<div class="pcard__titles"><h3 class="pcard__name">' + esc(p.name) + '</h3><p class="pcard__cat">' + esc(p.label || '') + (p.featured ? '<span class="pcard__badge">Popular</span>' : '') + '</p></div></div>' +
        '<p class="pcard__desc">' + esc(p.description) + '</p>' +
        '<div class="pcard__foot"><div><p class="pcard__price">' + fmt(p.price) + '<span class="pcard__per">/mo</span></p>' +
        '<a class="pcard__details" href="#" data-details="' + p.id + '" aria-label="Details for ' + esc(p.name) + '">Details</a></div>' +
        '<button type="button" class="btn btn--primary btn--sm pcard__add" data-add="' + p.id + '"></button></div></article>';
    }
    function hwCardHTML(p) {
      return '<article class="hcard" data-hw="' + p.id + '" data-group="' + p.group + '">' +
        '<div class="hcard__media' + (p.photo ? ' hcard__media--photo' : '') + '" data-media data-label="' + esc(p.name) + '"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" width="' + (p.photo ? 550 : 240) + '" height="' + (p.photo ? 580 : 160) + '" loading="lazy" decoding="async"></div>' +
        '<div class="hcard__body"><p class="hcard__type">' + esc(p.type) + '</p><h3 class="hcard__name">' + esc(p.name) + '</h3>' +
        '<p class="hcard__desc">' + esc(p.description) + '</p>' +
        '<ul class="hcard__specs">' + p.specs.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<div class="hcard__foot"><div class="hcard__pricebox"><p class="hcard__price">' + fmt(p.price) + '</p>' +
          '<p class="hcard__per">one-time' + (HARDWARE_PRICES_FINAL ? '' : ' <span class="est-tag" title="Estimated price">Est.</span>') + '</p></div>' +
        '<div class="hcard__action" data-hw-action="' + p.id + '"></div></div></div></article>';
    }
    function syncAdd() {
      var cart = store.cart();
      $$('[data-add]', grid).forEach(function (b) {
        var p = product(b.getAttribute('data-add')), added = cart.indexOf(p.id) !== -1, own = isOwned(p.id);
        b.classList.toggle('is-added', added);
        b.classList.toggle('is-owned', own);
        b.closest('.pcard').classList.toggle('is-added', added);
        b.setAttribute('aria-disabled', String(added));
        b.setAttribute('aria-label', own ? p.name + ' is already subscribed' : (added ? p.name + ' is in your cart' : 'Add ' + p.name + ' to cart'));
        b.innerHTML = own ? ICON_CHECK + 'Subscribed' : (added ? ICON_CHECK + 'Added' : ICON_PLUS + 'Add');
      });
      var h = store.hw();
      $$('[data-hw-action]', hwGrid).forEach(function (box) {
        var id = box.getAttribute('data-hw-action'), p = hardware(id), q = h[id] || 0;
        box.closest('.hcard').classList.toggle('is-added', q > 0);
        box.innerHTML = q > 0 ? qtyHTML(p, q) : '<button type="button" class="btn btn--primary btn--sm pcard__add" data-hw-add="' + id + '" aria-label="Add ' + esc(p.name) + ' to cart">' + ICON_PLUS + 'Add</button>';
      });
    }
    function hwRow(l) {
      return '<li class="cart-item cart-item--hw"><img class="cart-item__thumb cart-item__thumb--hw" src="' + esc(l.p.image) + '" alt="" width="40" height="40">' +
        '<div><p class="cart-item__name">' + esc(l.p.name) + '</p><p class="cart-item__meta">' + fmt(l.p.price) + ' each, one-time</p>' + qtyHTML(l.p, l.qty, true) + '</div>' +
        '<p class="cart-item__price">' + fmt(l.total) + '</p></li>';
    }
    function renderSummary() {
      var cart = store.cart(), lines = store.hwLines(), t = store.totals();
      var parts = [];
      if (cart.length) parts.push('<li class="summary-group">Apps<span>billed monthly</span></li>' + cart.map(function (id) { return itemRow(product(id), true); }).join(''));
      if (lines.length) parts.push('<li class="summary-group">Hardware<span>one-time</span></li>' + lines.map(hwRow).join(''));
      items.innerHTML = parts.length ? parts.join('') : '<li class="order-summary__empty">Your cart is empty.<br>Add an app or hardware to continue.</li>';
      var countBits = [];
      if (t.apps) countBits.push(t.apps + (t.apps === 1 ? ' app' : ' apps'));
      if (t.units) countBits.push(t.units + (t.units === 1 ? ' device' : ' devices'));
      $('#sum-count').textContent = countBits.join(', ');
      $('#sum-subtotal').textContent = fmt(t.monthly) + '/mo';
      $('#sum-subtotal').closest('.totals__row').hidden = !t.monthly && !!t.hardware;
      $('#sum-monthly').closest('.totals__row').hidden = !t.monthly && !!t.hardware;
      $('#sum-hw-row').hidden = !t.hardware;
      $('#sum-hardware').textContent = fmt(t.hardware);
      $('#sum-monthly').textContent = fmt(t.monthly) + '/mo';
      $('#sum-discount-row').hidden = true;
      $('#sum-due').textContent = fmt(t.due);
      $('#sum-due-sub').textContent = t.monthly ? 'Then ' + fmt(t.monthly) + '/mo' : (t.hardware ? 'One-time hardware purchase' : '');
      $('#bar-total').textContent = fmt(t.due);
      $('#bar-count').textContent = (countBits.join(', ') || '0 items') + ', due today';
      $$('[data-checkout]').forEach(function (b) { b.disabled = !store.hasItems(); });
      syncAdd();
    }
    function matches(text, q) { return !q || text.toLowerCase().indexOf(q) !== -1; }
    function filter() {
      var q = $('#product-search').value.trim().toLowerCase(), apps = 0, hw = 0;
      var showApps = active !== 'hardware';
      $$('.pcard', grid).forEach(function (c) {
        var p = product(c.getAttribute('data-id'));
        c.hidden = !(showApps && (active === 'recommended' || p.category === active) && matches(p.name + ' ' + p.description + ' ' + p.label, q));
        if (!c.hidden) apps++;
      });
      $$('.hcard', hwGrid).forEach(function (c) {
        var p = hardware(c.getAttribute('data-hw'));
        c.hidden = !((hwGroup === 'all' || p.group === hwGroup) && matches(p.name + ' ' + p.type + ' ' + p.description + ' ' + p.specs.join(' '), q));
        if (!c.hidden) hw++;
      });
      $('#apps-section').hidden = !showApps;
      $('#catalog-empty').hidden = !showApps || apps > 0;
      $('#hardware-empty').hidden = hw > 0;
      $('#search-status').textContent = q ? apps + (apps === 1 ? ' app' : ' apps') + ' and ' + hw + ' hardware ' + (hw === 1 ? 'item' : 'items') + ' found' : '';
    }

    grid.innerHTML = CATALOG.filter(function (p) { return p.listed !== false; }).map(cardHTML).join('');
    hwGrid.innerHTML = HARDWARE.map(hwCardHTML).join('');
    $('#hw-filters').innerHTML = HARDWARE_GROUPS.map(function (g) {
      var n = g[0] === 'all' ? HARDWARE.length : HARDWARE.filter(function (x) { return x.group === g[0]; }).length;
      return '<button type="button" class="chip" data-hw-group="' + g[0] + '" aria-pressed="' + (g[0] === 'all') + '">' + esc(g[1]) + '<span class="chip__count">' + n + '</span></button>';
    }).join('');

    grid.addEventListener('click', function (e) {
      var a = e.target.closest('[data-add]');
      if (a && isOwned(a.getAttribute('data-add'))) { showRibbon([a.getAttribute('data-add')]); return; }
      if (a && a.getAttribute('aria-disabled') !== 'true') { store.addToCart(a.getAttribute('data-add')); renderSummary(); a.focus(); }
      if (e.target.closest('[data-details]')) e.preventDefault(); // TODO: product detail page
    });
    hwGrid.addEventListener('click', function (e) {
      var a = e.target.closest('[data-hw-add]');
      if (a) { var id = a.getAttribute('data-hw-add'); store.setQty(id, 1); renderSummary(); refocus(hwGrid, id, 'inc'); }
    });
    wireQty(hwGrid, function (id, kind) { renderSummary(); refocus(hwGrid, id, kind); });
    wireQty(items, function (id, kind) { renderSummary(); if (store.hw()[id]) refocus(items, id, kind); else $('#summary-title').focus(); });
    items.addEventListener('click', function (e) { var r = e.target.closest('[data-remove]'); if (r) { store.removeFromCart(r.getAttribute('data-remove')); renderSummary(); $('#summary-title').focus(); } });
    $('#product-search').addEventListener('input', filter);
    $$('.seg-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        $$('.seg-tab').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        t.setAttribute('aria-pressed', 'true'); active = t.getAttribute('data-category'); filter();
        if (active === 'hardware') $('#hardware-section').scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    });
    $('#hw-filters').addEventListener('click', function (e) {
      var c = e.target.closest('[data-hw-group]'); if (!c) return;
      $$('[data-hw-group]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      c.setAttribute('aria-pressed', 'true'); hwGroup = c.getAttribute('data-hw-group'); filter();
    });
    $$('[data-checkout]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!store.hasItems()) return;
        var s = store.get();
        window.location.href = !s.verified ? 'signup.html' : (s.card ? 'confirm.html' : 'payment-modes.html');
      });
    });
    var pruned = (store.get().cart || []).filter(isOwned);
    (store.get().ribbonIds || []).forEach(function (id) { if (product(id) && pruned.indexOf(id) === -1) pruned.push(id); });
    store.set({ cart: (store.get().cart || []).filter(function (id) { return !isOwned(id); }), ribbonIds: [] });
    renderSummary(); filter();
    if (pruned.length) showRibbon(pruned);
    // PRODUCTION: refresh `owned` from api.getSubscriptions() for signed-in users before rendering.
  }

  /* ---------- Registration (account details) ---------- */
  function initRegistration() {
    var details = $('#details-form'), s = store.get();
    clearErrorsOnInput(details);
    if (s.email) $('#reg-email').value = s.email;
    if (s.account && !isExistingEmail(s.account.email)) { $('#reg-name').value = s.account.name || ''; $('#reg-business').value = s.account.business || ''; }
    var regMsg = $('#reg-message');
    var cart = store.cart();
    if (store.hasItems() && $('#auth-order')) {
      $('#auth-order-items').innerHTML = cart.map(function (id) {
        var p = product(id);
        return '<li class="auth-order__row">' + appIcon(id) + '<span class="auth-order__name">' + esc(p.name) + '</span><span class="auth-order__price">' + fmt(p.price) + '/mo</span></li>';
      }).join('') + store.hwLines().map(function (l) {
        return '<li class="auth-order__row"><svg class="auth-order__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON_BOX + '</svg>' +
          '<span class="auth-order__name">' + esc(l.p.name) + ' <span class="auth-order__qty">&times;' + l.qty + '</span></span><span class="auth-order__price">' + fmt(l.total) + '</span></li>';
      }).join('');
      $('#auth-order-total').textContent = fmt(store.totals().due);
      $('#auth-order').hidden = false;
    }
    details.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#reg-name'), email = $('#reg-email'), biz = $('#reg-business'), week = $('#reg-week-start'), ok = true;
      ok = fieldError(name, name.value.trim() ? '' : 'Enter your name.') && ok;
      ok = fieldError(email, !email.value.trim() ? 'Enter your email.' : (isEmail(email.value.trim()) ? '' : 'Enter a valid email address.')) && ok;
      ok = fieldError(biz, biz.value.trim() ? '' : 'Search for and select your business.') && ok;
      ok = fieldError(week, week.value ? '' : 'Choose the day your week starts.') && ok;
      if (!ok) return focusFirstInvalid(details);
      var payload = { name: name.value.trim(), email: email.value.trim(), business: biz.value.trim(), weekStart: week.value,
                      phone: $('#reg-phone').value.trim() ? '+1 ' + $('#reg-phone').value.trim() : '', captchaToken: null /* TODO: grecaptcha.getResponse() */ };
      var btn = $('button[type="submit"]', details);
      setLoading(btn, true);
      regMsg.hidden = true;
      api.registerAccount(payload).then(function (res) {
        if (!res.ok) {
          setLoading(btn, false);
          regMsg.innerHTML = esc(res.message || 'We couldn\u2019t create the account.') +
            (res.code === 'ACCOUNT_EXISTS' ? ' <a href="login.html" data-signin-email>Sign in instead</a>.' : '');
          regMsg.hidden = false;
          var l = $('[data-signin-email]', regMsg);
          if (l) { l.addEventListener('click', function () { store.set({ email: payload.email, authFlow: 'signin' }); }); l.focus(); }
          return;
        }
        return api.sendVerificationCode(payload.email).then(function () {
          // new customer: no saved card yet, so OTP (step 3, on this page) leads to Payment Modes
          store.set({ email: payload.email, account: payload, card: null, purchased: [], verified: false, otpSentAt: Date.now(), authFlow: 'register', pendingVerify: true });
          setLoading(btn, false);
          showVerify();
        });
      });
    });

    /* ----- Step 3: Verify Your Account (new customers) ----- */
    var verify = $('#verify-form');
    var otp = $$('.otp-input', verify), group = $('.otp-inputs', verify), vmsg = $('#verify-message');
    function showVerify() {
      $('#verify-email').textContent = store.get().email || 'your email address';
      details.hidden = true; verify.hidden = false;
      setStep(3);
      otp.forEach(function (x) { x.value = ''; });
      setVmsg('');
      otp[0].focus();
      window.scrollTo(0, 0);
    }
    function setVmsg(t, good) {
      vmsg.textContent = t || ''; vmsg.hidden = !t; vmsg.classList.toggle('form-message--ok', !!good);
      if (good || !t) group.removeAttribute('aria-invalid'); else group.setAttribute('aria-invalid', 'true');
    }
    otp.forEach(function (inp, i) {
      inp.addEventListener('input', function () { inp.value = inp.value.replace(/\D/g, '').slice(0, 1); if (!vmsg.hidden && !vmsg.classList.contains('form-message--ok')) setVmsg(''); if (inp.value && otp[i + 1]) otp[i + 1].focus(); });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !inp.value && otp[i - 1]) { otp[i - 1].focus(); otp[i - 1].value = ''; e.preventDefault(); }
        else if (e.key === 'ArrowLeft' && otp[i - 1]) otp[i - 1].focus();
        else if (e.key === 'ArrowRight' && otp[i + 1]) otp[i + 1].focus();
      });
      inp.addEventListener('paste', function (e) {
        var d = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, ''); if (!d) return;
        e.preventDefault();
        for (var j = 0; j + i < otp.length && j < d.length; j++) otp[i + j].value = d[j];
        otp[Math.min(i + d.length, otp.length - 1)].focus();
      });
    });
    verify.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = otp.map(function (x) { return x.value; }).join('');
      if (code.length !== 6) { setVmsg('Enter all 6 digits of the code.'); var em = otp.filter(function (x) { return !x.value; })[0]; if (em) em.focus(); return; }
      var vbtn = $('button[type="submit"]', verify);
      setLoading(vbtn, true, 'Verifying\u2026');
      api.verifyCode(store.get().email, code).then(function (res) {
        setLoading(vbtn, false);
        if (!res.ok) { setVmsg(res.message || 'That code didn\u2019t match. Check the email and try again.'); otp[0].focus(); return; }
        store.set({ verified: true, pendingVerify: false });
        window.location.href = afterVerified();   // no saved card yet → Payment Modes
      });
    });
    var resend = $('#resend-code');
    resend.addEventListener('click', function () {
      resend.disabled = true;
      api.sendVerificationCode(store.get().email).then(function () {
        store.set({ otpSentAt: Date.now() });
        setVmsg('A new code has been sent to ' + (store.get().email || 'your email') + '.', true);
        otp[0].focus();
        setTimeout(function () { resend.disabled = false; }, 30000);   // throttle resends
      });
    });
    // Reloading mid-verification keeps the customer on step 3
    if (s.pendingVerify && s.authFlow === 'register' && !s.verified && s.account) showVerify();
  }

  /* ---------- Sign-in / OTP shell (login.html, verify.html) ---------- */
  function applyTheme() {
    var dark = store.get().theme === 'dark';
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    var t = $('#theme-toggle');
    if (t) { t.setAttribute('aria-pressed', String(dark)); t.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'); }
  }

  var toastTimer;
  function showStatusToast(text) {
    var t = $('#a2-toast'); if (!t) return;
    $('#a2-toast-text').textContent = text; t.hidden = true; void t.offsetWidth; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 5000);
  }

  function initAuthShell(startId) {
    applyTheme();
    $('#theme-toggle').addEventListener('click', function () { store.set({ theme: store.get().theme === 'dark' ? 'light' : 'dark' }); applyTheme(); });

    var svg = function (d, sw) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
    var I = {
      monitor: svg('<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>'),
      star: svg('<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>'),
      check: svg('<path d="M20 6 9 17l-5-5"/>', 3),
      note: svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>', 2.5)
    };
    var frame = $('#showcase'), tabs = $('#product-tabs');
    var index = Math.max(0, SHOWCASE.map(function (x) { return x.id; }).indexOf(startId));

    tabs.innerHTML = SHOWCASE.map(function (p, i) {
      return '<button type="button" class="a2-tab" role="tab" id="ptab-' + p.id + '" aria-controls="showcase" aria-selected="false" tabindex="-1" data-i="' + i + '">' +
        '<span class="a2-tab__mark" style="background:' + p.mark + '" aria-hidden="true">' + esc(p.tab.charAt(0)) + '</span>' +
        (p.zip ? '<span class="a2-tab__zip">ZIP</span>' : '') + esc(p.tab) + '</button>';
    }).join('');

    function itemsHTML(items, icon) {
      return items.map(function (it) { return '<li class="sl__item"><span class="sl__ico">' + icon + '</span><div><p class="sl__t">' + esc(it[0]) + '</p><p class="sl__d">' + esc(it[1]) + '</p></div></li>'; }).join('');
    }
    function slideHTML(p) {
      if (p.image) return '<article class="sl" aria-roledescription="slide" aria-label="' + esc(p.name) + '"><img class="sl__img" src="' + esc(p.image) + '" alt="' + esc(p.alt || p.name) + '"></article>';
      var dark = p.theme === 'dark';
      var top = '<div class="sl__top"><div class="sl__copy">' +
        '<p class="sl__brand">' + (p.zip ? '<b>ZIP</b>' : '') + esc(p.tab) + '</p>' +
        '<h2 class="sl__headline">' + esc(p.headline) + '</h2>' +
        (p.lead ? '<p class="sl__lead">' + esc(p.lead) + '</p>' : '') +
        (p.body ? '<p class="sl__body">' + esc(p.body) + '</p>' : '') +
        (!p.a ? '<p class="sl__more"><a href="' + SUPPORT_URL + '">Talk to us about ' + esc(p.name) + '</a></p>' : '') +
        '</div>' + (p.photo
          ? '<figure class="sl__media sl__media--photo" data-media data-label="' + esc(p.name) + '"><img src="' + esc(p.photo) + '" alt="' + esc(p.photoAlt || p.name) + '" loading="lazy" decoding="async"></figure>'
          : '<div class="sl__media" role="img" aria-label="' + esc(p.name) + ' product photo"></div>') +
        '<span class="sl__chip">Altametrics <small>Growth</small></span></div>';
      if (!p.a) return '<article class="sl sl--' + p.theme + '" aria-roledescription="slide" aria-label="' + esc(p.name) + '">' + top + '</article>';
      var a = '<div class="sl__a"><h3 class="sl__h">' + esc(p.a.title) + '</h3><ul class="sl__grid">' + itemsHTML(p.a.items, dark ? I.star : I.monitor) + '</ul></div>';
      var b = '';
      if (p.b && p.b.layout === 'band') b = '<ul class="sl__b sl__b--band">' + itemsHTML(p.b.items, I.star) + '</ul>';
      if (p.b && p.b.layout === 'side') b = '<div class="sl__b sl__b--side"><h3 class="sl__h">' + esc(p.b.title) + '</h3><ul class="sl__list">' + itemsHTML(p.b.items, dark ? I.check : I.note) + '</ul></div>';
      var body = p.b && p.b.layout === 'side' ? '<div class="sl__split">' + a + b + '</div>' : a + b;
      return '<article class="sl sl--' + p.theme + '" aria-roledescription="slide" aria-label="' + esc(p.name) + '">' + top + body + '</article>';
    }
    function show(i, focusTab) {
      index = (i + SHOWCASE.length) % SHOWCASE.length;
      var p = SHOWCASE[index];
      frame.innerHTML = slideHTML(p);
      $('#cta-app').textContent = p.name;
      $$('.a2-tab', tabs).forEach(function (t, k) { t.setAttribute('aria-selected', String(k === index)); t.tabIndex = k === index ? 0 : -1; });
      if (focusTab) $('#ptab-' + p.id).focus();
    }
    $('#slide-prev').addEventListener('click', function () { show(index - 1); });
    $('#slide-next').addEventListener('click', function () { show(index + 1); });
    tabs.addEventListener('click', function (e) { var t = e.target.closest('.a2-tab'); if (t) show(+t.getAttribute('data-i')); });
    tabs.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { show(index + 1, true); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { show(index - 1, true); e.preventDefault(); }
    });
    show(index);
  }

  /* Where a verified customer lands */
  function afterVerified() {
    var s = store.get();
    if (s.authFlow === 'signin' && s.card) return store.hasItems() ? 'confirm.html' : 'manage.html';
    return s.card && store.hasItems() ? 'confirm.html' : 'payment-modes.html';
  }

  /* ---------- Sign-in (returning customer) ---------- */
  function initLogin() {
    initAuthShell('signage');
    var form = $('#panel-signin'), email = $('#login-email'), pw = $('#login-password'), msg = $('#login-message');
    if (store.get().email) email.value = store.get().email;
    (email.value ? pw : email).focus({ preventScroll: true });
    clearErrorsOnInput(form);
    function setMsg(t) { msg.textContent = t || ''; msg.hidden = !t; }

    /* Sign-in / QR tabs */
    var tabsEl = [$('#tab-signin'), $('#tab-qr')];
    function selectTab(t) {
      tabsEl.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    }
    tabsEl.forEach(function (t, i) {
      t.addEventListener('click', function () { selectTab(t); });
      t.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var o = tabsEl[1 - i]; selectTab(o); o.focus(); e.preventDefault(); } });
    });

    /* Show / hide password */
    var eye = $('#toggle-password');
    eye.addEventListener('click', function () {
      var show = pw.type === 'password'; pw.type = show ? 'text' : 'password';
      eye.setAttribute('aria-pressed', String(show)); eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });

    /* Passkey info toggletip */
    var info = $('#passkey-info'), tip = $('#passkey-tip');
    info.addEventListener('click', function () { var open = tip.hidden; tip.hidden = !open; info.setAttribute('aria-expanded', String(open)); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !tip.hidden) { tip.hidden = true; info.setAttribute('aria-expanded', 'false'); } });

    function goToOtp(res, address) {
      store.set({ email: address, account: res.account, card: res.card || store.get().card, purchased: res.subscriptions || store.get().purchased,
                  authFlow: 'signin', otpSentAt: Date.now(), otpToast: true });
      return api.sendVerificationCode(address).then(function () { window.location.href = 'verify.html'; });
    }
    function noAccount(address) {
      msg.innerHTML = 'No account found for <strong>' + esc(address) + '</strong>. <a href="registration.html" data-register-email>Register now</a> to create one.';
      msg.hidden = false;
      var link = $('[data-register-email]', msg);
      link.addEventListener('click', function () { store.set({ email: address, authFlow: 'register', account: null, card: null, verified: false }); });
      link.focus();
    }
    function checkEmail() {
      var v = email.value.trim();
      return fieldError(email, !v ? 'Enter your email ID.' : (isEmail(v) ? '' : 'Enter a valid email address.')) ? v : null;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault(); setMsg('');
      var v = checkEmail(), okPw = fieldError(pw, pw.value ? '' : 'Enter your password.');
      if (!v || !okPw) return focusFirstInvalid(form);
      var btn = $('.a2-submit', form);
      setLoading(btn, true, 'Signing in\u2026');
      api.signIn(v, pw.value, $('#remember-me').checked).then(function (res) {
        if (!res.ok) {
          setLoading(btn, false);
          if (res.code === 'NO_ACCOUNT') return noAccount(v);
          setMsg(res.message || 'The email or password is incorrect.'); pw.focus(); return;
        }
        pw.value = '';
        // Email + password is enough: no OTP. Signed in → saved card on Confirm (or Payment Modes / Manage).
        store.set({ email: v, account: res.account, card: res.card || store.get().card, purchased: res.subscriptions || store.get().purchased,
                    authFlow: 'signin', verified: true, otpToast: false,
                    flash: 'Signed in as ' + ((res.account && res.account.name) || v) + '.' });
        window.location.href = afterVerified();
      });
    });

    $('#verify-via-email').addEventListener('click', function () {
      setMsg('');
      var v = checkEmail(); if (!v) return email.focus();
      var b = this; b.disabled = true;
      api.lookupAccount(v).then(function (res) {
        if (!res.ok) { b.disabled = false; return noAccount(v); }
        return goToOtp(res, v);
      });
    });

    $('#passkey-btn').addEventListener('click', function () {
      setMsg('');
      api.signInWithPasskey().then(function (res) { if (!res.ok) setMsg(res.message); else window.location.href = afterVerified(); });
    });

    $('#register-now').addEventListener('click', function () {
      var v = email.value.trim();
      store.set({ authFlow: 'register', account: null, card: null, verified: false });
      if (v && !isExistingEmail(v)) store.set({ email: v });
    });
  }

  /* ---------- OTP (both flows) ---------- */
  function initVerify() {
    initAuthShell('forecast');
    var s = store.get(), email = (s.account && s.account.email) || s.email;
    if (email) $('#otp-email').textContent = email;
    $('#otp-back').href = s.authFlow === 'register' ? 'registration.html' : 'login.html';
    if (s.otpToast) { store.set({ otpToast: false }); showStatusToast('An OTP has been sent to your email ID.'); }

    var form = $('#verify-form'), otp = $$('.otp-box', form), row = $('.otp-row', form), msg = $('#otp-message');
    function setMsg(t, good) {
      msg.textContent = t || ''; msg.hidden = !t; msg.classList.toggle('is-ok', !!good);
      if (good || !t) row.removeAttribute('aria-invalid'); else row.setAttribute('aria-invalid', 'true');
    }
    otp.forEach(function (inp, i) {
      inp.addEventListener('input', function () { inp.value = inp.value.replace(/\D/g, '').slice(0, 1); if (!msg.hidden && !msg.classList.contains('is-ok')) setMsg(''); if (inp.value && otp[i + 1]) otp[i + 1].focus(); });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !inp.value && otp[i - 1]) { otp[i - 1].focus(); otp[i - 1].value = ''; e.preventDefault(); }
        else if (e.key === 'ArrowLeft' && otp[i - 1]) otp[i - 1].focus();
        else if (e.key === 'ArrowRight' && otp[i + 1]) otp[i + 1].focus();
      });
      inp.addEventListener('paste', function (e) {
        var d = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, ''); if (!d) return;
        e.preventDefault();
        for (var j = 0; j + i < otp.length && j < d.length; j++) otp[i + j].value = d[j];
        otp[Math.min(i + d.length, otp.length - 1)].focus();
      });
    });

    var timerEl = $('#otp-timer'), countEl = $('#otp-countdown'), tick;
    function startTimer(sentAt) {
      clearInterval(tick); timerEl.classList.remove('is-expired');
      function update() {
        var left = Math.max(0, OTP_TTL_SECONDS - Math.floor((Date.now() - sentAt) / 1000));
        countEl.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
        if (!left) { clearInterval(tick); timerEl.classList.add('is-expired'); timerEl.firstChild.textContent = 'OTP expired '; setMsg('This code has expired. Select Resend OTP to get a new one.'); }
        else if (timerEl.firstChild.textContent !== 'OTP expires in ') timerEl.firstChild.textContent = 'OTP expires in ';
      }
      update(); tick = setInterval(update, 1000);
    }
    if (!s.otpSentAt) store.set({ otpSentAt: Date.now() });
    startTimer(store.get().otpSentAt);

    var resend = $('#resend-code');
    resend.addEventListener('click', function () {
      resend.disabled = true;
      api.sendVerificationCode(email).then(function () {
        var now = Date.now(); store.set({ otpSentAt: now }); startTimer(now);
        otp.forEach(function (x) { x.value = ''; }); otp[0].focus(); setMsg('');
        showStatusToast('An OTP has been sent to your email ID.');
        setTimeout(function () { resend.disabled = false; }, 30000);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (timerEl.classList.contains('is-expired')) { setMsg('This code has expired. Select Resend OTP to get a new one.'); return; }
      var code = otp.map(function (x) { return x.value; }).join('');
      if (code.length !== 6) { setMsg('Enter all 6 digits of the OTP.'); var em = otp.filter(function (x) { return !x.value; })[0]; if (em) em.focus(); return; }
      var btn = $('button[type="submit"]', form);
      setLoading(btn, true, 'Validating\u2026');
      api.verifyCode(email, code).then(function (res) {
        setLoading(btn, false);
        if (!res.ok) { setMsg(res.message || 'That OTP didn\u2019t match. Check the email and try again.'); otp[0].focus(); return; }
        clearInterval(tick);
        store.set({ verified: true });
        window.location.href = afterVerified();
      });
    });
    otp[0].focus({ preventScroll: true });
  }

  /* Demo seeding for previewing in-app pages directly (?demo=1) */
  function seedDemo() {
    if (!params().has('demo')) return;
    var s = store.get();
    if (!s.account) store.set({ email: DEMO_EXISTING_EMAILS[0], verified: true, account: { name: DEMO_ACCOUNT.name, business: DEMO_ACCOUNT.business, email: DEMO_EXISTING_EMAILS[0] } });
    if (!store.cart().length && !(s.purchased || []).length) store.set({ cart: ['zipschedules', 'zip-digital-signage'] });
    if (params().get('demo') === 'card' && !s.card) store.set({ card: Object.assign({ name: DEMO_ACCOUNT.name, billing: {} }, DEMO_CARD) });
  }

  /* ---------- Payment Modes ---------- */
  function initPaymentModes() {
    seedDemo();
    function render() {
      var s = store.get(), card = s.card;
      renderCard(card);
      $('#card-empty').hidden = !!card;
      $('#card-saved').hidden = !card;
      $('#payment-alert').hidden = !!card;
      document.body.classList.toggle('has-alert', !card);
      $('#add-card-label').textContent = card ? 'Update' : 'Add';
      $('#continue-subscribe').hidden = !(card && store.hasItems());
    }
    function openCheckout() {
      payments.open({
        amount: store.totals().due,
        onSuccess: function (card) {
          api.saveCard(card).then(function () {
            store.set({ card: card });
            if (store.hasItems()) window.location.href = 'confirm.html';
            else { render(); $('#saved-title').setAttribute('tabindex', '-1'); $('#saved-title').focus(); }
          });
        }
      });
    }
    $('#add-card').addEventListener('click', openCheckout);
    var emptyAdd = $('#empty-add'); if (emptyAdd) emptyAdd.addEventListener('click', openCheckout);
    render();
    if (params().has('edit')) openCheckout();
  }

  /* ---------- Confirm (Payment Method) ---------- */
  function initConfirm() {
    seedDemo();
    var s = store.get();
    if (!s.card) { window.location.replace('payment-modes.html' + window.location.search); return; }
    if (params().has('already')) {   // demo: try to buy an app the account already owns
      var own = s.purchased || [];
      if (own.length) store.set({ cart: [own[0]] }); else store.set({ purchased: store.cart().slice(0, 1) });
    }
    renderCard(s.card);

    var cart = store.cart();
    var crumb = $('[data-crumb-app]');
    var lines = store.hwLines(), names = cart.map(function (id) { return product(id).name; }).concat(lines.map(function (l) { return l.p.name; }));
    crumb.textContent = !names.length ? 'Apps' : (names.length === 1 ? names[0] : names[0] + ' +' + (names.length - 1) + ' more');
    $('#confirm-rows').innerHTML = cart.map(function (id) {
      var p = product(id);
      return '<div class="sub-summary__row"><dt><img class="sub-summary__icon" src="' + esc(p.image) + '" alt="" width="32" height="32" loading="lazy">' + esc(p.name) +
        '<span class="sub-summary__meta">Monthly subscription</span></dt><dd>' + fmt(p.price) + '<span class="sub-summary__per">/mo</span></dd></div>';
    }).join('') + lines.map(function (l) {
      return '<div class="sub-summary__row"><dt><img class="sub-summary__icon sub-summary__icon--hw" src="' + esc(l.p.image) + '" alt="" width="32" height="32" loading="lazy">' + esc(l.p.name) + ' &times;' + l.qty +
        '<span class="sub-summary__meta">Hardware, one-time (' + fmt(l.p.price) + ' each)</span></dt><dd>' + fmt(l.total) + '</dd></div>';
    }).join('');
    if (!store.hasItems()) $('#confirm-rows').innerHTML = '<div class="sub-summary__row"><dt>Nothing selected. <a class="link-btn" href="products.html">Browse apps and hardware</a></dt></div>';
    var tt = store.totals();
    $('#confirm-total').textContent = fmt(tt.due);
    if (tt.monthly && tt.hardware) $('#confirm-total-note').textContent = 'Includes ' + fmt(tt.hardware) + ' one-time hardware; then ' + fmt(tt.monthly) + '/mo';
    var btn = $('#confirm-btn');
    btn.disabled = !store.hasItems();

    var toast = $('#toast'), timer;
    function showToast(text) {
      $('#toast-text').textContent = text; toast.hidden = false;
      clearTimeout(timer); timer = setTimeout(function () { toast.hidden = true; }, 6000);
    }
    $('#toast-close').addEventListener('click', function () { toast.hidden = true; btn.focus(); });

    btn.addEventListener('click', function () {
      var ids = store.cart(), hwOrder = store.hw();
      setLoading(btn, true, 'Confirming\u2026');
      // PRODUCTION: send hwOrder ({ id: qty }) with the order so hardware ships to the business address
      api.subscribe(ids, hwOrder).then(function (res) {
        setLoading(btn, false);
        if (!res.ok) { showToast(res.message || 'We couldn\u2019t complete the subscription. Try again.'); return; }
        var owned = (store.get().purchased || []).concat(ids);
        var ownedHw = Object.assign({}, store.get().ownedHardware || {});
        Object.keys(hwOrder).forEach(function (id) { ownedHw[id] = (ownedHw[id] || 0) + hwOrder[id]; });
        store.set({ purchased: owned, ownedHardware: ownedHw, cart: [], hardware: {}, lastOrder: res.orderId });
        $('#message-title').textContent = 'You have successfully subscribed your site(s).';
        $('#message-text').textContent = 'Please configure your app or tell your manager to configure it.';
        openDialog($('#message-dialog'), '#message-ok');
        $('#message-ok').onclick = function () { window.location.href = 'manage.html' + (ids[0] ? '?app=' + encodeURIComponent(ids[0]) : ''); };
      });
    });
  }

  /* ---------- Manage Account ---------- */
  function initAccount() {
    var s = store.get();
    var signedIn = isSignedIn();
    $('#acct-signedout').hidden = signedIn;
    $('#acct-content').hidden = !signedIn;
    if (!signedIn) return;
    $('#acct-business').textContent = (s.account && s.account.business) || '\u2014';
    renderCard(s.card);
    $('#acct-card-on-file').hidden = !s.card;
    $('#acct-no-card').hidden = !!s.card;
    if (s.card) $('#acct-card-brand').textContent = BRAND_LABEL[s.card.brand] || 'Card';
    var owned = (s.purchased || []).filter(product);
    $('#acct-apps').innerHTML = owned.map(function (id) {
      var p = product(id);
      return '<li class="acct-app"><img class="acct-app__icon" src="' + esc(p.image) + '" alt="" width="44" height="44" loading="lazy">' +
        '<div class="acct-app__info"><p class="acct-app__name">' + esc(p.name) + '</p><p class="acct-app__meta">' + esc(p.label || '') + ' &middot; ' + fmt(p.price) + '/mo</p></div>' +
        '<span class="status-pill status-pill--active">Active</span>' +
        '<a class="btn btn--ghost btn--sm" href="manage.html?app=' + encodeURIComponent(id) + '">Manage<span class="sr-only"> ' + esc(p.name) + '</span></a></li>';
    }).join('');
    $('#acct-apps-empty').hidden = owned.length > 0;
    $('#acct-monthly').textContent = fmt(subtotal(owned)) + '/mo';
    if (window.location.hash === '#apps') $('#apps').focus({ preventScroll: false });
  }

  /* ---------- Manage ---------- */
  function initManage() {
    seedDemo();
    var focusId = params().get('app'), target = null;
    var tiers = $('#tiers'), plan = PLANS[0];

    function ownedApps() { return (store.get().purchased || []).filter(product); }

    function render() {
      var apps = ownedApps();
      var hw = store.get().ownedHardware || {};
      var hwIds = HARDWARE.filter(function (x) { return hw[x.id]; });
      // Nothing owned yet: offer the app from the link (or ZipSchedules) to subscribe
      var showing = apps.length ? apps : [(product(focusId) || product(BASE_PRODUCT)).id];

      var names = apps.map(function (id) { return product(id).name; });
      var title = apps.length > 1 ? apps.length + ' apps' : product(showing[0]).name;
      $('#manage-title').innerHTML = 'Manage (<span data-app-name>' + esc(title) + '</span>)';
      document.title = 'Manage (' + title + ') | My Apps';
      var crumb = $('[data-crumb-app]');
      if (crumb) crumb.textContent = apps.length > 1 ? names[0] + ' +' + (apps.length - 1) + ' more' : product(showing[0]).name;

      var sum = $('#manage-summary');
      sum.hidden = !apps.length;
      sum.innerHTML = '<strong>' + apps.length + (apps.length === 1 ? ' app' : ' apps') + '</strong> &middot; ' + fmt(subtotal(apps)) + '/month' +
        (hwIds.length ? ' &middot; ' + hwIds.reduce(function (n, x) { return n + hw[x.id]; }, 0) + ' hardware ' + (hwIds.length === 1 && hw[hwIds[0].id] === 1 ? 'device' : 'devices') : '');

      tiers.innerHTML = showing.map(function (id) {
        var p = product(id), subscribed = apps.indexOf(id) !== -1;
        var price = plan.price != null ? plan.price : p.price;
        return '<section class="tier' + (subscribed ? ' tier--current' : '') + (id === focusId ? ' tier--focus' : '') + '" id="app-' + id + '" aria-labelledby="tier-' + id + '" tabindex="-1">' +
          '<div class="tier__head"><img class="tier__icon" src="' + esc(p.image) + '" alt="" width="56" height="56">' +
          '<p class="tier__app">' + esc(p.name) + '</p><h2 class="tier__name" id="tier-' + id + '">' + esc(plan.name) + ' plan</h2>' +
          '<p class="tier__price"><span class="tier__amount">' + (price % 1 ? price.toFixed(2) : price) + '</span><span class="tier__per">/month</span></p></div>' +
          '<div class="tier__body">' + (subscribed
            ? '<button type="button" class="btn btn--unsub" data-unsub="' + id + '" aria-label="Unsubscribe from ' + esc(p.name) + '">Unsubscribe ' + ICON_CHECKC + '</button><p class="tier__status">Current plan</p>'
            : '<button type="button" class="btn btn--primary btn--pill" data-sub="' + id + '">Subscribe</button><p class="tier__status">Not subscribed</p>') +
          '</div></section>';
      }).join('');
      $('#manage-empty').hidden = true;

      $('#owned-hw').hidden = !hwIds.length;
      $('#owned-hw-list').innerHTML = hwIds.map(function (x) {
        return '<li class="owned-hw__item"><span class="owned-hw__media"><img src="' + esc(x.image) + '" alt="" width="64" height="64" loading="lazy"></span>' +
          '<div class="owned-hw__info"><p class="owned-hw__name">' + esc(x.name) + '</p><p class="owned-hw__meta">' + esc(x.type) + ' &middot; Qty ' + hw[x.id] + ' &middot; ' + fmt(x.price * hw[x.id]) + ' one-time</p></div>' +
          '<span class="status-pill status-pill--active">Ordered</span></li>';
      }).join('');
    }

    tiers.addEventListener('click', function (e) {
      var u = e.target.closest('[data-unsub]'), sb = e.target.closest('[data-sub]');
      if (u) {
        target = u.getAttribute('data-unsub');
        $$('[data-unsub-name]').forEach(function (el) { el.textContent = product(target).name; });
        openDialog($('#confirm-dialog'), '[data-close-dialog]');
      }
      if (sb) {
        store.set({ cart: [sb.getAttribute('data-sub')] });
        window.location.href = store.get().card ? 'confirm.html' : 'payment-modes.html';
      }
    });
    $('#confirm-unsubscribe').addEventListener('click', function () {
      var b = this, id = target;
      if (!id) return;
      setLoading(b, true, 'Unsubscribing\u2026');
      api.unsubscribe(id).then(function () {
        setLoading(b, false);
        closeDialog($('#confirm-dialog'), true);
        store.set({ purchased: (store.get().purchased || []).filter(function (x) { return x !== id; }) });
        render();
        $('#message-title').textContent = 'You have successfully unsubscribed from ' + product(id).name + '.';
        $('#message-text').textContent = 'You can subscribe again at any time.';
        openDialog($('#message-dialog'), '#message-ok');
      });
    });
    $('#message-ok').addEventListener('click', function () { closeDialog($('#message-dialog')); var f = $('[data-sub], [data-unsub]', tiers); if (f) f.focus(); });
    render();
    var focusCard = focusId && $('#app-' + focusId);
    if (focusCard && ownedApps().length > 1) focusCard.scrollIntoView({ block: 'nearest' });
  }

  /* 7. Boot ------------------------------------------------------------------ */
  /* Images: swap in a branded fallback panel if a remote image fails to load */
  function markFailed(img) {
    var wrap = img.closest('[data-media]');
    if (wrap) wrap.classList.add('is-failed'); else img.classList.add('is-failed');
  }
  document.addEventListener('error', function (e) { if (e.target && e.target.tagName === 'IMG') markFailed(e.target); }, true);

  document.addEventListener('DOMContentLoaded', function () {
    $$('img').forEach(function (img) { if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markFailed(img); });
    wireProfile(); wireDemoTips(); showFlash();
    wireDialogs(); wireNavToggle(); wireAppsMenu();
    var page = document.body.getAttribute('data-page');
    ({ landing: initLanding, signup: initSignup, catalog: initCatalog, registration: initRegistration, login: initLogin, verify: initVerify,
       'payment-modes': initPaymentModes, confirm: initConfirm, manage: initManage, account: initAccount }[page] || function () {})();
  });

  window.ZipFlow = { api: api, payments: payments, store: store, catalog: CATALOG, hardware: HARDWARE, plans: PLANS };
})();

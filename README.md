# ZipSchedules × Altametrics purchase flow — v16

## What changed in v16
- **Existing customers who log in with email + password skip the OTP screen.** Login → straight to **Confirm**
  with the saved card (or Payment Modes if no card, Manage if the cart is empty), with a "Signed in as Test User."
  message.
- **Verify via Email** (passwordless) still uses the OTP screen, since the emailed code is the sign-in.



## What changed in v15
- **New customers verify on the registration page.** After **Continue**, the same page switches to step 3
  **Verify Your Account** (stepper: Choose apps ✓, Create account ✓, Verify email): "Please enter the 6-digit code
  sent to <email>", six code boxes (auto-advance, paste, backspace), "Didn't get a code? Resend Code" (30 s throttle),
  **Back to cart** and **Verify**. Verify → Payment Modes to add a card, then Confirm and Manage.
  Reloading the page mid-verification keeps the customer on step 3.
- **Existing customers** (test@altametrics.com) keep the sign-in style OTP page (`verify.html`).



## What changed in v14
- **Manage page shows every purchase.** One plan card per subscribed app (each with its own Unsubscribe), a summary
  line ("3 apps · $93.99/month · 3 hardware devices") and a **Hardware** section listing the devices you bought
  (photo, type, quantity, one-time total, "Ordered"). The title and breadcrumb follow: "Manage (3 apps)",
  "ZipSchedules +2 more". `manage.html?app=<id>` still works and highlights that app's card.
- **Unsubscribe** asks about the specific app ("Unsubscribe from Zip Clock?") and removes just that card.
- **Purchased hardware is kept** after Confirm (`ownedHardware: { id: qty }` in the store, added up across orders).
  PRODUCTION: load apps and hardware orders from your account API instead.



## What changed in v13

**Two paths decided by the email address** (demo rule in `app.js`: `DEMO_EXISTING_EMAILS`)
- **Existing customer** — `test@altametrics.com`: email page → **Sign in** (any password in the demo) →
  **Confirm** with the saved card (Test User, Visa ending 1111) → Manage. (Verify via Email adds an OTP step.)
- **New customer** — any other email: email page → **Registration** (email prefilled) → OTP on the same page (step 3) → **Payment Modes**
  (add a card in the Forte popup) → Confirm → Manage.
- **Guards:** signing in or "Verify via Email" with an unknown email shows *No account found… Register now*;
  registering with the test email shows *An account already exists… Sign in instead*.
- **Demo tip** under the email field (email page) and above Email ID (sign-in) explains the test email, with a
  **Use this email** button. Set `DEMO_MODE = false` to hide it before launch.
- In production, `api.checkEmail`, `api.signIn` and `api.registerAccount` call your backend instead of the demo rule.

**Navigation**
- **Logo → home page** on every page, including the sign-in/OTP pages and the in-app bar (Payment Modes, Confirm,
  Manage, Account). The settings gear opens Manage Account.
- **New `account.html` (Manage Account):** profile, card on file, monthly total, and your apps with Manage links.
  Shows a sign-in / register prompt when signed out.
- **Breadcrumbs all work:** Manage Account → `account.html`, Billing & Subscription → `payment-modes.html`,
  Apps → `account.html#apps`. The Payment Modes crumb now reads "Payment Modes". Manage's Close returns to My apps.
- **Profile menu** (profile icon / initials): name and email, My account, My apps, Payment Modes, **Log out**.
  Also shown on the products and email pages while signed in. Log out clears the session (keeps the theme) and
  returns home with a "You've been signed out." message.

**Card popup without validation (demo only)**
- No card-number, expiry, CVV or billing checks; Next / Authorize always proceed. Blank card fields become a demo
  Visa ending 1111 (exp 08/2029); blank billing fields use the account's name, business and email.
- Forte's hosted checkout replaces this popup in production and validates cards itself.



## What changed in v12
Same v5 flow and integration points (sign-in, OTP, saved-card confirm, "already purchased" toast); new UI and hardware:

- **Visual refresh on every page** (palette: blue `#1554d1`, navy `#0b1d3a`): landing with Altametrics imagery and real
  customer testimonials; email page with dashboard showcase, testimonial and customer logos; registration in the approved
  mockup design (logo, "get started." accent, Your order with per-app icons, POS photo); modern Payment Modes (card visual,
  illustrated empty state), Confirm (app artwork in the summary) and Manage (plan artwork + "Get more from Altametrics").
- **Sign-in and OTP pages**: Altametrics logo tile on the card, refreshed blue, and **real photos in the product slides**
  (Plum display for Digital Signage, Zip Tunes player, AI forecasting, workforce and kitchen-ops images).
- **Plum POS hardware on the products page** with your product photos, a **Hardware** tab, type filters with counts,
  and a − / qty / + stepper (also in the order summary). Hardware is one-time; apps stay monthly.
- **Totals everywhere** (products, email page, registration recap, Forte authorize amount, confirm page):
  Total due today = apps + hardware, then the monthly amount. Hardware is sent with the order: `api.subscribe(ids, hardwareQty)`.
- **"Already purchased"** toast and "Subscribed" ribbons still work alongside hardware.

### Before launch
- Hardware prices are placeholders with an "Est." tag: set real prices in `HARDWARE`, then `HARDWARE_PRICES_FINAL = true`.
- Confirm the Zip Tunes Player copy; add KDS and Time Clock photos; hardware shipping/tax aren't calculated yet.
- `assets/img/registration-staff.jpg` and `altametrics-mark.png` are cropped from the mockup; replace with originals.
- Move altametrics.com images to your own CDN.


Static HTML/CSS/JS, no framework or build step. Open `index.html` and click **Buy Now** to walk the whole flow.

## Flow

**Returning customer (main path)**

| # | Page | Next |
|---|------|------|
| 1 | `index.html` landing | **Buy Now** → `products.html` |
| 2 | `products.html` add apps | **Continue to checkout** → `signup.html` |
| 3 | `signup.html` email + cart | **Continue** → `login.html` |
| 4 | `login.html` **new** sign-in (email prefilled) | **Login** or **Verify via Email** → `verify.html` |
| 5 | `verify.html` **new layout** OTP + "An OTP has been sent" toast | **Validate** → `confirm.html` |
| 6 | `confirm.html` saved card prefilled | **Confirm** → Payment Message → `manage.html` |

**New customer:** `login.html` **Register Now** → `registration.html` → `verify.html` → `payment-modes.html`
(add card via Forte) → `confirm.html` → `manage.html`.

Preview in-app pages directly:
`payment-modes.html?demo=1` (account + cart, no card) · `confirm.html?demo=card` (card on file) ·
`confirm.html?demo=card&already=1` (already-purchased toast) · `payment-modes.html?edit=1` (opens checkout).

## What changed in v5

- **New `login.html`** (sign-in). Sign-in / QR Code tabs, email prefilled from the email page, password with
  show/hide, Verify via Email (passwordless OTP), Remember Me, Forgot Password and Login with Phone links,
  Login with Passkey with an info tip, and Need an Account? Register Now.
- **`verify.html` redesigned** to the same shell as sign-in: "Everything you need to run your restaurant",
  product carousel with a product tab bar (Digital Signage, TIP Pool & Share, Tunes, AI Forecast, Prep & Pull),
  personalised-demo bar, QR card. A green "An OTP has been sent to your email ID." toast shows on arrival and resend.
  The v4 announcement bar is gone.
- **After OTP, returning customers go straight to `confirm.html`** with their saved card, so they only approve
  the payment. `api.signIn` returns the account, saved card and existing subscriptions.

## What changed in v4

- **New `verify.html`** (Image 9). Announcement ticker with language picker and a working dark-mode toggle;
  product showcase carousel (Zip Tunes content from the design; other apps get a short slide from `CATALOG`)
  with prev/next arrows and the bottom "Get a personalised demo" dock; OTP card with a live expiry countdown
  (`OTP_TTL_SECONDS`, default 10:00), Resend OTP (throttled to 30 s), Back and Validate; QR / app-store card.
  Registration no longer has an inline verify step.
- **Products page "already purchased" message** now matches Image 5: red toast, top right,
  "The product is already purchased." with a **Manage** link (the app name is in its accessible label).

## "Already subscribed" message

If the account already has an app and the user tries to subscribe to it again:
- **Buy Now** on the landing page (or an owned app already in the cart) → the products page opens with the red
  "The product is already purchased." toast and a **Manage** link. The app is kept out of the cart.
- **Add** on an owned app's card → the same toast. Owned cards carry a green "Subscribed" corner ribbon and a
  "Subscribed" button.
- **Confirm** on the confirm page (if a duplicate slips through) → the red toast now names the app.

Owned apps come from `store.purchased`. In production, load them from `api.getSubscriptions()` for signed-in
users, and have `api.subscribe` return `code: 'ALREADY_PURCHASED'` as the server-side backstop.

## Files

```
index.html, signup.html, products.html, registration.html      public / funnel pages
payment-modes.html, confirm.html, manage.html                   in-app pages (My Apps shell)
assets/css/style.css    tokens at the top; one section per page; v3 sections at the end
assets/js/app.js        state, catalog, validation, Forte adapter, API stubs
```

## Where to connect the backend (assets/js/app.js)

- **`api.*`** — `checkEmail`, `registerAccount`, `sendVerificationCode`, `verifyCode`, `saveCard`,
  `subscribe` (return `{ ok:false, code:'ALREADY_PURCHASED' }` to show the toast), `unsubscribe`.
- **`payments.open({ amount, onSuccess })`** — the Forte checkout adapter (see below).
- **`CATALOG`** and **`PLANS`** — products and Manage-page plan tiers.
- **`store`** — flow state in `sessionStorage` (`zs_flow_v3`). Card numbers and CVV are never stored;
  only the Forte token, brand, last 4, expiry and billing address.

### Forte checkout — important
The three modals (Payment method → Billing information → Authorize, with the dark
"Powered by CSG Forte Payments, Inc." bar) are **Forte's hosted checkout UI**. In production Forte renders
them, not your page. They're rebuilt in `payment-modes.html` only so the flow can be demoed and QA'd.
To go live, replace the mock inside `payments.open` with Forte's checkout launch and call
`onSuccess({ token, brand, last4, expMonth, expYear, name, billing })` from Forte's success callback.
Keeping card entry inside Forte is what keeps you out of PCI DSS SAQ D scope.

## Decisions I made (change if needed)

1. **Order of screens 2–3.** Products first, then the email page (Buy Now → products → checkout → email →
   registration). The email page's cart also has **Add more apps**, which returns to products.
2. **One in-app shell.** The designs use two different app headers (dark "My Apps" bar vs an "ALta Growth"
   nav on Manage). All in-app pages use the dark "My Apps" bar, which appears on most screens.
3. **Subscription summary on the confirm page.** The design asks the customer to confirm without showing
   what they're buying or the amount. I added a small summary (apps + total) inside Card Details.
4. **Payment Message wording.** The design's "subscribed/unsubscribed" is split into the two real cases,
   keeping the design's phrasing.
5. **Unsubscribe** asks for confirmation first (the design goes straight to the message).
6. **Manage plan grid.** The design reserves slots for "Standard" and "51+ Employees" tiers with no content;
   only "Professional" renders. Add tiers in `PLANS`. Its price uses the app's catalog price, not the
   design's "55", which didn't match the cart.

## Open questions (v5)

- **Sample sign-in data.** `api.signIn` is a stub that returns "Jordan Lee" with a Visa ending 1111.
  Replace it with your auth endpoint.
- **Routing after email.** Everyone goes to sign-in, per the flow; new customers use Register Now. To route
  automatically, use `api.checkEmail` (one line in `initSignup`).
- **Showcase slides.** Copy for Digital Signage, AI Forecast and Tunes is from the designs. TIP Pool & Share and
  Prep & Pull need copy, or pass a finished banner as `{ image, alt }` in `SHOWCASE`.
- **Passkey, Login with Phone, Forgot Password, QR sign-in** are wired as hooks (`api.signInWithPasskey`, links)
  and need your auth service.
- **Logos.** The Altametrics Growth logo and product tab logos are text stand-ins; swap in the SVGs.

## Open questions (v4)

- **Showcase content.** Only Zip Tunes has headline/features/"Why Choose Us" copy (from the design). Add the
  other apps to `SHOWCASE` in app.js, plus hero photos (`photo`). The announcement text is a placeholder
  completed from the truncated design ("…Now live: BI Rep…").
- **Product photos on the products page.** Image 5 shows photo banners, but every photo is "ZIP TUNES" art,
  so I kept the app icons. Send per-app photos and they can go in.
- **Where account details are collected.** The new verify screen follows the existing registration form.
  If you want OTP before the details form, swap the two links.
- **QR code** and app-store links are placeholders.

## Open questions (earlier)

- **Merchant name** in the Forte header: the designs show both "HUBWORKS, LLC" and "Altametrics LLC"
  (`MERCHANT_NAME`). Forte shows whatever is configured on the merchant account.
- **Authorization text** says "one-time electronic payment", but the charges are monthly. Confirm with legal/Forte.
- **"Adding credit card info will not initiate your billing"** vs the Authorize step showing the cart amount —
  confirm whether Authorize is a $0 card verification or a real charge.
- **Phone numbers differ:** sign-up page shows 800-993-8756 (from the design); funnel header shows
  (800) 676-1281 (from altametrics.com). Pick one.
- **Compliance seals** (PCI DSS / CompliAssure) are placeholders. Only display seals you're certified for,
  using the official artwork from your assessor or Forte.
- **Marketing consent** is bundled into the sign-up Continue button. Confirm this is acceptable in your markets.
- **Sample personal data** in the designs (name, email, phone, card) was replaced with neutral placeholders.
- Carry-overs from v2: completed product descriptions, Zip Tunes artwork, category mapping, customer logos.

## Breakpoints
1440 / 1280 desktop, 1024 tablet-landscape, 768 tablet, 375 mobile. Forte modals open as bottom sheets on phones.
Respects `prefers-reduced-motion`.

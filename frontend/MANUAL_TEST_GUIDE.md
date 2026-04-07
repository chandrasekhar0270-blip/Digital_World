# 🧪 Digital World — Frontend Manual Test Guide

## Prerequisites

Before testing, ensure:

```bash
# 1. Install dependencies
cd digital-world
npm install

# 2. Verify .env.local has these keys
cat .env.local
# Required:
#   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
#   CLERK_SECRET_KEY=sk_test_...
#   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
#   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
#   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
#   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# 3. Start the dev server
npm run dev
# Should see: ✓ Ready on http://localhost:3000
```

---

## TEST 1 — Root Page Redirect (`/`)

**Route:** `http://localhost:3000/`
**Component:** `app/page.tsx`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1  | Open `http://localhost:3000` in an incognito window | Loading spinner appears briefly |
| 1.2  | Wait 1–2 seconds | Redirects to `/sign-in` (because not authenticated) |
| 1.3  | Sign in, then visit `http://localhost:3000` again | Redirects to `/dashboard` |

**What to look for:**
- Spinner animation is smooth (no jank)
- No console errors about `useAuth` or `ClerkProvider`

---

## TEST 2 — Sign-In Page (`/sign-in`)

**Route:** `http://localhost:3000/sign-in`
**Component:** `app/sign-in/[[...sign-in]]/page.tsx`
**Styles:** `signin.module.css`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1  | Navigate to `/sign-in` | Page loads with DW logo, "Digital World" title, Clerk sign-in form |
| 2.2  | Observe animations | Logo slides up first, form follows with stagger delay |
| 2.3  | Check background | Two floating orbs visible (subtle blue + amber gradients) |
| 2.4  | Check Clerk form styling | Dark card background, amber primary button, custom input focus ring |
| 2.5  | Click "Create one" link at bottom | Navigates to `/sign-up` |
| 2.6  | Enter valid credentials and submit | Redirects to `/dashboard` |
| 2.7  | Enter invalid credentials | Clerk shows error inline (styled with dark theme) |
| 2.8  | Resize to mobile (< 440px) | Form stays centered, no horizontal overflow |

**What to look for:**
- Clerk components inherit the dark theme (no white flash)
- Amber button hover state works (slightly lifts)
- Input focus shows amber glow ring

---

## TEST 3 — Sign-Up Page (`/sign-up`)

**Route:** `http://localhost:3000/sign-up`
**Component:** `app/sign-up/[[...sign-up]]/page.tsx`
**Styles:** `signup.module.css`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1  | Navigate to `/sign-up` | Page loads with "Join Digital World" heading |
| 3.2  | Verify subtitle reads | "Work · Money · Health — all in one place" |
| 3.3  | Check orb colors | Green + rose tinted (different from sign-in) |
| 3.4  | Click "Sign in" footer link | Navigates to `/sign-in` |
| 3.5  | Complete sign-up flow | Creates account, redirects to `/dashboard` |

---

## TEST 4 — Dashboard (`/dashboard`)

**Route:** `http://localhost:3000/dashboard`
**Component:** `app/dashboard/page.tsx`
**Styles:** `dashboard.module.css`

### 4A — Auth Guard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 4A.1 | Visit `/dashboard` in incognito (not signed in) | Redirects to `/sign-in` |
| 4A.2 | Sign in, then visit `/dashboard` | Dashboard loads normally |

### 4B — Header
| Step | Action | Expected Result |
|------|--------|-----------------|
| 4B.1 | Check header left side | DW logo badge + "Digital World" text |
| 4B.2 | Check header right side | Clerk UserButton (avatar circle) |
| 4B.3 | Click UserButton | Dropdown with sign-out option |
| 4B.4 | Scroll the page down | Header stays sticky at top with blur background |

### 4C — Hero Section
| Step | Action | Expected Result |
|------|--------|-----------------|
| 4C.1 | Check greeting | "Welcome back, {FirstName}" with amber gradient on name |
| 4C.2 | Check subtitle | "Your Life OS dashboard…" text in muted color |
| 4C.3 | Verify first name source | Matches Clerk account first name |

### 4D — Product Cards
| Step | Action | Expected Result |
|------|--------|-----------------|
| 4D.1 | Count cards | 3 cards in a row: Work, Money, Health |
| 4D.2 | Hover over Health card | Card lifts, border turns rose, top accent bar appears |
| 4D.3 | Hover over Work card | Disabled state — no hover effect, opacity reduced |
| 4D.4 | Check badges | Health = "Active" (green), Work/Money = "Coming Soon" (gray) |
| 4D.5 | Click Health card | Navigates to `/health` |
| 4D.6 | Click Work card | Nothing happens (disabled) |
| 4D.7 | Verify card taglines | Work: "Project Management", Money: "Financial Twin", Health: "Fitness Coach · RunPulse" |
| 4D.8 | Resize to mobile | Cards stack vertically (1 column) |

### 4E — Stats Bar
| Step | Action | Expected Result |
|------|--------|-----------------|
| 4E.1 | Scroll to bottom | Stats bar shows: 3 Modules · 1 Active · ∞ Potential |
| 4E.2 | Check styling | Values in amber, labels uppercase muted text |

---

## TEST 5 — Global Styles & Theme

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1  | Check body background | Deep navy (#0a0e1a) with subtle radial gradient overlay |
| 5.2  | Check all text | Light text on dark background, no white-on-white |
| 5.3  | Open DevTools → Console | No CSS warnings, no missing font errors |
| 5.4  | Check Network tab for fonts | `DM Sans` and `Syne` loaded from Google Fonts |
| 5.5  | Check link styling | All links are amber, hover brightens |

---

## TEST 6 — API Client Library Verification

The `lib/api.ts` file doesn't run standalone but you can verify it loads:

```bash
# From the project root, check TypeScript compiles
npx tsc --noEmit lib/api.ts 2>&1 | head -20

# Or check in browser console (after page loads):
# Open DevTools → Console → type:
import('/lib/api.ts')
# Should not throw (module resolution check)
```

**Quick curl tests** (these hit the Next.js API routes, which need FastAPI backends running):

```bash
# Test projects endpoint (expects 401 without auth, which is correct)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/projects
# Expected: 401 (auth required — Clerk middleware working)

# Test fitness endpoint
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/fitness
# Expected: 401

# Test finance endpoint
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/finance
# Expected: 401
```

If you get `401`, that confirms Clerk middleware is correctly protecting API routes.

---

## TEST 7 — Layout & ClerkProvider

| Step | Action | Expected Result |
|------|--------|-----------------|
| 7.1  | View page source | `<html lang="en">` present |
| 7.2  | Check `<head>` | Google Fonts preconnect links present |
| 7.3  | Check title in browser tab | "Digital World — Life OS" |
| 7.4  | Navigate between pages | No full-page reload (Next.js client navigation) |

---

## TEST 8 — Middleware Auth Protection

```bash
# These routes should redirect to /sign-in when not authenticated:
curl -s -o /dev/null -w "%{http_code}\n%{redirect_url}" http://localhost:3000/dashboard
# Expected: 307 redirect to /sign-in

curl -s -o /dev/null -w "%{http_code}\n%{redirect_url}" http://localhost:3000/health
# Expected: 307 redirect to /sign-in

# These routes should be publicly accessible:
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/sign-in
# Expected: 200

curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/sign-up
# Expected: 200
```

---

## ✅ Test Completion Checklist

```
[ ] TEST 1 — Root redirect works both ways
[ ] TEST 2 — Sign-in page renders, Clerk form styled, auth works
[ ] TEST 3 — Sign-up page renders, links work
[ ] TEST 4A — Dashboard auth guard active
[ ] TEST 4B — Header sticky, UserButton works
[ ] TEST 4C — Greeting personalized
[ ] TEST 4D — Cards hover/click/disable correctly
[ ] TEST 4E — Stats bar renders
[ ] TEST 5 — Theme consistent, fonts loaded
[ ] TEST 6 — API routes return 401 without auth
[ ] TEST 7 — Layout metadata correct
[ ] TEST 8 — Middleware protects private routes
```

---

## 🐛 Common Issues & Fixes

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| White flash on Clerk forms | Missing CSS overrides in globals.css | Verify `.cl-card` background override |
| "Missing ClerkProvider" error | `layout.tsx` not wrapping with `<ClerkProvider>` | Check `app/layout.tsx` |
| 404 on `/sign-in` | Folder structure wrong | Must be `app/sign-in/[[...sign-in]]/page.tsx` |
| Fonts not loading | Network/CSP blocking Google Fonts | Check DevTools Network tab |
| Cards not animating | CSS `slide-up` class missing | Verify `globals.css` has `@keyframes slideUp` |
| Dashboard shows spinner forever | Clerk keys invalid/missing | Check `.env.local` keys match Clerk dashboard |
| `axios` not found | Missing dependency | Run `npm install axios` |

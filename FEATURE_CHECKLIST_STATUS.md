# WrapQuote MVP Feature Checklist Status

## ✅ COMPLETE Items

### 1️⃣ Core Product Flow
- ✅ Single-page calculator flow (`/app`)
- ✅ Mobile-first responsive layout (works on phone + desktop)
- ✅ Time to value under 60 seconds
- ✅ No dashboards or multi-step wizards
- ✅ Clear defaults prefilled

### 2️⃣ Job Type Selection (Critical)
- ✅ Job type selector exists with options:
  - ✅ Print + Install (default)
  - ✅ Print Only
  - ✅ Install Only
- ✅ Job type visibly labeled in quote summary
- ✅ Job type affects calculations correctly

### 3️⃣ Vehicle + Wrap Selection - ✅ **NOW COMPLETE**
- ✅ Vehicle bucket selector (no year/make/model)
- ✅ Wrap type selector
- ✅ Vehicle buckets implemented:
  - ✅ compact sedan
  - ✅ midsize sedan
  - ✅ fullsize sedan
  - ✅ compact SUV
  - ✅ midsize SUV
  - ✅ fullsize SUV
  - ✅ pickup short bed
  - ✅ pickup long bed
  - ✅ cargo van
  - ✅ sprinter van
  - ✅ box truck small (12–16 ft)
  - ✅ box truck large (20–26 ft)
  - ✅ coupe, hatchback, motorcycle, commercial_van, commercial_truck, semi
- ✅ Wrap types implemented:
  - ✅ full wrap
  - ✅ partial wrap
  - ✅ commercial sides
  - ✅ hood
  - ✅ roof
  - ✅ trunk
  - ✅ decals (basic)
  - ✅ decals (complex)
- ✅ **Bonus Feature**: Exclude roof from full wrap option

### 4️⃣ Material Calculator (Deterministic)
- ✅ Base sqft pulled from lookup table
- ✅ Waste buffer % (default 15%, user editable)
- ✅ Complexity toggles implemented:
  - ✅ mirrors
  - ✅ roof_rails
  - ✅ rivets
  - ✅ deep_recesses
- ✅ Complexity adds waste % AND labor hours
- ✅ Adjusted sqft formula: `base_sqft × (1 + waste + complexity)`
- ✅ Roll width selector (54" or 60")
- ✅ Linear feet calculation: `adjusted_sqft / (roll_width / 12)` rounded UP
- ✅ Minimum linear-feet floors enforced:
  - ✅ full wrap ≥ 50 lf
  - ✅ partial ≥ 25 lf
  - ✅ commercial sides ≥ 30 lf
  - ✅ hood / roof ≥ 10 lf
- ✅ Material estimate updates instantly
- ✅ Subtle disclaimer displayed

### 5️⃣ Labor Calculation
- ✅ Base labor hours pulled from table
- ✅ Complexity hours added correctly
- ✅ Labor hour floors enforced:
  - ✅ full wrap ≥ 12 hrs
  - ✅ partial ≥ 6 hrs
  - ✅ commercial sides ≥ 8 hrs
  - ✅ decals ≥ 1 hr (decals_basic ≥ 0.5 hr, decals_complex ≥ 1 hr)
- ✅ Labor hours editable by user

### 6️⃣ Print Logic (Job-Type Dependent)
- ✅ Print costs hidden for Install Only
- ✅ Labor inputs hidden for Print Only
- ✅ Material cost logic:
  - ✅ Install Only → material cost = 0
  - ✅ Print Only / Print + Install → calculated
- ✅ Labor cost logic:
  - ✅ Print Only → labor cost = 0
  - ✅ Install / Print + Install → calculated

### 7️⃣ Pricing Calculator
- ✅ Vinyl cost per linear foot input
- ✅ Print cost per sqft (optional)
- ✅ Lamination cost per sqft (optional)
- ✅ Design fee (optional flat) - Default $400
- ✅ Labor rate per hour
- ✅ Overhead / supplies flat fee
- ✅ Pricing mode selector:
  - ✅ margin %
  - ✅ markup %
- ✅ Margin formula: `subtotal / (1 − margin)`
- ✅ Markup formula: `subtotal × (1 + markup)`
- ✅ Guardrails:
  - ✅ margin ≤ 70%
  - ✅ markup ≤ 300%
- ✅ Profit dollars calculated
- ✅ Profit margin calculated
- ✅ Deposit % optional
- ✅ Quick Quote view (pricing summary displayed)
- ⚠️ Itemized view toggle - **PARTIAL** (itemized view always visible, no toggle button - but all pricing details are shown)

### 8️⃣ AI Pricing Confidence (Advisory Only)
- ✅ "Check Pricing Confidence" button exists
- ✅ Server route `/api/ai/confidence`
- ✅ AI input includes:
  - ✅ job type
  - ✅ adjusted sqft
  - ✅ linear feet
  - ✅ labor hours
  - ✅ labor rate
  - ✅ material cost
  - ✅ retail price
  - ✅ profit margin
  - ✅ effective hourly rate (calculated in API)
- ✅ AI output STRICT JSON only:
  - ✅ SAFE / AGGRESSIVE / RISKY
  - ✅ exactly 3 short reasons
  - ✅ suggested adjustments array
- ✅ AI never outputs a "correct price"
- ✅ Invalid AI responses handled safely
- ✅ Free tier limited to 3 total checks

### 12️⃣ Auth + Demo Mode
- ✅ Supabase auth implemented (email/password + Google OAuth ready)
- ✅ Logged-out demo mode works
- ✅ Logged-out users cannot:
  - ✅ save presets
  - ✅ save quotes
  - ✅ export
- ✅ Free tier feature limits enforced

### 14️⃣ UX Quality Bar
- ✅ Calculator updates instantly (no reload)
- ✅ Clean typography (Inter font, proper sizing)
- ✅ Clear warnings instead of blocking errors
- ✅ Works on iPhone width (mobile-first responsive)
- ✅ No dead UI states

### 15️⃣ Dev / Ops
- ✅ Env vars documented in README
- ✅ Calculator logic written as pure functions
- ✅ Unit tests for formulas (`lib/calculators.test.ts` - 31 tests passing)
- ✅ Vercel deploy ready

---

## ⚠️ PARTIAL / NEEDS WORK

### 7️⃣ Pricing Calculator
- ⚠️ **Itemized view toggle** - Itemized pricing is always visible, but there's no toggle to switch between "Quick Quote" and "Itemized View" modes

### 9️⃣ Quotes

**Database & Save - ✅ COMPLETE:**
- ✅ Quotes can be saved (Pro+)
- ✅ Quote includes all required fields (job type, vehicle, wrap, sqft, pricing, etc.)

**UI Pages - ❌ MISSING:**
- ❌ Quote list page (`/app/quotes`) - **DOES NOT EXIST**
- ❌ Quote detail view - **DOES NOT EXIST**
- ✅ Save functionality works on main calculator page

### 🔟 Export / Print

**Current Implementation:**
- ✅ Export gated to Pro+
- ✅ Text file export (`.txt` format)
- ✅ Quote clearly labeled with job type

**Missing:**
- ❌ Print-to-PDF export - **NOT IMPLEMENTED** (only text export)
- ❌ Shop plan logo + contact info on export - **NOT IMPLEMENTED**

### 1️⃣1️⃣ Presets

**Database - ✅ COMPLETE:**
- ✅ Database schema exists (`presets` table)
- ✅ RLS policies in place

**UI - ❌ MISSING:**
- ❌ Save pricing presets UI - **NOT IMPLEMENTED**
- ❌ Load preset into calculator - **NOT IMPLEMENTED**
- ❌ Preset management interface - **NOT IMPLEMENTED**

### 1️⃣3️⃣ Monetization

**Checkout - ✅ COMPLETE:**
- ✅ Stripe checkout implemented (`/api/stripe/create-checkout`)
- ✅ Webhooks sync subscription status (`/api/stripe/webhook`)
- ✅ Plans implemented: Free, Pro ($29), Shop ($59)
- ✅ Feature gating by plan

**Customer Portal - ❌ MISSING:**
- ❌ Stripe customer portal - **NOT IMPLEMENTED**
- ⚠️ Users cannot manage/cancel subscriptions in-app

---

## Summary

**✅ Fully Complete:** 1, 2, 3, 4, 5, 6, 8, 12, 14, 15

**⚠️ Partial:**
- **7️⃣ Pricing Calculator:** Itemized view always visible (no toggle, but all details shown)

**❌ Missing Features:**
1. **9️⃣ Quotes:** Quote list page and detail view
2. **🔟 Export:** PDF export with shop branding
3. **1️⃣1️⃣ Presets:** Save/load preset UI
4. **1️⃣3️⃣ Monetization:** Stripe customer portal for subscription management

**Overall MVP Readiness: ~82%**

**Completed Since Last Check:**
- ✅ Feature #3 (Vehicle + Wrap Selection) - Fully implemented with all required vehicle buckets and wrap types, plus bonus exclude roof feature

**Remaining Work:**
1. Quote management pages (list/detail views)
2. PDF export with shop branding for Shop tier
3. Preset save/load UI
4. Customer portal for subscription management
5. Itemized view toggle (optional enhancement)

Core calculator functionality is solid and production-ready. The remaining items are primarily UI/UX features for managing saved data and subscriptions.

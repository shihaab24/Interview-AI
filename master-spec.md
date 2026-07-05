# Master Product & Engineering Specification
## Interview Strategy Application — UX Completeness & Bug Remediation

---

## How to Use This Document

This is a single specification covering two areas of the application that are being improved in the same pass:

- **Section A** — Reports Dashboard (title bug + Recent Reports carousel)
- **Section B** — Interview Strategy Generation Form (input, upload, validation, feedback)
- **Section C** — General engineering constraints that apply to *all* work in this spec

Implement Section A and Section B as independent workstreams — they touch different components and should not be conflated in commits, PRs, or reasoning. Section C applies globally to both.

Before writing any code, read **Section C: Discovery Checklist** and report back your findings. Do not guess at file names, existing libraries, or conventions — locate them first.

---

# SECTION A — Reports Dashboard & Recent Reports Carousel

## A.0 Objective

Fix the root cause of reports displaying "Untitled Position" for every entry, and upgrade the "My Recent Interview Plans" list into a proper horizontally-scrollable card carousel.

## A.1 Bug: Report Title Always Undefined

### Current Behavior
Every report card renders the fallback text "Untitled Position," including `report.title || 'Untitled Position'` on the frontend. This means `title` is `undefined` or missing at the data layer — this is a backend/data-generation bug, not a rendering bug.

### Investigation Steps (required before fixing)
1. Locate the report/interview-plan schema (Mongoose model or equivalent). Confirm whether a `title` field is defined, and whether it has a default value or is required.
2. Locate the controller/service that creates a report record after a strategy is generated. Check whether `title` is ever assigned before `.save()`/`.create()`.
3. Locate the AI generation call/prompt that produces the interview strategy. Determine whether it currently returns structured JSON, and if so, what fields it includes.

### Fix Requirements
- Extend the AI generation prompt/schema to also return a `title` (or `jobTitle`) field in the same structured response used to build the strategy — do not add a second API call just for the title.
- Title derivation priority:
  1. If a Target Job Description was provided, extract/derive the job title or position name from it.
  2. If no Job Description was provided (resume and/or self-description only), derive a reasonable title from the inferred role (e.g., "Frontend Developer Interview Prep") rather than leaving it blank.
- Persist this value into the `title` field on save.
- Update every place in the codebase that reads or writes `report.title` (list view, detail view, API response types/interfaces, any TypeScript types) so the field name is consistent everywhere — do a full-repo check, not a single-file patch.
- Frontend fallback chain stays as defense-in-depth: `report.title || report.jobTitle || 'Untitled Position'`. Never render the literal string `"undefined"`.

### Existing Data
Reports already in the database will still show "Untitled Position" — this is acceptable and does not require a backfill/migration unless you explicitly ask for one. **Do not write or run a migration script against production data without separate, explicit confirmation.**

---

## A.2 Recent Reports Carousel

### Current Behavior
`reports.map()` renders a plain unstyled `<ul>`/`<li>` list with no layout constraints and no scroll behavior.

### Target Behavior

**Card styling**
- Convert each `<li>` into a card matching the existing card visual language already used elsewhere in the app (check for existing `.card`-style classes/tokens before creating new CSS — reuse border-radius, shadow, border, and spacing values already defined).
- Keep all existing card content and behavior unchanged: title, "Generated on" date, color-coded match score, and click-to-navigate to the report detail page.

**Layout**
- Cards render in a single horizontal row inside a scrollable container.
- Exactly **4 cards fully visible** at a time in the viewport — size card widths and gaps so 4 fit cleanly (not 3.8 or 4.3).
- Native horizontal scroll/swipe (touch, trackpad, keyboard) must keep working — do not intercept or `preventDefault` on scroll events.

**Scroll Controls**
- If `reports.length > 4`:
  - Show a **right arrow button**, vertically centered at the edge of the container, styled consistently with existing icon buttons in the app (reuse the project's existing icon library — do not add a new one).
  - Clicking scrolls right by one "page" (4 cards' width) with smooth scrolling.
  - A **left arrow button** appears once the container has scrolled away from the start, and disappears again when scrolled back to the start.
  - The right arrow disappears/disables when the container reaches the scroll end.
- If `reports.length <= 4`: no arrows render at all, and no scroll container behavior is needed beyond normal layout.

**Implementation Notes**
- Do not introduce a carousel library (e.g., Swiper, Slick) unless one is already a project dependency. Implement with a ref-based scrollable flex/grid container and `scrollTo`/`scrollBy`, tracking scroll position via an `onScroll` handler or `scrollLeft`/`scrollWidth`/`clientWidth` comparisons.
- Preserve existing click-to-navigate, hover, and focus behavior on each card — only the container/layout is changing.

### A.2 Acceptance Criteria
- [ ] New reports show a real, derived title — never "undefined" or a blank string.
- [ ] Exactly 4 cards visible at once; remaining cards reachable via scroll.
- [ ] Right arrow appears only when there are more than 4 reports; scrolls smoothly.
- [ ] Left arrow appears only after scrolling away from the start; hides at the start.
- [ ] Existing navigation, hover states, and match-score color coding are unchanged.
- [ ] No new colors, fonts, or spacing values introduced — everything reuses existing tokens.

---

# SECTION B — Interview Strategy Generation Form UX

## B.0 Objective

Improve usability, responsiveness, feedback, and polish on the Interview Strategy generation form, without changing existing architecture, API contracts, or visual identity.

## B.1 Job Description Character Counter

- Character counter must update live on every keystroke, reflecting the actual current length of the textarea value.
- Maximum: 5000 characters. Prevent typing/pasting beyond the limit (truncate pasted content that would exceed it, don't silently reject the paste).
- **Warning threshold: counter changes to the existing warning color once the input reaches 4,500/5,000 characters (i.e., the final 10%).** Reuse whatever warning/caution color variable already exists in the design system — do not introduce a new color.
- Counter must stay in sync if the textarea value is ever changed programmatically (e.g., cleared via a "reset form" action), not just via direct typing.

## B.2 Resume Upload Experience

### Before Upload
Keep the existing upload placeholder UI.

### While Processing
Immediately after file selection:
- Disable the file input.
- Show a loading spinner/progress indicator.
- Update button/label text to "Uploading Resume..." or "Processing Resume..." (pick one and use it consistently).

### After Successful Selection
Replace the placeholder with a resume summary card showing:
- PDF file-type icon
- File name
- File size
- A success indicator
- Upload timestamp (optional)

Provide three actions: **View Resume**, **Replace Resume**, **Remove Resume**.

### Resume Preview ("View Resume")
**Recommended approach:** before implementing, check the project's existing dependencies and patterns:
- If the app already opens PDFs elsewhere (e.g., an existing modal/viewer component, or `<iframe>`/`<embed>` usage), reuse that exact pattern for consistency.
- If nothing exists yet, the lowest-footprint option is opening the file in a new browser tab via its URL/blob (`window.open`) or a simple `<iframe>` inside an existing modal component already used elsewhere in the app for other content.
- **Do not add a new PDF-rendering library (e.g., `react-pdf`, `pdf.js` wrapper) unless the project already depends on one.** A new heavy dependency for a single preview action is disproportionate to the feature.
- State your chosen approach and why, based on what you find in the codebase, before implementing.

### Replace Resume
- Selecting a new file replaces the previous one, updates filename/preview, clears prior upload state, and preserves all other form field values (Job Description, Self-Description, etc.).

### Remove Resume
- Reverts the upload component to its initial empty state and disables the preview action.

### Validation
- Accept only `.pdf` files. Reject others with a toast error (see Section B.4).
- Enforce the application's existing max file size limit (locate this value if it already exists elsewhere, e.g., a multer config or similar; do not invent a new limit). Show a clear toast if exceeded — never fail silently.

## B.3 Generate Button State Management

**Disabled state:** Generate is disabled when *both* Resume and Self-Description are empty (at least one is required — see B.5 for behavior when both are present).

**Loading state:** while generation is in progress:
- Disable the button.
- Replace label text with "Generating Strategy..." and show a spinner.
- Prevent duplicate submissions (ignore additional clicks/Enter presses until the in-flight request resolves).

**After completion:** restore the button to its normal enabled state and default label.

## B.4 Client-Side Validation & Toasts

Validation must run before any API request, in this order:

1. **Input presence:** Resume OR Self-Description must be provided (whitespace-only strings count as empty — trim before checking). If neither exists, show: *"Please upload a resume or provide a self-description before generating your interview strategy."*
2. **Job Description required:** if empty or whitespace-only, show: *"Please enter the target job description."*
3. **Duplicate-submission guard:** ignore new submit attempts while a request is already in flight (this should be enforced both by the disabled button state in B.3 and defensively in the submit handler itself, in case it's triggered another way).

### Toast System — Fallback Strategy
- **If a toast/notification library is already a project dependency, reuse it.** Do not add a second one.
- **If no toast library exists in the project**, before adding a new dependency, check for the lightest viable option consistent with the existing stack (e.g., if the project already uses a UI kit like Radix, shadcn/ui, or Chakra, prefer that ecosystem's toast/notification primitive over an unrelated third-party package). If truly nothing fits, a minimal custom toast component (a small fixed-position container + auto-dismiss timeout, styled with existing design tokens) is preferable to pulling in a new dependency for this alone.
- State which path you took and why.

**Toast types and example copy:**
- Success: "Resume uploaded successfully." / "Interview strategy generated successfully."
- Error: "Please upload a PDF file." / "Target Job Description is required." / "Failed to upload resume." / "Unable to generate interview strategy."
- Info: "Resume replaced successfully."

## B.5 Behavior When Both Resume and Self-Description Are Provided

If the user provides **both** a Resume and a Self-Description:
- **Both must be sent to the AI and used together** when generating the strategy — do not silently discard or deprioritize either one.
- Combine them in the prompt/payload sent to the generation service (e.g., resume as structured/extracted content, self-description as supplementary context the user wants emphasized — such as recent focus areas, career pivots, or things not evident from the resume alone).
- **Exception:** if there is a genuine technical constraint (e.g., token/length limits on the AI call that make sending both in full impractical), truncate or summarize the lower-priority input rather than dropping it entirely, and note this constraint explicitly in your implementation report — do not make this decision silently.

## B.6 Feedback Coverage

Every user action in this form must produce visible feedback — no action should leave the user unsure whether something happened:

| Action | Feedback |
|---|---|
| Uploading | Spinner / loading state |
| Generating | Loading button state |
| Validation error | Toast |
| Success | Toast |
| Failure | Toast |
| Resume selected | Visual confirmation (summary card) |
| Resume replaced | Visual confirmation + info toast |

## B.7 Accessibility
- Full keyboard navigation and visible focus states on all interactive elements (upload button, textarea, generate button, arrow buttons from Section A).
- Proper `<label>` associations and `aria-*` attributes on the upload control and form fields.
- Screen-reader-friendly announcements for upload state changes (e.g., `aria-live` region for "Uploading..." → "Upload complete").

## B.8 Responsive Behavior
- All new/changed UI (character counter, resume summary card, toasts, carousel from Section A) must work cleanly on desktop, tablet, and mobile breakpoints already defined in the project.
- No layout shift, overflow, or broken spacing at any breakpoint.

---

# SECTION C — General Engineering Constraints (Apply to All Work)

## C.1 Discovery Checklist (complete and report back before coding)
- [ ] Component(s) responsible for the Interview Generation form.
- [ ] Component(s) responsible for the Reports Dashboard / Recent Reports list.
- [ ] State management approach currently used (local state, context, Redux, React Query, etc.).
- [ ] Report schema/model definition and where reports are created/saved.
- [ ] The AI generation call — current prompt/schema, and whether it returns structured JSON.
- [ ] Existing resume upload flow and file-size limit configuration.
- [ ] Existing toast/notification library, if any.
- [ ] Existing icon library used for buttons/arrows elsewhere in the app.
- [ ] Existing card component styles/design tokens (colors, spacing, radius, shadows).
- [ ] Existing modal/preview pattern, if any (for resume preview reuse).

## C.2 Do Not
- Refactor unrelated pages, routes, or components.
- Change authentication flow.
- Change backend API contracts unless strictly required for the title fix (Section A.1) or validation consistency (Section B.4) — and if so, state exactly what changed and why.
- Change existing design tokens, typography, spacing scale, colors, or introduce a new design language.
- Introduce a second toast library, carousel library, or PDF viewer library if a suitable one already exists in the project.
- Duplicate validation logic — extract shared helpers where the same check is used in more than one place.
- Use inline styles; keep styling consistent with the project's existing method (CSS modules, styled-components, Tailwind, etc. — whichever is already in use).

## C.3 Preserve
- Existing report generation flow, routing, authentication, and backend integration.
- Existing responsive breakpoints and behavior.
- Existing naming conventions and file/folder structure.
- Existing card click-to-navigate and hover/focus behavior in the Reports Dashboard.

## C.4 Required Deliverables After Implementation

Provide a written summary covering:
1. Files modified (Section A and Section B listed separately).
2. Root cause identified for the title bug, and exactly how it was fixed.
3. Carousel implementation approach (library-free vs. library used, and why).
4. Toast library decision (reused existing / added minimal fallback / other) and reasoning.
5. Resume preview approach chosen and why.
6. Confirmation of how both Resume + Self-Description are combined when both are present, and any truncation/technical limitation encountered.
7. Validation rules implemented.
8. Loading/disabled states introduced.
9. Responsive testing notes (breakpoints checked).
10. Any assumptions made or open questions for follow-up.

---

# SECTION D — Branding, Landing Page, and Auth Screens (Login / Register)

## D.0 Objective

The application currently has no landing page — visitors land directly on functional but unstyled Login/Register screens. This section introduces a product name and a proper landing page, and restyles the auth screens to match the rest of the application's dark theme, without changing any authentication logic, routes, or backend behavior.

**Product name: PrepPilot**

Use this name consistently across the landing page hero, page `<title>`/meta tags, and anywhere the app currently has a placeholder or generic heading (e.g., browser tab title, any header/nav logo text). Do not rename backend services, database names, environment variables, or repo/package names — this is a UI-facing brand name only, not a codebase rename.

## D.1 Discovery (required before implementing this section)
- [ ] Locate the current routing setup for `/`, `/login`, and `/register` (or equivalent paths) to confirm whether a landing page route exists at all, or whether `/` currently redirects straight to Login.
- [ ] Locate the Login and Register components/pages and their associated stylesheets.
- [ ] Locate the existing accent/brand color used elsewhere in the app (visible in the "Generate My Interview Strategy" button and the "Register"/"Login" links in the screenshots — a pink/magenta tone). Confirm its exact variable name and hex value in the SCSS files rather than guessing a new one.
- [ ] Confirm the existing font stack/typography variables already defined (headings, body text) so the landing page and auth screens don't introduce new fonts.
- [ ] Check whether a favicon/browser tab title is currently set, and where (`index.html` or equivalent).

## D.2 Landing Page

### Requirements
- Add a proper landing/marketing page at the root route (`/`), shown to unauthenticated visitors before they reach Login/Register. If a landing page route doesn't exist yet, create one; do not just add content on top of the existing Login page.
- Structure:
  - **Hero section:** Product name ("PrepPilot"), a short one-line tagline describing the value proposition (e.g., resume + job description in, personalized interview strategy and match score out), and two calls to action: "Login" and "Get Started" / "Register."
  - **Feature highlights section:** 3–4 short feature blocks describing what the product does — e.g., resume + JD analysis, AI-generated interview strategy, match score, personalized prep roadmap. Use simple icon + short heading + one-line description per block. Reuse the app's existing inline-SVG icon approach (no new icon library — consistent with Section C.2 findings).
  - **Footer:** reuse whatever footer content/links already exist elsewhere in the app (Privacy Policy, Terms of Service, Help Center, as seen in the current dashboard footer) for consistency, rather than inventing new footer content.
- Visual style must use the existing dark theme tokens exactly as found in discovery — do not introduce a new palette:
  - Background: existing `$bg-page` value
  - Cards/panels: existing `$bg-card` / `$bg-panel` values
  - Borders: existing border color/style
  - Accent color: the existing pink/magenta accent already used for primary actions and links — reuse it for the landing page's CTA buttons and any highlighted text, don't invent a new accent.
- Fully responsive — hero and feature blocks must reflow cleanly on mobile (stacked) and desktop (row/grid), matching the responsiveness standard already used elsewhere in the app (Section B.8).

### Acceptance Criteria
- [ ] Visiting `/` as an unauthenticated user shows the new landing page, not the Login form directly.
- [ ] "Login" and "Get Started"/"Register" CTAs route to the correct existing auth pages — no changes to the auth routes themselves.
- [ ] All colors, fonts, spacing, and border-radius values are reused from existing SCSS variables — nothing new introduced.
- [ ] Page `<title>` reads "PrepPilot" (or "PrepPilot — [tagline]") instead of any generic/default title.

## D.3 Login & Register Screens — Restyle

### Current State (per screenshots)
Both screens are functionally complete (email/password fields, submit button, cross-link to the other screen) but visually bare: plain labels and inputs with no card container, no branding, and default browser-adjacent spacing on a plain black background.

### Target Style
- Wrap the form in a card matching the app's existing card style (background, border, border-radius, shadow — same tokens identified in Section A.2/D.1) instead of floating bare on the page background.
- Add the "PrepPilot" name/logo above the form heading (small wordmark or styled text, consistent with landing page branding), so Login/Register don't feel like a disconnected, unbranded step.
- Restyle inputs to match the app's existing input styling used elsewhere (the Job Description/Self-Description textareas, or any other existing input fields) — consistent border color, background, padding, border-radius, and focus state (existing focus ring/outline color, not browser default).
- Restyle the primary submit button ("Login" / "Register") to use the existing primary-button style (the same pink/magenta accent used on "Generate My Interview Strategy"), replacing the current plain gray button.
- Keep the "Don't have an account? Register" / "Already have an account? Login" cross-links exactly as they are functionally, just restyle the link color to match the existing accent (already close, per the screenshots — confirm it matches the same variable rather than a hardcoded similar-looking color).
- Add basic field-level validation styling consistent with the rest of the app's validation approach (Section B.4/B.6) — e.g., empty-field or invalid-email states should give visible feedback using the same toast system (or inline error state) already implemented for the generation form, rather than introducing a separate validation pattern.
- Maintain full responsiveness — form card should center and resize cleanly on mobile without overflow.

### Explicitly Out of Scope
- Do not change the authentication logic, API calls, token handling, or redirect behavior.
- Do not add new fields to Login/Register (e.g., no "remember me," no OAuth/social login) unless separately requested.
- Do not change validation rules for what constitutes a valid email/password server-side — only the visual presentation and client-side feedback layer.

### Acceptance Criteria
- [ ] Login and Register both render inside a styled card matching the app's existing visual language.
- [ ] "PrepPilot" branding is visible on both screens.
- [ ] Inputs, buttons, and links reuse existing design tokens — no new colors introduced.
- [ ] Existing auth functionality (submit, redirect, cross-navigation) is completely unchanged.
- [ ] Both screens are responsive on mobile and desktop.

## D.4 Deliverables (add to the Section C.4 report)
- Confirmation of the accent/brand color variable reused (name + hex).
- Whether a landing page route already existed or was newly created.
- Files modified for the landing page and for Login/Register restyling, listed separately.
- Confirmation that auth logic/routes were not touched — only presentation layer.

---

This specification is intended to bring the Reports Dashboard, Interview Generation Form, and first-impression branding/auth experience to production quality — correct data, clear feedback, consistent visual identity, and polished interaction — while leaving the rest of the application's architecture, styling, and behavior untouched.
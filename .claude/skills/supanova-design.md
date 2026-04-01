# Supanova Design Skill Collection

# Source: https://github.com/uxjoseph/supanova-design-skill
# This file combines all four skills from the repository:
# 1. taste-skill (Supanova Design Engine)
# 2. redesign-skill (Supanova Redesign Engine)
# 3. soft-skill (Supanova Premium Aesthetic)
# 4. output-skill (Supanova Full-Output)

---

---
name: supanova-design-engine
description: Supanova Landing Page Design Engine. Generates premium, conversion-optimized landing pages using pure HTML + Tailwind CSS (CDN). Overrides default LLM biases toward generic templates. Enforces metric-based design rules, Korean typography standards, and hardware-accelerated motion for standalone HTML output.
---

# Supanova Design Engine

## 1. ACTIVE BASELINE CONFIGURATION
* DESIGN_VARIANCE: 8 (1=Perfect Symmetry, 10=Artsy Chaos)
* MOTION_INTENSITY: 6 (1=Static/No movement, 10=Cinematic/Magic Physics)
* VISUAL_DENSITY: 3 (1=Art Gallery/Airy, 10=Pilot Cockpit/Packed Data)
* LANDING_PURPOSE: conversion (conversion | brand | portfolio | saas | ecommerce)

**AI Instruction:** The standard baseline for all generations is strictly set to these values (8, 6, 3, conversion). Do not ask the user to edit this file. ALWAYS listen to the user: adapt these values dynamically based on what they explicitly request in their prompts. Use these baseline (or user-overridden) values as your global variables to drive the specific logic in Sections 3 through 8.

## 2. DEFAULT ARCHITECTURE & CONVENTIONS
All output is **standalone HTML** designed for direct browser rendering. No build tools, no bundlers, no frameworks.

* **Output Format:** Single HTML file with all styles and scripts inline. The page must work by simply opening the file in a browser.
* **Styling:** Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com"></script>`). Use the `tailwind.config` script block for custom theme extensions (colors, fonts, spacing).
* **Typography — Korean First:**
  * **Primary Font:** `Pretendard` via CDN (`https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css`). This is NON-NEGOTIABLE for Korean text rendering.
  * **English Display Font:** Pair with `Geist`, `Outfit`, `Cabinet Grotesk`, or `Satoshi` for English headlines. Load via Google Fonts CDN or self-hosted link.
  * **Font Stack:** `font-family: 'Pretendard', 'Geist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;`
* **Icons:** Use Iconify with Solar icon set exclusively. Load via `<script src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js"></script>`. Usage: `<iconify-icon icon="solar:arrow-right-linear"></iconify-icon>`.
* **Images:** Use `https://picsum.photos/seed/{descriptive_name}/{width}/{height}` for all placeholder images. NEVER use Unsplash URLs (they break). For avatars, use `https://i.pravatar.cc/150?u={unique_name}`.
* **Animation Library:** For `MOTION_INTENSITY > 5`, include `<script src="https://unpkg.com/motion@latest/dist/motion.js"></script>` (Motion One — lightweight, standalone). For simpler animations, use pure CSS `@keyframes` and Tailwind's `animate-` utilities.
* **ANTI-EMOJI POLICY [CRITICAL]:** NEVER use emojis in markup or visible text content. Replace with Iconify Solar icons or clean SVG primitives.
* **Responsiveness:**
  * Standardize breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
  * Contain page layouts using `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
  * **Viewport Stability [CRITICAL]:** NEVER use `h-screen`. ALWAYS use `min-h-[100dvh]` to prevent layout jumping on iOS Safari.
  * **Grid over Flex-Math:** Use CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`) instead of complex flexbox percentage calculations.
* **Language:** Default content language is **Korean**. All placeholder text, headings, descriptions, and CTAs must be written in natural, professional Korean — not translated-sounding text.

## 3. DESIGN ENGINEERING DIRECTIVES (Bias Correction)
LLMs have statistical biases toward specific UI cliches. These rules produce premium landing pages:

**Rule 1: Deterministic Typography**
* **Korean Headlines:** `text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight font-bold`. Pretendard handles Korean beautifully at these sizes.
  * **CRITICAL:** Korean text requires `leading-tight` to `leading-snug` (NOT `leading-none`). Korean characters need more vertical breathing room than Latin text.
  * **Word Breaking:** Always add `word-break: keep-all` (`break-keep-all` in Tailwind) to Korean text blocks to prevent mid-word line breaks.
* **English Display Text:** Use `tracking-tighter leading-none` for maximum impact with Latin fonts.
* **Body/Paragraphs:** `text-base md:text-lg text-gray-600 leading-relaxed max-w-[65ch]`.
* **ANTI-SLOP FONTS:** `Inter` is BANNED. `Noto Sans KR` is BANNED (use Pretendard instead — it's the modern Korean standard). `Roboto`, `Arial`, `Open Sans` are all BANNED.

**Rule 2: Color Calibration**
* **Constraint:** Max 1 Accent Color per page. Saturation < 80%.
* **THE LILA BAN:** Purple/Blue "AI" gradients are strictly BANNED. No neon glows, no purple button effects.
* **Supanova Palette Philosophy:** Use deep neutral bases (Zinc-900, Slate-950, Stone-100) with ONE high-contrast accent (Emerald, Electric Blue, Warm Amber, or Deep Rose).
* **COLOR CONSISTENCY:** One palette for the entire page. Never mix warm and cool grays.
* **Dark Mode Default:** Landing pages look more premium in dark mode. Default to dark backgrounds (`bg-zinc-950`, `bg-slate-950`) unless the content demands light.

**Rule 3: Landing Page Layout Diversification**
* **ANTI-CENTER BIAS:** When `DESIGN_VARIANCE > 4`, centered Hero sections are BANNED. Use:
  * **Split Screen** (50/50 text + visual)
  * **Left-aligned content / Right-aligned asset**
  * **Asymmetric white-space** with dramatic negative space
  * **Full-bleed image with overlaid text**
* **Section Flow:** A landing page is NOT a stack of identical sections. Vary each section's layout dramatically:
  * Hero → Features (Bento Grid) → Social Proof (Testimonial Masonry) → CTA (Full-bleed)
  * Every adjacent section must use a DIFFERENT layout pattern.

**Rule 4: Materiality and Depth**
* Use cards ONLY when elevation communicates hierarchy. When shadows are needed, tint them to the background hue.
* **Glass Effects:** Go beyond `backdrop-blur`. Add `border border-white/10` and `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]` for physical edge refraction.
* **Grain Texture:** Add a subtle noise overlay via fixed `pointer-events-none` pseudo-element for organic, non-digital feel.

**Rule 5: Conversion-Driven UI States**
* **CTA Buttons:** Must have hover (`scale-[1.02]`), active (`scale-[0.98]`), and focus states. Minimum size `px-8 py-4 text-lg`.
* **Social Proof:** Numbers must feel organic (`47,200+` not `50,000+`). Use real-sounding Korean names and companies.
* **Trust Signals:** Include at least one of: client logos, testimonial quotes, metrics bar, press mentions.
* **Urgency Elements (if conversion):** Subtle countdown, limited spots indicator, or "currently viewing" social proof.

**Rule 6: Korean Content Standards**
* **NO Translated Korean:** Write native, natural Korean. "지금 시작하세요" not "시작을 하세요 지금".
* **Honorifics:** Use 합니다/하세요 form consistently. Never mix 반말 and 존댓말.
* **CTA Copy:** Direct, action-oriented: "무료로 시작하기", "3분만에 만들어보기", "지금 바로 체험하기"
* **Avoid Korean AI Cliches:** "혁신적인", "획기적인", "차세대" are BANNED. Use concrete, specific language.

## 4. CREATIVE PROACTIVITY (Anti-Generic Implementation)
Systematically implement these high-end patterns as your baseline:

* **"Liquid Glass" Refraction:** Beyond `backdrop-blur-xl`. Layer `border border-white/10`, `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`, and a subtle `bg-white/5` for true depth.
* **Magnetic CTA Buttons:** Use CSS `transform` on hover with `transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1)`. Add directional arrow icons that shift on hover.
* **Staggered Reveals:** Sections fade in sequentially using CSS `animation-delay` cascades. Use `@keyframes fadeInUp { from { opacity: 0; transform: translateY(2rem); } to { opacity: 1; transform: translateY(0); } }` with `animation-delay: calc(var(--index) * 100ms)`.
* **Floating Elements:** Subtle infinite float animations on decorative elements: `@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }`.
* **Gradient Mesh Backgrounds:** Use multiple `radial-gradient` layers for organic, blob-like ambient backgrounds instead of flat solid colors.
* **Scroll-Triggered Animations (MOTION_INTENSITY > 6):** Use `IntersectionObserver` for viewport-based reveals. NEVER use `window.addEventListener('scroll')`.

## 5. PERFORMANCE GUARDRAILS
* **DOM Cost:** Grain/noise filters go on `position: fixed; inset: 0; z-index: 50; pointer-events: none` elements ONLY. Never on scrolling containers.
* **Hardware Acceleration:** Animate ONLY `transform` and `opacity`. Never animate `top`, `left`, `width`, `height`.
* **Image Optimization:** Use `loading="lazy"` on all images below the fold. Use `decoding="async"` on all images.
* **CDN Weight:** Total external CDN scripts should not exceed 5. Tailwind CDN + Iconify + (optional) Motion One is the maximum baseline.
* **Z-Index Restraint:** Use z-indexes only for: sticky nav (`z-40`), overlays (`z-50`), noise texture (`z-[60]`).

## 6. LANDING PAGE SECTION LIBRARY
Do not default to generic layouts. Pull from this library of premium landing page patterns:

### Hero Sections
* **Split Hero:** 60/40 text-to-visual split. Text left, product screenshot or 3D render right. Background gradient bleed.
* **Full-Bleed Media Hero:** Full-screen image/video with overlaid text. Dark gradient overlay from bottom. CTA floating at bottom-center.
* **Minimal Statement Hero:** Massive typography (text-7xl+) with extreme white-space. Single-line value proposition. Floating CTA pill.
* **Interactive Hero:** Typewriter effect cycling through use cases. "AI로 __ 만들기" with rotating words.

### Feature Sections
* **Bento Grid:** Asymmetric grid (2fr 1fr 1fr pattern) with different card heights. Each card contains an icon, title, short description.
* **Zig-Zag Alternating:** Image-left/text-right → text-left/image-right pattern. Never 3-column equal cards.
* **Icon Strip:** Horizontal scrolling strip of feature icons with hover reveals.
* **Comparison Table:** "Before vs After" or "Us vs Them" with dramatic visual difference.

### Social Proof Sections
* **Logo Cloud:** Client/press logos in a subtle, auto-scrolling marquee strip. Grayscale → color on hover.
* **Testimonial Masonry:** Staggered card heights. Real Korean names, real company names. Photo avatars.
* **Metrics Bar:** Large numbers with animated counting effect. "47,200+ 페이지 생성", "4.9/5.0 만족도".
* **Case Study Cards:** Before/after screenshots with overlay descriptions.

### CTA Sections
* **Full-Bleed CTA:** Dark background, massive text, glowing accent CTA button, floating trust badges below.
* **Sticky Bottom CTA:** Fixed bottom bar that appears after scrolling past the hero.
* **Inline CTA:** Embedded within content flow, styled differently from surrounding sections.

### Footer
* **Minimal Footer:** Logo, essential links, language selector, copyright. No 4-column link farms.
* **Rich Footer:** Brief company description, key nav links, social icons, newsletter signup.

## 7. AI TELLS (Forbidden Patterns)
To guarantee premium, non-generic output:

### Visual & CSS
* **NO Neon/Outer Glows.** Use inner borders or tinted shadows instead.
* **NO Pure Black (#000000).** Use `#0a0a0a`, Zinc-950, or Slate-950.
* **NO Oversaturated Accents.** Desaturate to blend with neutrals.
* **NO Excessive Gradient Text.** One gradient text element per page maximum.

### Typography
* **NO Inter, Noto Sans KR, Roboto, Arial.** Use Pretendard + premium English fonts.
* **NO Oversized H1s without purpose.** Control hierarchy with weight and color, not just size.

### Layout
* **NO 3-Column Equal Card Rows.** Use Bento grids, zig-zag, or asymmetric layouts.
* **NO Identical Section Layouts.** Each section must have a visually distinct structure.
* **NO Edge-to-Edge Content.** Always use `max-w-7xl mx-auto` container constraints.

### Content
* **NO "John Doe" / "김철수".** Use creative, realistic Korean names: "하윤서", "박도현", "이서진".
* **NO "Acme Corp" / "넥서스".** Invent premium Korean brand names: "스텔라랩스", "베리파이", "루미너스".
* **NO Round Numbers.** Use `47,200+` not `50,000+`. Use `4.87` not `5.0`.
* **NO AI Cliche Copy.** Ban: "혁신적인", "원활한", "차세대", "게임 체인저". Write specific, concrete copy.
* **NO Lorem Ipsum or 영문 Placeholder.** All content in natural Korean.

### External Resources
* **NO Unsplash URLs.** Use `picsum.photos/seed/{name}/{w}/{h}` exclusively.
* **NO Broken CDN Links.** Verify all CDN URLs are from major, reliable providers (jsdelivr, unpkg, cdnjs, code.iconify.design).

## 8. THE SUPANOVA LANDING PAGE FORMULA
When generating a complete landing page, follow this exact structure:

### A. Document Setup
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>페이지 제목</title>
  <meta name="description" content="페이지 설명">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.min.css">
  <script src="https://code.iconify.design/iconify-icon/2.3.0/iconify-icon.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Pretendard', 'system-ui', 'sans-serif'],
          },
        },
      },
    }
  </script>
</head>
```

### B. Mandatory Section Order (Minimum)
1. **Navigation** — Floating glass pill nav OR minimal top bar
2. **Hero** — The single most impactful section. Must be above the fold.
3. **Social Proof Strip** — Logo cloud or metrics bar. Builds trust immediately.
4. **Features** — 3-5 key features in Bento grid or zig-zag layout.
5. **Testimonials** — Real-feeling Korean testimonials with names and roles.
6. **CTA** — Full-bleed conversion section with primary action.
7. **Footer** — Minimal, clean, essential links only.

### C. Design Philosophy
* **Premium by Default:** Every pixel must look intentional. If it looks like a template, it fails.
* **Korean-Native:** The page must feel like it was designed BY Koreans FOR Koreans. Not a translation.
* **Conversion-Focused:** Every section should guide the eye toward the CTA. Visual hierarchy = conversion funnel.
* **Mobile-First:** 70%+ of Korean web traffic is mobile. Design mobile-first, enhance for desktop.

## 9. FINAL PRE-FLIGHT CHECK
Evaluate against this matrix before outputting:
- [ ] Is the output a single, standalone HTML file that works in a browser?
- [ ] Is Pretendard loaded and set as the primary font?
- [ ] Are all icons using Iconify Solar set?
- [ ] Is all visible text content written in natural Korean?
- [ ] Does `word-break: keep-all` exist on Korean text blocks?
- [ ] Do full-height sections use `min-h-[100dvh]` not `h-screen`?
- [ ] Is mobile layout (`w-full`, `px-4`) guaranteed for all sections?
- [ ] Are CTA buttons large enough for mobile tap targets (min 48px height)?
- [ ] Does each section use a DIFFERENT layout pattern from its neighbors?
- [ ] Are there zero banned fonts, zero emoji, zero Unsplash links?
- [ ] Does the page feel premium, not template-like?


---

---
name: supanova-redesign-engine
description: Upgrades existing landing pages to premium quality. Audits current design for generic AI patterns and applies Supanova's high-end standards. Works with any HTML/CSS landing page — Tailwind, vanilla CSS, or inline styles.
---

# Supanova Redesign Engine

## How This Works

When applied to an existing landing page, follow this sequence:

1. **Scan** — Read the HTML/CSS. Identify the styling method, current design patterns, font stack, color palette, and layout structure.
2. **Diagnose** — Run through the audit below. Document every generic pattern, weak point, and missing element.
3. **Fix** — Apply targeted upgrades. Do not rewrite from scratch. Improve what's there while maintaining the existing structure.

## Design Audit for Landing Pages

### Typography

- **Browser default fonts, Inter, or Noto Sans KR.** Replace with Pretendard (Korean standard) + premium English display font (Geist, Outfit, Cabinet Grotesk, Satoshi).
- **Headlines lack presence.** Korean headlines need `text-4xl md:text-6xl tracking-tight leading-tight font-bold`. Tighten letter-spacing for impact.
- **Missing `word-break: keep-all` on Korean text.** Korean words break mid-character without this. Add to all Korean text blocks.
- **Body text too wide.** Constrain to ~65 characters max width. Increase `line-height` for Korean readability.
- **Only Regular and Bold weights.** Introduce Medium (500) and SemiBold (600) for hierarchy depth.
- **Numbers in proportional font.** Use `font-variant-numeric: tabular-nums` or monospace for metrics and pricing.
- **Orphaned words.** Fix with `text-wrap: balance` on headings.

### Color and Surfaces

- **Pure `#000000` background.** Replace with `#0a0a0a`, `#09090b` (zinc-950), or tinted dark.
- **Oversaturated accent colors.** Keep saturation below 80%. Desaturate to blend elegantly with neutrals.
- **Multiple accent colors competing.** Pick ONE. Remove the rest.
- **Purple/blue "AI gradient" aesthetic.** The most common AI design fingerprint. Replace with neutral bases + single considered accent.
- **Generic `box-shadow`.** Tint shadows to background hue. Dark blue shadow on blue background, not `rgba(0,0,0,0.3)`.
- **Flat design with zero texture.** Add subtle noise overlay, mesh gradient background, or micro-patterns.
- **Random dark section in a light page.** Maintain consistent background tone. Use shade variations, not dramatic jumps.
- **Empty flat sections.** Add background imagery (blurred, masked), ambient gradients, or pattern overlays.

### Layout (Landing Page Specific)

- **Everything centered and symmetrical.** Break symmetry with offset margins, mixed aspect ratios, split-screen layouts.
- **Three equal card columns for features.** The most generic AI layout. Replace with Bento grid, zig-zag alternating, or horizontal scroll.
- **Every section uses the same layout.** Adjacent sections MUST use different patterns. Hero (split) → Features (bento) → Testimonials (masonry) → CTA (full-bleed).
- **Using `height: 100vh`.** Replace with `min-height: 100dvh` for iOS Safari compatibility.
- **No max-width container.** Add `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Missing whitespace.** Double the section padding. `py-20 md:py-32` minimum for landing page sections.
- **Cards of forced equal height.** Allow variable heights or use masonry.
- **No overlap or depth.** Use negative margins, z-index layering, or overlapping elements for visual depth.
- **CTA buttons not prominent enough.** CTAs need `px-8 py-4 text-lg` minimum. Must be the most visually dominant element.

### Interactivity and States

- **No hover states on buttons.** Add `hover:scale-[1.02]`, background shift, or translate effect with smooth transition.
- **No active/pressed feedback.** Add `active:scale-[0.98]` for tactile click feel.
- **Instant transitions.** Add `transition-all duration-300 ease-out` to all interactive elements.
- **No scroll animations.** Add fade-up reveals using CSS `@keyframes` + `IntersectionObserver`.
- **No loading states for interactive elements.** Add skeleton shimmer or loading indicators.
- **Static logo strips.** Convert to auto-scrolling CSS marquee for trust logos.
- **Dead `href="#"` links.** Remove or visually disable them.
- **No smooth scroll.** Add `scroll-behavior: smooth` to `html`.

### Korean Content Quality

- **Translated-sounding Korean.** Rewrite in native, natural Korean. "지금 시작하세요" not "시작을 하세요 지금".
- **Mixed honorific levels.** Stick to one: 합니다/하세요 consistently.
- **AI copywriting cliches.** Remove: "혁신적인", "원활한", "차세대", "게임 체인저", "한 차원 높은". Use concrete language.
- **Generic placeholder names.** Replace "김철수", "이영희" with realistic modern names: "하윤서", "박도현", "이서진".
- **Fake round metrics.** Replace `50,000+` with `47,200+`. Replace `5.0/5.0` with `4.87/5.0`.
- **English placeholder text.** All visible content must be in Korean.
- **Lorem Ipsum.** Replace with real Korean draft copy immediately.

### Component Patterns (Landing Page)

- **Generic hero with centered text over solid color.** Split screen, full-bleed media, or asymmetric statement layout.
- **3-card feature row.** Replace with Bento grid, zig-zag alternating, or horizontal scroll strip.
- **Carousel testimonials with dots.** Replace with masonry wall, embedded social-style cards, or single rotating quote with large portrait.
- **Pricing table with 3 identical towers.** Highlight recommended tier with color, scale, and emphasis.
- **Footer link farm with 4+ columns.** Simplify to essential nav, legal links, social icons.
- **Accordion FAQ.** Replace with side-by-side list, searchable help, or expandable inline sections.
- **CTA that blends into surrounding content.** CTAs need dramatic visual contrast — different background, larger padding, floating treatment.

### Icons and Images

- **Lucide or Feather icons.** Replace with Iconify Solar icon set for consistency.
- **Broken Unsplash URLs.** Replace with `picsum.photos/seed/{name}/{w}/{h}` for landscapes, `i.pravatar.cc/150?u={name}` for avatars.
- **Missing favicon.** Add a branded favicon.
- **Inconsistent icon stroke widths.** Standardize all icons to one weight (Solar set handles this automatically).
- **Generic stock "team" photos.** Use consistent illustration style or high-quality contextual photography.

### Code Quality

- **Div soup.** Use semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- **Missing meta tags.** Add `<title>`, `<meta name="description">`, `<meta property="og:image">`, `<meta name="viewport">`.
- **No `lang="ko"` on `<html>`.** Add it for accessibility and SEO.
- **Images without `loading="lazy"`.** Add lazy loading to all below-fold images.
- **No `alt` text on images.** Add descriptive Korean alt text.
- **Arbitrary z-index values.** Establish: nav (40), overlay (50), decorative (60).

## Upgrade Techniques

### Typography Upgrades
- **Animated text reveals.** Characters or words fade/slide in sequentially on scroll.
- **Gradient text accent.** ONE key headline with subtle gradient fill (max one per page).
- **Variable weight on hover.** Text weight shifts subtly when interactive elements are hovered.

### Layout Upgrades
- **Broken grid / asymmetry.** Elements that deliberately offset from the column structure.
- **Parallax depth.** Background images scroll at different speeds from content.
- **Sticky scroll stacking.** Sections stick and layer over each other during scroll.
- **Full-bleed section transitions.** Sections bleed into each other with gradient or diagonal transitions.

### Motion Upgrades
- **Staggered entry cascades.** Elements enter with `animation-delay: calc(var(--index) * 80ms)`.
- **Spring-based hover.** `transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1)` on interactive elements.
- **Scroll-driven progress.** Progress bars or SVG line drawings tied to scroll position.
- **Marquee logos.** Client logos in an infinite CSS marquee animation.

### Surface Upgrades
- **True glassmorphism.** `backdrop-blur-xl` + `border border-white/10` + inner shadow.
- **Mesh gradient backgrounds.** Multiple `radial-gradient` layers for organic ambient feel.
- **Noise texture overlay.** Fixed `pointer-events-none` element with subtle grain.
- **Tinted shadows.** Shadows that carry the background hue instead of generic black.

## Fix Priority

Apply in this order for maximum visual impact, minimum risk:

1. **Font swap to Pretendard** — instant premium feel for Korean content
2. **Color palette cleanup** — remove AI purple, desaturate accents
3. **Korean content rewrite** — natural copy, real names, organic numbers
4. **Hover and active states** — make the interface feel alive
5. **Layout diversification** — break the same-section repetition
6. **Section animation** — staggered reveals, scroll triggers
7. **Polish spacing and typography** — the premium final touch

## Rules

- Do not break existing page structure. Improve incrementally.
- Output must remain a single standalone HTML file.
- Before adding any CDN dependency, verify the URL is correct and from a major provider.
- Keep changes focused and reviewable. Targeted improvements over total rewrites.
- All content modifications must maintain natural Korean language quality.


---

---
name: supanova-premium-aesthetic
description: Teaches AI to design landing pages that feel like $150k agency work. Defines exact fonts, spacing, shadows, card structures, animations, and Korean typography standards that make Supanova-generated pages feel expensive and intentional. Blocks all common defaults that make AI designs look cheap or generic.
---

# Supanova Premium Aesthetic Engine

## 1. Core Directive
- **Persona:** `Supanova_Design_Director`
- **Objective:** You generate landing pages that look and feel like they cost $150k+ from a premium Korean digital agency. Your output must exude depth, cinematic spatial rhythm, obsessive micro-interactions, and flawless Korean typography. Every page must feel handcrafted, not templated.
- **The Variance Mandate:** NEVER generate the same layout or aesthetic twice. Dynamically combine different premium archetypes while maintaining elite design language.

## 2. THE "ABSOLUTE ZERO" DIRECTIVE (STRICT ANTI-PATTERNS)
If your generated code includes ANY of these, the design instantly fails:

- **Banned Fonts:** Inter, Noto Sans KR, Roboto, Arial, Open Sans, Helvetica, Malgun Gothic.
- **Banned Icons:** Thick-stroked Lucide, FontAwesome, or Material Icons. Use ONLY Iconify Solar set (ultra-clean, consistent weight).
- **Banned Borders & Shadows:** Generic `1px solid gray`. Harsh dark `shadow-md` or `rgba(0,0,0,0.3)`.
- **Banned Layouts:** Sticky top navbars glued to the edge. Symmetrical 3-column Bootstrap grids without massive whitespace. Every section using identical layout patterns.
- **Banned Motion:** `linear` or `ease-in-out` transitions. Instant state changes. `window.addEventListener('scroll')`.
- **Banned Content:** AI cliches in Korean: "혁신적인", "원활한", "차세대", "한 차원 높은", "게임 체인저".

## 3. THE CREATIVE VARIANCE ENGINE
Before writing code, select ONE combination from each category:

### A. Vibe & Texture Archetypes (Pick 1)
1. **Vantablack Luxe (SaaS / AI / Tech):** Deep OLED black (`#050505`), subtle radial mesh gradient orbs in background. Glass-effect cards with `backdrop-blur-2xl` and `border-white/10` hairlines. Wide geometric Grotesk English display font + Pretendard Korean.
2. **Warm Editorial (Lifestyle / Brand / Agency):** Warm creams (`#FDFBF7`, `#FAF7F0`), muted sage or espresso accents. High-contrast serif English headings + Pretendard Korean body. Subtle CSS noise overlay (`opacity-[0.03]`) for paper texture.
3. **Clean Structural (Consumer / Health / Portfolio):** Pure white or silver-grey backgrounds. Massive bold display typography. Floating components with ultra-diffused ambient shadows (`shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]`).

### B. Layout Archetypes (Pick 1)
1. **Asymmetrical Bento Grid:** CSS Grid with varying card sizes (`col-span-8 row-span-2` next to stacked `col-span-4`). Breaks visual monotony.
   - **Mobile Collapse:** Single column (`grid-cols-1`) with `gap-4`. All `col-span` resets to `col-span-1`.
2. **Z-Axis Cascade:** Elements stacked like physical cards, slightly overlapping with `transform: rotate(-1deg)` or `rotate(2deg)` for organic depth.
   - **Mobile Collapse:** Remove rotations and negative margins below `768px`. Stack vertically.
3. **Editorial Split:** Massive typography on left half, interactive content or product visuals on right half.
   - **Mobile Collapse:** Full-width stack. Text on top, visuals below.

**Mobile Override (Universal):** Any asymmetric layout above `md:` MUST collapse to `w-full px-4 py-8` below `768px`. Use `min-h-[100dvh]` not `h-screen`.

## 4. HAPTIC MICRO-AESTHETICS (COMPONENT MASTERY)

### A. The "Double-Bezel" Card Architecture
Premium cards are not flat rectangles. They look like machined hardware — a glass plate in an aluminum tray:
- **Outer Shell:** Wrapper with `bg-white/5` (dark) or `bg-black/5` (light), `ring-1 ring-white/10` or `ring-black/5`, `p-1.5`, `rounded-[2rem]`.
- **Inner Core:** Content container with distinct background, inner highlight (`shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`), calculated smaller radius (`rounded-[calc(2rem-0.375rem)]`).

### B. Premium CTA Button Architecture
- **Structure:** Fully rounded pills (`rounded-full`) with generous padding (`px-8 py-4`).
- **Arrow Icon Treatment:** Arrow icons NEVER sit naked next to text. Nest inside a circular wrapper: `w-8 h-8 rounded-full bg-black/5 flex items-center justify-center` flush with button's inner edge.
- **Hover Physics:** `hover:scale-[1.02]` + arrow `hover:translate-x-1`. Active: `active:scale-[0.98]`.
- **Glow Effect (dark mode):** Subtle `shadow-[0_0_30px_rgba(accent,0.2)]` on hover.

### C. Spatial Rhythm
- **Macro-Whitespace:** Section padding `py-24 md:py-32 lg:py-40`. Let the design breathe heavily.
- **Eyebrow Tags:** Precede major headings with a microscopic pill badge: `rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.15em] font-medium bg-accent/10 text-accent`.
- **Korean Text Rhythm:** `leading-snug` for Korean headlines (not `leading-none` — Korean needs vertical space). `break-keep-all` on all Korean blocks.

## 5. MOTION CHOREOGRAPHY
All motion must simulate physical mass and spring physics. Never use default easing.

### A. Transition Standard
```css
transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
```
Apply this to ALL interactive elements. This is the Supanova motion signature.

### B. Floating Glass Navigation
- **Default:** Floating pill detached from top (`mt-4 mx-auto w-max rounded-full`), glass effect (`backdrop-blur-xl bg-white/10 border border-white/10`).
- **Mobile Menu:** Expands as full-screen overlay with `backdrop-blur-3xl`. Nav links stagger-reveal: `translate-y-8 opacity-0` → `translate-y-0 opacity-100` with `animation-delay` cascade.

### C. Scroll Entry Animations
Elements never appear statically. On viewport entry:
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(2rem); filter: blur(4px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
```
Use `IntersectionObserver` for triggering. Stagger siblings with `animation-delay: calc(var(--index) * 80ms)`.

### D. Perpetual Micro-Motion
Background decorative elements should have subtle infinite animations:
- **Floating orbs:** `@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-15px) } }` with `animation: float 6s ease-in-out infinite`.
- **Gradient rotation:** `@keyframes gradientRotate { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }` for mesh gradient backgrounds.
- **Marquee logos:** Infinite horizontal scroll CSS animation for trust logo strips.

## 6. PERFORMANCE GUARDRAILS
- **GPU-Safe Animation:** Only `transform` and `opacity`. Never `top`, `left`, `width`, `height`.
- **Blur Constraints:** `backdrop-blur` only on fixed/sticky elements. Never on scrolling content.
- **Noise Overlay:** Fixed, `pointer-events-none`, `z-[60]`. Never on scrolling containers.
- **Image Loading:** `loading="lazy"` + `decoding="async"` on all below-fold images.
- **CDN Discipline:** Tailwind CDN + Iconify + Pretendard font. Maximum 5 external scripts total.

## 7. KOREAN CONTENT EXCELLENCE

### Voice & Tone
- **Professional but warm.** 합니다/하세요 form. Confident, not aggressive.
- **Concrete over abstract.** "3분 만에 랜딩페이지 완성" not "혁신적인 페이지 빌더".
- **Action-oriented CTAs.** "무료로 시작하기", "바로 만들어보기", "지금 체험하기".

### Realistic Data
- **Names:** 하윤서, 박도현, 이서진, 김하늘, 정민준, 오예린, 최시우, 한지원
- **Companies:** 스텔라랩스, 베리파이, 루미너스, 플로우캔버스, 넥스트비전, 브릿지웍스
- **Roles:** 프로덕트 디자이너, 스타트업 대표, 마케팅 리드, 프론트엔드 개발자, 브랜드 디렉터
- **Metrics:** 47,200+, 4.87/5.0, 2.3초, 98.7%, 12,847개

## 8. PRE-OUTPUT CHECKLIST
- [ ] No banned fonts, icons, borders, shadows, layouts, or motion patterns from Section 2
- [ ] Vibe Archetype and Layout Archetype consciously selected and applied
- [ ] All major cards use Double-Bezel nested architecture
- [ ] CTA buttons use pill + nested icon pattern with hover physics
- [ ] Section padding minimum `py-24` — design breathes heavily
- [ ] All transitions use `cubic-bezier(0.16, 1, 0.3, 1)` — no linear or ease-in-out
- [ ] Scroll entry animations present — no element appears statically
- [ ] Mobile collapse below `768px` to single-column with `w-full px-4`
- [ ] All animations use only `transform` and `opacity`
- [ ] `backdrop-blur` only on fixed/sticky elements
- [ ] Korean text has `break-keep-all` and `leading-snug` or `leading-tight`
- [ ] All visible text is natural Korean — no translated feel
- [ ] The page reads as "$150k Korean agency build", not "AI-generated template"


---

---
name: supanova-full-output
description: Overrides default LLM truncation behavior. Enforces complete HTML generation with zero placeholder patterns. Every landing page must be delivered as a complete, production-ready file. No shortcuts, no skeletons, no "add more as needed" patterns.
---

# Supanova Full-Output Enforcement

## Baseline

Treat every landing page generation as production-critical. A partial output is a broken output. If the user asks for a landing page, deliver the COMPLETE landing page — every section, every animation, every responsive breakpoint. No exceptions.

## Banned Output Patterns

The following patterns are hard failures. Never produce them:

**In code blocks:**
- `<!-- ... -->`
- `<!-- rest of sections -->`
- `<!-- similar to above -->`
- `<!-- add more sections as needed -->`
- `<!-- TODO -->`
- `// ...`
- Bare `...` standing in for omitted HTML

**In prose:**
- "Let me know if you want me to continue"
- "I can add more sections if needed"
- "For brevity, I'll show just the hero section"
- "The rest follows the same pattern"
- "Similarly for the remaining sections"
- "I'll leave that for you to customize"

**Structural shortcuts:**
- Outputting only the Hero when a full page was requested
- Showing the first and last section while skipping the middle
- Replacing repeated sections with one example and a description
- Describing what HTML should contain instead of writing it
- Generating a skeleton/wireframe when a complete page was requested

## Execution Process

1. **Scope** — Read the full request. Count how many sections/components are expected. A "landing page" means: nav + hero + social proof + features + testimonials + CTA + footer at minimum (7 sections). Lock the count.
2. **Build** — Generate every section completely with full responsive classes, animations, real Korean content, and proper Iconify icons.
3. **Cross-check** — Before output, verify: Does the HTML file have an opening `<!DOCTYPE html>` and closing `</html>`? Are all 7+ sections present? Is every section fully populated with real content?

## Handling Long Outputs

When a landing page approaches the token limit:

- Do NOT compress remaining sections to fit.
- Do NOT skip to the footer.
- Write at full quality up to a clean breakpoint (end of a complete `</section>` tag).
- End with:

```
[PAUSED — X of Y sections complete. Send "continue" to resume from: next section name]
```

On "continue", pick up with the next `<section>` exactly where you stopped. No recap, no re-outputting the `<head>`, no repetition.

## Landing Page Completeness Standards

A complete Supanova landing page MUST include:

### Required Elements
- `<!DOCTYPE html>` with `<html lang="ko">`
- Complete `<head>` with meta tags, Tailwind CDN, Pretendard font, Iconify, tailwind.config
- Navigation (floating glass or minimal bar)
- Hero section (above the fold, single most impactful section)
- At least one trust/social proof element
- Feature presentation (3-5 features minimum)
- Testimonials or case studies
- Primary CTA section
- Footer with essential links
- Scroll animation JavaScript (`IntersectionObserver` setup)
- Complete `</html>` closing

### Required Quality
- Every section has real Korean content (no placeholder text)
- Every section has full responsive classes (`sm:`, `md:`, `lg:`)
- Every interactive element has hover/active states
- Every image has `loading="lazy"`, `alt` text, and valid `src`
- Every icon uses `<iconify-icon icon="solar:..."></iconify-icon>`

## Quick Check

Before finalizing any response, verify:
- No banned patterns from the list above appear anywhere
- The HTML file is complete from `<!DOCTYPE html>` to `</html>`
- All requested sections are present and fully populated
- Every code block contains actual runnable HTML, not descriptions
- Nothing was shortened, summarized, or omitted to save space
- All visible text content is in natural Korean

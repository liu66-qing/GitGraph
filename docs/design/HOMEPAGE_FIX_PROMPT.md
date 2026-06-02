# DEPRECATED — Use HOMEPAGE_IMPL_PROMPT.md instead

This file is outdated. The current execution prompt is `HOMEPAGE_IMPL_PROMPT.md`.


---

## Context

You are working on CodeGraph, a pixel-game-inspired repository learning product. The canonical PRD is at `CODEGRAPH_PRD.md` in the project root. Read it fully before doing anything.

The current homepage implementation has critical layout failures:
1. The hero title is clipped/covered by the sidebar.
2. There is a large empty area below the content.
3. The visual style is a dark SaaS dashboard with a CSS gradient — not the pixel-game Stardew Valley style required by the PRD.
4. The mentor character appears to be CSS/SVG handcrafted, not a real sprite asset.
5. The right-side journey card overflows or misaligns with the hero.

## Your Task (in this exact order)

### Step 1: Read the PRD

Read `CODEGRAPH_PRD.md` completely. Pay special attention to sections 6, 9, 15, 16, 17, and 18.

### Step 2: Download Pixel Art Assets

Download these free CC0 asset packs and extract them into `frontend/src/assets/pixel/`:

1. **Ansimuz Sunny Land** — https://ansimuz.itch.io/sunny-land-pixel-game-art
   - Extract background layers (sky, clouds, hills, ground) into `assets/pixel/backgrounds/`
   - Extract character sprites into `assets/pixel/characters/`

2. **Kenney Pixel Platformer** — https://kenney.nl/assets/pixel-platformer
   - Extract character tiles and environment tiles into `assets/pixel/characters/` and `assets/pixel/props/`

3. **Quintino Pixel UI** — https://quintino-pixels.itch.io/pixel-ui
   - Extract wood panel frames, buttons, and UI elements into `assets/pixel/ui/`

If you cannot download (network blocked), create a `TODO-ASSETS.md` listing what's needed, and use solid-color placeholder boxes with class `.asset-placeholder` and a text label. Do NOT use CSS gradients or SVG as permanent substitutes.

### Step 3: Fix Homepage Layout

Fix the homepage grid layout. The current implementation violates the PRD. Apply these changes:

1. **Main content area must respect sidebar width.** The main area width = viewport width minus sidebar width. Use `calc(100vw - var(--sidebar-width))` or Mantine AppShell's built-in mechanism.

2. **Homepage grid must be fluid.** Replace any fixed-width layout with:
```css
.homepage-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.95fr);
  gap: 24px;
  width: 100%;
  max-width: min(100%, 1360px);
}
```

3. **At viewport width < 1280px**, collapse to single column:
```css
@media (max-width: 1279px) {
  .homepage-grid { grid-template-columns: 1fr; }
}
```

4. **Hero card must be fluid** — `width: 100%`, no fixed pixel width, no absolute positioning of the card itself.

5. **Hero title must never clip** — add `min-width: 0; overflow-wrap: anywhere;` to the title container.

6. **Remove the large empty space** — the hero card height should be `min-height: clamp(420px, 54vh, 560px)`, not a larger fixed value. Content below (recent repos) should flow naturally without a gap.

7. **Check section 17 of the PRD** for forbidden CSS patterns. Search the codebase for any of those patterns and remove them.

### Step 4: Replace CSS Background with Real Pixel Scene

Replace the current CSS gradient background on the hero card with a real pixel-art scene:

1. Use the Sunny Land background layers (or placeholders if download failed).
2. Layer them with CSS: sky at the back, clouds (with slow CSS drift animation), hills in the middle, ground at the front.
3. Use `image-rendering: pixelated` on all pixel assets.
4. The scene should fill the hero card area with `background-size: cover; background-position: bottom center;`.

### Step 5: Replace Handcrafted Mentor with Sprite

If the current mentor character is built from CSS divs or inline SVG:

1. Replace it with a real sprite from Kenney Pixel Platformer or Sunny Land character assets.
2. Use a sprite sheet with CSS `background-position` + `animation: steps()` for idle animation.
3. Position the mentor in the lower-right area of the hero card.

### Step 6: Build the Winding Path Map (Journey Card)

The right-side journey card must be a **winding path map** — like a Mario world map. Read PRD section 9 "Right Journey Card — Winding Path Map" for full spec.

Key requirements:

1. **The path must visually curve/wind.** Use an SVG `<path>` element to draw a curving trail from bottom-left to top-right within the card.
2. **Four station nodes** sit along the path: 先看门道 → 跑通主线 → 拆它绝活 → 抄走一招.
3. **Each node** is a glowing circle/signpost positioned along the SVG path, with a label and one-line description.
4. **Node states:** locked (grey), current (pulsing glow), completed (green checkmark).
5. **Decorations:** scatter 2-3 small pixel props (trees, flowers, rocks) between nodes along the path.
6. **The mentor character** stands at the current node with idle animation.
7. **Click a node** to navigate to that stage page.

Implementation approach:
```jsx
// Use SVG for the path line
<svg viewBox="0 0 300 400" className="journey-path-svg">
  <path d="M 50,380 C 80,320 220,300 180,240 C 140,180 250,160 200,100 C 150,40 250,20 250,20" 
        stroke="#8B6914" strokeWidth="8" fill="none" strokeDasharray="12 6" />
</svg>

// Position nodes absolutely along the path at calculated points
<div className="node node-1" style={{bottom: '10%', left: '15%'}}>...</div>
<div className="node node-2" style={{bottom: '35%', left: '55%'}}>...</div>
<div className="node node-3" style={{bottom: '60%', right: '25%'}}>...</div>
<div className="node node-4" style={{bottom: '85%', right: '15%'}}>...</div>
```

**Forbidden:**
- Do NOT use Mantine Timeline component.
- Do NOT use a vertical list with numbered circles.
- Do NOT use a horizontal stepper.
- The path MUST visually curve — a straight line with dots is not acceptable.

The card container: `width: 100%; aspect-ratio: 3/4` on desktop. On mobile (single column): `aspect-ratio: 16/9` with path going left-to-right.

### Step 7: Run the Diagnostic Checklist

After all changes, open the browser and verify every item in PRD section 18:

1. At 1920px: full hero title visible? 
2. At 1440px: full hero title visible?
3. At 1280px: graceful collapse or two columns still work?
4. At 1024px: no horizontal scroll?
5. No large empty area below content?
6. Sidebar does not overlap hero text?
7. Background is a real pixel scene image?
8. Mentor is a real sprite asset?
9. Journey card fits its column?
10. Journey card shows a winding path (not a vertical list or timeline)?

Fix any failures before declaring done.

## Rules

- Do NOT invent new features. Only fix layout and visual style.
- Do NOT change the Chinese copy text. Keep it exactly as specified in PRD section 3.
- Do NOT remove the sidebar or change the navigation structure.
- Do NOT use NES.css or any retro CSS framework.
- Do NOT hand-draw full pixel scenes with CSS/SVG. Use real image assets.
- If you cannot download assets, use clearly labeled placeholders — never fake it with gradients.
- After every significant change, take a screenshot or describe what you see to verify.
- Read PRD section 17 (Forbidden CSS Patterns) and actively search for violations in existing code.

## Success Criteria

The homepage passes all 9 checks in the diagnostic checklist AND visually reads as a pixel-game-inspired learning product at first glance — not as a dark developer dashboard with a decorative character sticker.

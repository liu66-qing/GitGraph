# CodeGraph Product Design PRD

> This is the canonical PRD for future implementation work.
> Claude and other coding agents should use this file instead of any older PRD stored in Claude local session output folders.
>
> The product name is **CodeGraph**.
> Do not use "仓库导师" as the product brand in the UI.

---

## 1. Why This PRD Exists

The previous implementation drifted away from the intended product design for four main reasons:

1. The old PRD was written mostly in Chinese, and the implementation chain corrupted Chinese text into mojibake.
2. The product name was not locked clearly enough, so the UI used "仓库导师" instead of CodeGraph.
3. The left sidebar was specified as a functional navbar, not as a designed game-like journey panel.
4. The component library was mistaken for the visual style. Mantine can provide structure, but it cannot create a Stardew-like pixel game style by itself.

This file fixes those issues by using English for all implementation instructions.

Chinese should appear only where it is literal UI copy that must be displayed to the user.

---

## 2. Product Identity

### Product Name

Use **CodeGraph** everywhere as the product name.

Required places:

- Browser title
- Header
- Sidebar brand area
- Logo alt text
- Loading states
- Empty states
- Help/chat surfaces

Forbidden:

- Do not use "仓库导师" as the product name.
- Do not use emoji as the logo.
- Do not use a generic graph/network icon as the logo.

### Product Positioning

CodeGraph is not a generic codebase viewer, wiki generator, RAG chatbot, or developer dashboard.

CodeGraph is a pixel-game-inspired learning journey that helps users understand why a great repository is worth learning, how its core flow works, what design tricks are worth stealing, and how to reuse one of those tricks in their own projects.

### Core User Promise

CodeGraph turns a complex repository into a guided learning path.

The product should feel like:

- A senior engineer guiding you through a great repo.
- A pixel-game adventure through a code village.
- A learning path with clear stages, not a tool marketplace.

---

## 3. Required Homepage Chinese Copy

Only these homepage hero copy strings should remain in Chinese.

### Hero Title

`CodeGragh让每个老乡看懂代码！`

Important:

- Use this exact text for the homepage hero title.
- The spelling `CodeGragh` is intentional in this display copy unless the product owner later changes it.
- Everywhere else in product identity and code naming, use `CodeGraph`.

### Hero Subtitle

`好仓库不是拿来硬啃的，带你彻底读懂一个github仓库`

### Repository Input Placeholder

`粘贴 GitHub 仓库地址，例如：facebook/react`

### Primary CTA

`开始探索`

### Hot Repo Tags

Display a row of clickable repository tag chips below the input:

- Label: `热门仓库：`
- Tags: `facebook/react`, `vuejs/core`, `microsoft/vscode`, `langchain-ai/langchain`
- Refresh button: `换一换`

These replace the old "Supporting Chips" concept.

---

## 4. Visual Direction

### Mandatory Style

The visual style must be based on a **pixel game art direction inspired by farming/adventure games such as Stardew Valley**.

This means:

- Pixel-art characters.
- Pixel-art environments.
- Tile-like backgrounds.
- Wooden signs and panels.
- Small animated game-world details.
- Journey map metaphors.
- Warm, playful, asset-backed game UI.

This does not mean:

- A plain SaaS interface with a pastel gradient.
- Default Mantine cards and buttons with minor color tweaks.
- A dark developer-dashboard sidebar.
- A single decorative SVG character pasted onto an otherwise normal web app.

### Asset-Driven Art Direction

The pixel-game visual style must be **asset-driven**.

Do not ask Claude to handcraft the full pixel-game world from CSS, SVG, or divs. Claude may tune the visual composition, crop assets, layer scenes, implement parallax, wire animations, and build reusable wrappers, but the final visual fidelity must come from real art assets.

Required asset sources:

- Licensed open-source pixel art packs.
- CC0 or permissively licensed voxel/pixel packs.
- Generated image assets created specifically for CodeGraph.
- Custom commissioned assets, if available later.

Required asset categories:

- Large scene backgrounds.
- Character sprites or sprite sheets.
- Tile sets.
- Props such as signs, crystals, books, crates, tools, campfires, and paths.
- Pixel UI panels, buttons, frames, and icons.

Allowed Claude handcrafted work:

- Small ornaments.
- Minor logo refinements.
- CSS masks, borders, shadows, and responsive positioning.
- Composition and motion integration.
- Color tuning to unify different asset packs.

Forbidden Claude handcrafted work:

- Full pixel-game backgrounds drawn only with CSS/SVG.
- Full character sprite sheets drawn only with CSS/SVG.
- Recreating Stardew Valley, Minecraft, Mario, or any copyrighted game assets.
- Using screenshots or protected game art as production assets.

Recommended starting sources:

- `Ansimuz Sunny Land` for colorful pixel-game environments.
- `Ansimuz Mountain Dusk` for layered dusk parallax backgrounds.
- `Ansimuz Synth Cities` if a cyber pixel scene is needed.
- `Kenney Voxel Pack` for Minecraft-like voxel props.
- `Quintino Pixel Art Fantasy UI Pack` for wood/paper panels and pixel UI pieces.
- `Kenney 1-Bit Pack` or `OpenGameArt LPC Collection` only after checking license compatibility for each asset.

### Mantine Boundary

Mantine is the structural component layer.

Mantine should provide:

- `AppShell`
- `Grid`
- `Container`
- `Paper`
- `Card`
- `Button`
- `Badge`
- `Timeline`
- `Tabs`
- `Accordion`
- `Progress`
- `NavLink`
- `Drawer`
- `Tooltip`

Mantine does not provide:

- Pixel-game art direction.
- Logo design.
- Character design.
- Game-like animations.
- Wooden panels.
- Tile maps.
- Scene backgrounds.

The implementation must add a separate **CodeGraph Pixel Skin** layer on top of Mantine.

---

## 5. Required Pixel Design Assets

Build these as reusable UI components, but source their artwork from licensed/generated assets whenever the asset is visually substantial. Do not duplicate one-off SVG snippets across pages.

Implementation rule:

- Components organize and render assets.
- Art packs provide the visual substance.
- Claude may handcraft only small decorative details and glue code.

### 5.1 PixelLogo

The CodeGraph logo must be custom-designed, but it can be created from a generated pixel logo asset or a small original pixel drawing. It does not need to come from a public asset pack.

Concept:

- A glowing code crystal.
- Three small graph nodes connected by two lines.
- A tiny green sprout or leaf.
- A dark pixel outline.

Required visual traits:

- Pixel-art style.
- 2px dark outline.
- Blue crystal highlight.
- Green sprout accent.
- Brown/wood or night-blue support color.
- Works at `32px`, `40px`, and `64px`.

Forbidden:

- No emoji.
- No lucide icon as final logo.
- No plain text-only logo.
- No generic modern gradient logo.

### 5.2 PixelMentor

Create one consistent pixel mentor character used across the journey. Prefer an existing licensed character sprite sheet or a generated character sprite sheet. Do not build the character from CSS boxes.

The mentor is:

- A friendly senior engineer from the code village.
- A guide, not a mascot sticker.
- Built from visible pixel blocks.

Required character parts:

- Hair or hat.
- Face.
- Shirt or jacket.
- Pants.
- Boots.
- A hand-held prop that changes by page.

Page-specific poses:

- Home: waving beside a wooden sign.
- Analyzing: small joyful idle/dance animation.
- Learning map: holding a route sign.
- Overview: holding a magnifying glass.
- Main flow: jogging along a path.
- Showcase: mining a glowing code crystal.
- Takeaway: putting treasure into a backpack.

If a full pose set is not available, use one base sprite and animate it with small transforms, props, and idle frames until a proper sprite sheet exists.

### 5.3 SceneBackdrop

Every major page must have a pixel-game scene backdrop. These backdrops must come from real image assets, generated backgrounds, or licensed layered parallax packs.

Required scenes:

- Home: spring morning sky, clouds, grass, wooden sign, village path.
- Analyzing: sunny farm field, scanning beam, animated mentor.
- Learning map: parchment or valley map, flags, route path.
- Overview: morning fog, notice board, magnifying-glass mood.
- Main flow: daytime road, bridge, flowing route line.
- Showcase: golden dusk mine entrance, glowing crystals, gold particles.
- Takeaway: evening farm, campfire, crates, backpack glow.

Backdrop rule:

- Use image layers, sprite sheets, tile sets, or generated bitmap backgrounds.
- Do not draw full scenes with CSS gradients, pseudo-elements, or inline SVG.
- CSS may be used for placement, cropping, overlays, lighting, and parallax.

### 5.4 WoodPanel

Use `WoodPanel` for important cards and panels.

It should feel like:

- A wooden board.
- A parchment panel pinned to wood.
- A pixel RPG dialog panel.

Required details:

- Pixel outline.
- Corner studs or small nails.
- Real pixel UI texture or asset-based wood/paper frame.
- Internal area can still contain Mantine content.

Forbidden:

- Do not make every card plain white with only border and shadow.

### 5.5 RouteSignpost

Use route signposts for journey navigation.

Required:

- The four learning stages must look like signs on a route.
- Current stage has a small glowing arrow or flag.
- Hover state should feel game-like: small lift, glow, or pixel shimmer.

Signpost rule:

- Prefer UI/prop assets from the chosen pixel pack.
- CSS-only signposts are acceptable only as a temporary placeholder and must be listed as visual debt.

---

## 6. Global Layout

### Responsive Layout Contract

The layout must adapt to the actual browser viewport. Do not hard-code a 1440px or 1600px design canvas into the page.

Use this priority order:

1. Preserve readable content.
2. Preserve the journey structure.
3. Preserve the pixel-game art direction.
4. Reduce decorative density when space is tight.

The current failure mode to avoid: a fixed-width hero is pushed under the sidebar and the title is clipped. Text must never be clipped by the viewport, sidebar, or neighboring cards.

### Breakpoints

Use these breakpoints as layout behavior contracts:

- `base < 768px`: mobile layout.
- `768px - 1023px`: tablet layout.
- `1024px - 1279px`: compact desktop layout.
- `1280px - 1535px`: standard desktop layout.
- `>= 1536px`: wide desktop layout.

### App Shell Behavior

Use Mantine `AppShell`, but dimensions must be responsive.

Header:

- Height: `64px` on mobile and compact desktop.
- Height: `72px` on standard and wide desktop.
- Header content must fit without pushing the page horizontally.

Sidebar:

- Mobile and tablet: hidden behind a drawer or collapsed rail.
- Compact desktop: `220px - 240px`.
- Standard desktop: `248px - 264px`.
- Wide desktop: max `272px`.

Main:

- Mobile padding: `16px`.
- Tablet padding: `20px`.
- Desktop padding: `24px`.
- Wide desktop padding: `28px`.

The sidebar must not cover or compress the main hero. Main content width must be calculated from the remaining viewport, not from the full browser width.

### Content Width

Use fluid constraints:

- Main content wrapper: `width: min(100%, 1360px)`.
- Center it only within the available `AppShell.Main` area.
- Do not apply a fixed `min-width` to homepage sections.
- Avoid horizontal scrolling at every breakpoint.

### Grid Rules

Use CSS grid or Mantine Grid with responsive columns.

Desktop homepage:

- Use `grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.95fr)`.
- Gap: `24px`.
- The left hero column must be allowed to shrink with `min-width: 0`.

Compact desktop:

- Keep two columns only if the hero can remain at least `640px` wide.
- If the hero would be narrower than `640px`, switch to one column.

Tablet and mobile:

- One column.
- Journey card appears below the hero.
- Recent cards use one or two columns depending on available width.

### Spacing Rhythm

Spacing should be token-based and responsive:

- `--space-2`: `8px`
- `--space-3`: `12px`
- `--space-4`: `16px`
- `--space-5`: `20px`
- `--space-6`: `24px`
- `--space-8`: `32px`

Use larger spacing only on wide desktop. Do not use giant fixed gaps to imitate a design mockup.

### Text Safety Rules

All text containers must include overflow-safe behavior:

- Use `min-width: 0` on grid/flex children.
- Use `overflow-wrap: anywhere` for long repo names.
- Do not use negative letter spacing.
- Do not scale font size with viewport width.
- Use `clamp()` only for container dimensions or spacing, not for body text.

Hero title:

- Mobile: `32px - 36px`, line-height `1.12`.
- Compact desktop: `40px - 44px`, line-height `1.1`.
- Standard/wide desktop: `48px - 56px`, line-height `1.08`.
- The title must wrap naturally and never be clipped.

### Visual Density Rules

If space is tight:

- Reduce background decoration first.
- Reduce character size second.
- Stack cards third.
- Never shrink readable text below a professional size.

---

## 7. Sidebar Design

The sidebar is not a backend/admin sidebar.

It must feel like a **pixel village journey board**.

### Sidebar Structure

Top:

- `PixelLogo`
- `CodeGraph`
- Small tagline: `偷师优秀仓库的捷径`

Middle:

- Journey section label: `JOURNEY`
- Home
- Learning Map
- Overview
- Main Flow
- Showcase
- Takeaway

Advanced:

- Small collapsed or visually secondary group.
- Git Evolution and graph/research tools can live here.
- These must not compete with the main journey.

Bottom:

- Current repository name.
- Learning progress.
- Lightweight progress bar.

### Sidebar Visual Rules

Background:

- Night-blue wood panel.
- Base color around `#182231`.
- Add subtle 8px pixel grid or wood texture.

Selected state:

- Warm wooden highlight, not purple SaaS highlight.
- Grass-green 4px pixel bar.
- Icon glow.
- Small 8px pixel arrow.

Forbidden:

- No generic dark admin sidebar.
- No oversized icon list.
- No equal-weight feature marketplace.
- No "仓库导师 BETA" brand.

### Sidebar Responsive Rules

The sidebar width must respond to the viewport.

Rules:

- Never use a fixed `272px` sidebar on compact desktop if it causes hero clipping.
- At `1024px - 1279px`, use a compact sidebar or icon rail.
- Below `1024px`, move navigation into a drawer.
- The sidebar must use `flex-shrink: 0`, and the main area must compute its width from the remaining space.
- The active nav item text must fit inside the sidebar without forcing horizontal page scroll.

### Sidebar Prototype

```text
┌──────────────────────────┐
│ [PixelLogo] CodeGraph    │
├──────────────────────────┤
│  🏠 首页          (selected)
│  🗺️ 学习地图              │
│  🧭 先看门道         ①    │
│  🗺️ 跑通主线         ②    │
│  ⚔️ 拆它绝活         ③    │
│  🎒 抄走一招         ④    │
├──────────────────────────┤
│  ⚙️ 设置                  │
│  ❓ 帮助中心              │
│  💬 反馈建议              │
├──────────────────────────┤
│ [像素角色头像]            │
│  coder_01                │
│  老乡，继续进步！         │
│  💎 1280 / 2000 XP       │
│  [████████░░░░] 64%      │
└──────────────────────────┘
```

Navigation items must have:
- Pixel-style icon on the left.
- Stage name in the middle.
- Green numbered badge on the right (for journey stages only).
- Selected state: blue/indigo highlight background.

Bottom user area must have:
- Pixel character avatar (from Kenney assets or placeholder).
- Username.
- Encouraging tagline.
- XP progress bar (green fill on dark track).

---

## 8. Header Design

The homepage does NOT use a separate top header bar. The brand identity lives in the sidebar.

If other pages (learning stages) need a header, use Mantine `AppShell.Header` with:

- Left: `PixelLogo` + `CodeGraph`.
- Center: empty.
- Right: minimal utility icons.

On the homepage specifically, there is no header — the sidebar + main content fill the viewport.

---

## 9. Homepage Layout

### Page Goal

The homepage must immediately communicate:

- CodeGraph is friendly.
- CodeGraph is a guided learning journey.
- Reading a repository can feel playful instead of painful.

### Required Grid

The homepage uses a **single-column vertical stack** layout (not a two-column hero+sidebar layout). All content flows top to bottom within the main content area.

Standard and wide desktop vertical stack:

1. Hero area (title + input + hot repos) — top.
2. Journey path map (horizontal winding route with scene background) — middle, visual center.
3. Three-column info cards (推荐仓库 / 你将获得 / 当前进度) — bottom.

The left sidebar provides navigation but does not create a two-column split within the main content area itself.

Main content width:

- `width: calc(100vw - var(--sidebar-width))`.
- `max-width: min(100%, 1360px)`.
- Centered within the available space after sidebar.
- Padding: `clamp(20px, 3vw, 32px)`.

Compact desktop (1024-1279px):

- Same single-column stack.
- Reduce padding and card sizes.

Tablet and mobile (<1024px):

- Sidebar collapses to drawer.
- Full-width single column.
- Bottom three cards stack vertically.

Do not use `width: 1320px`, `min-width: 1320px`, or fixed translated positioning for the homepage grid.

### Hero Area

The hero area is the top section of the page. It contains the title, subtitle, input, and hot repo tags. It does NOT have a scene background — the scene background belongs to the journey path map below.

Required:

- Width: `100%` of main content area.
- Background: white/transparent (clean, no scene image here).
- Vertical padding: `32px` top, `24px` bottom.
- Content is centered horizontally.

Hero title:

- Text: `CodeGraph让每个老乡看懂代码！`
- Size: `clamp(32px, 4vw, 48px)`, bold, near-black (`#1a1a1a`).
- Centered. Above the title: a small pixel plant/sprout decorative icon.
- Must use `min-width: 0; overflow-wrap: anywhere;` — never clip.

Hero subtitle:

- Text: `好仓库不是拿来硬啃的，带你彻底读懂一个github仓库`
- Size: `16-18px`, grey (`#666`).
- Centered, directly below title.

Hero input row:

- Below subtitle, `24px` gap.
- Layout: `[GitHub icon] [input field] [paste icon] [green CTA button]` in one row.
- Input: flexible width, placeholder `粘贴 GitHub 仓库地址，例如：facebook/react`.
- CTA button: green (`#22c55e`), white text, `开始探索 →`, approximately `160px` wide, `48px` tall.
- If available width < `620px`, stack input and CTA vertically.

Hot repo tags row:

- Below input row, `12px` gap.
- Layout: `热门仓库：` label + tag chips (`facebook/react`, `vuejs/core`, `microsoft/vscode`, `langchain-ai/langchain`) + `换一换` button.
- Tags are grey outlined chips, clickable (fill input on click).

### Journey Path Map — Horizontal Winding Route

The four learning stages must be displayed as a **horizontal winding path map** with a pixel-art scene background, occupying the visual center of the homepage.

#### Visual Design

The path map is a wide horizontal band showing a curving trail from **left to right**, with four station nodes along the path. The entire area is backed by a pixel-art natural scene (village, hills, windmill, trees).

```
[START木牌]  ①先看门道  ──→──  ②跑通主线  ──→──  ③拆它绝活  ──→──  ④抄走一招  [旗帜/宝箱]
              (左侧)          (中偏左)          (中偏右)          (右侧)
```

The path goes **left to right** with slight vertical undulation (nodes alternate between ~35% and ~45% from top) to create a gentle winding feel.

#### Container

- Width: `100%` of the main content area.
- Height: `clamp(320px, 40vh, 400px)`.
- Background: `home-journey-scene.png` (pre-generated pixel art scene), with `background-size: cover; background-position: center; image-rendering: pixelated`.
- Border: pixel-style light-blue semi-transparent border (2-3px, slightly rounded or square corners).
- Position: `relative` (nodes are absolutely positioned inside).

#### Station Nodes

Each node is a card floating over the background scene:

- Style: light parchment/cream background (`#fffef5`), rounded corners (`8px`), subtle shadow.
- Size: approximately `160-180px` wide, `100-120px` tall.
- Content: green numbered circle (top) + stage name (bold) + one-line description (small grey text).
- Connected by green arrow icons (`→`) between nodes.

Node positions (percentage from left edge of container):
```
Node 1: left: 5%,  top: 45%
Node 2: left: 28%, top: 35%
Node 3: left: 52%, top: 45%
Node 4: left: 76%, top: 35%
```

Node states:
- Locked: greyed out, no glow.
- Current: green pulsing glow border.
- Completed: green checkmark overlay on the number circle.

#### Node Labels and Descriptions

- Node 1: `先看门道` — `快速了解仓库的定位、技术栈与整体结构。`
- Node 2: `跑通主线` — `运行项目，理解主线执行流程与关键逻辑。`
- Node 3: `拆它绝活` — `分析核心模块，拆解关键实现技巧与设计亮点。`
- Node 4: `抄走一招` — `提炼可复用的思路与技巧，拿去解决自己的问题。`

#### Scene Props (in the background image)

The background scene image (`home-journey-scene.png`) already contains:
- Blue sky with clouds
- Green hills and trees
- Windmill, small cottage, wooden fence
- "START" wooden sign on the left
- Wooden crates and flag on the right

No need to render these as separate DOM elements — they are part of the background image.

#### Interaction

- Click a node to navigate to that stage page.
- Hover a node: slight lift + glow intensify.
- Locked nodes (no repo analyzed yet): greyed out, click shows tooltip "先提交一个仓库".

#### Responsive Behavior

- Desktop (≥1280px): full horizontal layout as described.
- Compact desktop (1024-1279px): nodes shrink slightly, descriptions may truncate.
- Tablet/mobile (<1024px): the path map becomes horizontally scrollable, or nodes stack into a simplified vertical list as fallback.

#### Forbidden

- Do not use a vertical timeline component (Mantine Timeline).
- Do not use a plain ordered list with numbered circles.
- Do not use horizontal stepper/wizard UI.
- Do not make the path vertical (bottom-to-top). It must be horizontal (left-to-right).
- Do not draw the background scene with CSS gradients — use the pre-generated image asset.

### Bottom Three-Column Cards

Below the journey path map, display three equal-width information cards side by side.

Grid: `grid-template-columns: 1fr 1fr 1fr; gap: 20px;`
At `<1280px`: collapse to single column.

#### Card 1: 推荐仓库

- Header: ⭐ 推荐仓库 + "查看更多 >" link
- Content: 2-3 repository entries, each with:
  - Repository icon/avatar
  - Name (e.g., "facebook / react")
  - Category tag (e.g., "前端框架")
  - One-line description
  - Star count

#### Card 2: 你将获得

- Header: 🎁 你将获得
- Content: 2x2 grid of benefits:
  - 全局视野 — 快速建立对仓库的整体认知
  - 跑通思维 — 理解项目运行逻辑，建立系统化认知
  - 硬核拆解 — 寻找关键实现技巧与设计亮点
  - 迁移复用 — 提炼可复用能力，解决更多问题

#### Card 3: 当前进度

- Header: 📊 当前进度 + "查看详情 >" link
- Content:
  - Circular progress ring showing percentage (e.g., "42%")
  - "已完成 2/4 步"
  - Current stage name as link
  - Description of current stage
  - Estimated time remaining
  - Green CTA button "继续学习"

### Example Repository Card

Show example repositories as selectable game tags or wooden tokens.

Default examples:

- `letta-ai/letta`
- `langchain-ai/langchain`
- `microsoft/autogen`

Repository token rules:

- Tokens wrap onto multiple lines.
- Long names use `overflow-wrap: anywhere`.
- Buttons remain at least `44px` high on touch devices.

---

## 10. Learning Journey Pages

The main journey has four stages.

The UI should always make the user feel they are moving through a route, not switching between random tools.

### Stage 1: 先看门道

Goal:

- Help users understand what the repository is about before reading code.

Scene:

- Morning fog.
- Notice board.
- Mentor with magnifying glass.

Content:

- One-sentence positioning.
- Core problem solved by the repo.
- Three-part mental model.
- Recommended starting path.

### Stage 2: 跑通主线

Goal:

- Help users mentally run the core request or execution flow.

Scene:

- Daytime road.
- Bridge.
- Flowing route line.
- Mentor jogging.

Content:

- Main flow diagram.
- Clickable route nodes.
- Node explanation card.
- Minimal evidence links.

### Stage 3: 拆它绝活

Goal:

- Create the "now I understand why this repo is impressive" moment.

Scene:

- Dusk mine entrance.
- Glowing code crystals.
- Mentor mining.
- Gold particles.

Content:

- Exactly three design tricks.
- Tabs or signposts for the tricks.
- Story card for each trick.
- Code evidence accordion.

For `letta-ai/letta`, use:

- `记忆不是外挂，是系统核心`
- `Agent 不是一次性回答器`
- `这些能力其实是一个闭环`

### Stage 4: 抄走一招

Goal:

- Help users take away a reusable pattern.

Scene:

- Evening farm.
- Campfire.
- Wooden crates.
- Mentor putting treasure into a backpack.

Content:

- Summary hero.
- Three reusable pattern cards.
- Minimal implementation snippet.
- Applicability and non-applicability.
- Journey completion card.

For `letta-ai/letta`, use:

- Hot/cold memory layering.
- Persistent stateful agent entity.
- Tool call plus state update loop.

---

## 11. Motion Design

Motion must feel like pixel-game UI, not generic web microinteraction.

Required:

- Page load: scene elements appear in staggered order.
- Clouds drift slowly on the home page.
- Current route node pulses or glows.
- Mentor has a subtle idle animation.
- Showcase crystals shimmer.
- Takeaway backpack flashes after copy action.
- Campfire flickers on the takeaway page.

Forbidden:

- No excessive bouncy SaaS animation.
- No unrelated confetti.
- No motion that distracts from reading.

Use `framer-motion` where appropriate.

Keep animations subtle and performant.

---

## 12. Typography And Color

### Typography

Avoid default system typography as the only visual voice.

Recommended:

- UI font: a readable Chinese-compatible sans font.
- Accent font: pixel-style or blocky display treatment for labels and route signs.
- Code font: JetBrains Mono or equivalent.

Chinese UI copy must remain readable.

### Color Palette

Core colors:

- Night blue: `#182231`
- Pixel outline: `#1B2A3A`
- Crystal blue: `#5CC8FF`
- Grass green: `#7ACB6A`
- Wood brown: `#9A6A3A`
- Warm parchment: `#F7DFA3`
- Campfire orange: `#F49A3A`

Forbidden:

- Do not default to purple as the primary visual identity.
- Do not use plain white cards everywhere.
- Do not make the product look like a generic developer dashboard.

---

## 13. Implementation Rules

### Encoding

All files must be read and written as UTF-8.

Before final delivery, search source files for mojibake markers:

- `浠`
- `鍏`
- `鎷`
- `鈥`
- `馃`

If any appear in UI source code, the implementation fails.

### Component Rules

Use Mantine for structure.

Use custom pixel-game components for visual identity, but the visual substance must be asset-driven.

Required reusable components:

- `PixelLogo`
- `PixelMentor`
- `SceneBackdrop`
- `WoodPanel`
- `RouteSignpost`
- `JourneyCheckpoint`
- `PixelButton` or a styled Mantine `Button` wrapper

Required asset integration behavior:

- Keep external art assets in a dedicated frontend asset folder.
- Document each asset source and license near the asset or in an asset manifest.
- Use `image-rendering: pixelated` where pixel assets are scaled.
- Use `object-fit`, `object-position`, and responsive wrappers instead of fixed absolute dimensions.
- Do not stretch pixel assets non-proportionally.

### Routing Rules

Main route should only expose:

- Home
- Learning Map
- 先看门道
- 跑通主线
- 拆它绝活
- 抄走一招

Tool-like pages should move into advanced/research areas.

Forbidden from primary navigation:

- Query Console
- Raw Graph Explorer
- Conflict Dashboard
- Timeline
- Generic Ask Codebase

---

## 14. Acceptance Checklist

Implementation is successful only if all checks pass.

### Brand

- Product name is CodeGraph.
- Homepage title uses exact Chinese copy: `CodeGragh让每个老乡看懂代码！`
- Header and sidebar do not say "仓库导师".
- Custom pixel logo exists and is reused consistently.

### Visual Style

- The page reads as pixel-game-inspired at first glance.
- Sidebar feels like a journey board, not an admin menu.
- Hero card visually dominates the homepage.
- There are scene backdrops, not just gradients.
- Important cards use wood/pixel treatment, not plain SaaS cards.

### Layout

- Homepage uses the responsive hero grid contract in section 9.
- Hero text and controls are never clipped at desktop, tablet, or mobile widths.
- No horizontal page scrolling appears at supported breakpoints.
- Main content width is computed from the available area after the sidebar.
- Left sidebar does not overpower or cover main content.
- Journey stages are route checkpoints, not a flat list.
- At compact widths, the page stacks before the hero drops below `640px` readable width.

### Assets

- Substantial pixel-game visuals come from licensed/generated assets.
- Asset sources and licenses are documented.
- Claude-handcrafted CSS/SVG is limited to ornaments, wrappers, tuning, and motion.
- No copyrighted game screenshots or protected game sprites are used as production assets.

### Motion

- Mentor has idle animation.
- Route/checkpoint interactions feel game-like.
- Scene-specific animation exists but stays subtle.

### Encoding

- No mojibake markers in source.
- Chinese UI copy displays correctly in browser.

---

## 15. Asset Directory Structure

All pixel art assets must live in a dedicated directory with clear organization.

### Required Directory Layout

```
frontend/src/assets/pixel/
├── backgrounds/
│   ├── home-sunny-land.png          — Homepage spring morning scene
│   ├── home-sunny-land-layers/      — Individual parallax layers if available
│   │   ├── sky.png
│   │   ├── clouds.png
│   │   ├── hills.png
│   │   └── ground.png
│   ├── overview-morning-fog.png     — 先看门道 scene
│   ├── mainflow-daytime-road.png    — 跑通主线 scene
│   ├── showcase-dusk-mine.png       — 拆它绝活 scene
│   └── takeaway-evening-farm.png    — 抄走一招 scene
├── characters/
│   ├── mentor-idle.png              — Idle sprite sheet (4-8 frames)
│   ├── mentor-walk.png              — Walking sprite sheet
│   ├── mentor-wave.png              — Waving pose (homepage)
│   ├── mentor-magnify.png           — Holding magnifying glass (overview)
│   ├── mentor-mine.png              — Mining pose (showcase)
│   └── mentor-backpack.png          — Backpack pose (takeaway)
├── ui/
│   ├── wood-panel-9slice.png        — 9-slice wood panel frame
│   ├── button-green.png             — Pixel button normal state
│   ├── button-green-hover.png       — Pixel button hover state
│   ├── signpost.png                 — Route signpost prop
│   ├── crystal-blue.png             — Code crystal icon
│   ├── crystal-gold.png             — Achievement crystal
│   └── progress-bar-tiles.png       — Pixel progress bar segments
├── props/
│   ├── wooden-sign.png              — Wooden sign for hero area
│   ├── campfire.png                 — Campfire sprite (animated)
│   ├── crate.png                    — Wooden crate
│   ├── backpack.png                 — Backpack prop
│   ├── flag-green.png               — Route flag (current stage)
│   └── flag-grey.png                — Route flag (locked stage)
└── LICENSES.md                      — Source URL + license for every asset
```

### Asset Integration Rules

- Every PNG must use `image-rendering: pixelated` when scaled up.
- Never stretch assets non-proportionally. Use `object-fit: contain` or fixed aspect ratios.
- Sprite sheets use CSS `background-position` + `steps()` animation for frame cycling.
- Background scenes use `background-size: cover` with `background-position: bottom center`.
- On viewports narrower than `1024px`, reduce background complexity by hiding parallax layers or cropping.

---

## 16. Asset Acquisition Steps

The implementation agent must download these specific free asset packs before starting visual work.

### Required Downloads

| Pack | Source | License | Use For |
|------|--------|---------|---------|
| Ansimuz Sunny Land | https://ansimuz.itch.io/sunny-land-pixel-game-art | CC0 | Homepage background, grass, trees, sky layers |
| Ansimuz Mountain Dusk | https://ansimuz.itch.io/mountain-dusk-parallax-background | CC0 | 拆它绝活 dusk scene background |
| Kenney Pixel Platformer | https://kenney.nl/assets/pixel-platformer | CC0 | Character base sprites, tiles, props |
| Quintino Pixel UI | https://quintino-pixels.itch.io/pixel-ui | CC0 | Wood panels, pixel buttons, UI frames |
| Kenney UI Pack RPG Expansion | https://kenney.nl/assets/ui-pack-rpg-expansion | CC0 | Additional RPG-style UI elements |

### Download Procedure

1. Visit each URL above.
2. Download the ZIP file.
3. Extract relevant PNGs into the corresponding `frontend/src/assets/pixel/` subdirectory.
4. Record the source URL and license in `LICENSES.md`.
5. If a pack provides sprite sheets, keep the original sheet and also extract individual frames if needed for CSS animation.

### If Downloads Are Blocked

If the implementation environment cannot access itch.io or kenney.nl:

1. Document which packs are needed in a `TODO-ASSETS.md` file.
2. Use solid-color placeholder rectangles with the correct dimensions and a text label like `[sunny-land-sky.png needed]`.
3. Mark all placeholder assets with a CSS class `.asset-placeholder` so they can be found and replaced later.
4. Never use CSS gradients or SVG drawings as a permanent substitute for scene backgrounds.

---

## 17. Forbidden CSS Patterns

These CSS patterns have caused layout failures in previous implementations. They are banned.

### Homepage Layout Forbidden Patterns

```css
/* FORBIDDEN — causes hero to overflow under sidebar */
.hero-card { position: absolute; left: 50%; transform: translateX(-50%); }

/* FORBIDDEN — causes clipping on smaller viewports */
.hero-card { width: 800px; }
.hero-card { min-width: 720px; }
.homepage-grid { width: 1320px; }

/* FORBIDDEN — hides overflow instead of fixing layout */
.main-content { overflow: hidden; }
.main-content { overflow-x: hidden; }

/* FORBIDDEN — sidebar covers content */
.sidebar { z-index: 100; }  /* without main content having higher stacking */
.main-content { margin-left: 0; }  /* when sidebar is present */

/* FORBIDDEN — fixed positioning that ignores sidebar */
.hero-text { position: fixed; }
.hero-input { position: absolute; left: 40px; }
```

### Required Layout Patterns

```css
/* REQUIRED — main content respects sidebar */
.app-shell-main {
  width: calc(100vw - var(--sidebar-width));
  margin-left: var(--sidebar-width);
  min-width: 0;
}

/* REQUIRED — hero grid is fluid */
.homepage-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.95fr);
  gap: 24px;
  width: 100%;
  max-width: min(100%, 1360px);
}

/* REQUIRED — hero card is fluid within its column */
.hero-card {
  width: 100%;
  min-height: clamp(420px, 54vh, 560px);
  position: relative;  /* for internal absolute children only */
  overflow: visible;
}

/* REQUIRED — text never clips */
.hero-title {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* REQUIRED — at compact widths, collapse to single column */
@media (max-width: 1279px) {
  .homepage-grid {
    grid-template-columns: 1fr;
  }
}
```

### Sidebar Forbidden Patterns

```css
/* FORBIDDEN — fixed sidebar that doesn't respond to viewport */
.sidebar { width: 272px; }  /* without responsive fallback */

/* FORBIDDEN — sidebar pushes page wider than viewport */
.sidebar + .main { width: 100vw; }
```

---

## 18. Homepage Layout Diagnostic Checklist

Before submitting homepage work, the implementation agent must verify:

1. Open browser at `1920px` wide. Is the full hero title visible without clipping? YES/NO
2. Open browser at `1440px` wide. Is the full hero title visible? YES/NO
3. Open browser at `1280px` wide. Does the layout still have two columns or gracefully collapse? YES/NO
4. Open browser at `1024px` wide. Is there horizontal scrolling? Must be NO.
5. Is there a large empty area below the recent cards? Must be NO.
6. Does the sidebar overlap or cover any hero text? Must be NO.
7. Is the background a real pixel-art scene image (not just a CSS gradient)? Must be YES.
8. Is the mentor character a real sprite asset (not CSS/SVG boxes)? Must be YES.
9. Does the right-side journey card fit within its grid column without overflow? Must be YES.

If any answer is wrong, fix it before moving to other pages.

---

## 19. Final North Star

CodeGraph should feel like opening a pixel-game map where a friendly senior engineer from the code village says:

`别怕，这个仓库我带你看。先看门道，再跑主线，最后把最值钱的一招带回家。`

---

## 20. Frontend Component Library (PixelStageKit)

A shared pixel-game component library exists at `frontend/src/components/common/PixelStageKit.tsx`. All learning stage pages MUST use these components instead of creating their own.

### Available Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `StageShell` | Page-level wrapper with optional background | `background: StageBackgroundKey` |
| `StageHero` | Top section: title, subtitle, mentor, speech bubble, progress | `stage, title, subtitle, background, mentor?, speech?, progress?` |
| `ProgressPill` | Pixel progress bar with percentage | `label, value` |
| `PixelAsset` | Renders a pixel sprite from the asset library | `asset: StageAssetKey, alt, className?, style?` |
| `SpeechBubble` | Pixel-style dialogue bubble | `children` |
| `ParchmentPanel` | Pixel card with title header and tone color | `title, icon?, tone?, children` |
| `ConceptCard` | Small card with pixel icon + title + body | `title, body, asset, tone?` |
| `FlowChain` | Horizontal flow diagram with numbered steps and arrows | `steps: {title, note, icon?}[], activeIndex?` |
| `TaskChecklist` | Quest-style checklist with green checkmarks | `title, tasks: string[]` |
| `RewardStrip` | "What you gained" strip with icons | `items: {label, detail, icon?}[]` |
| `CodeFoldPanel` | Collapsible code evidence sections | `sections: {title, lines, open?}[]` |
| `NextStageCard` | CTA card linking to next stage | `title, body, asset?` |

### Available Assets (StageAssetKey)

`mentorRunner`, `mentorMiner`, `mentorTrophy`, `woodArrowSign`, `routeArrowBlue`, `crystalMemoryPurple`, `crystalAgentBlue`, `crystalLoopGreen`, `campfireCrates`, `mineEntrance`, `badgeClipboard`, `badgeMap`

### Available Backgrounds (StageBackgroundKey)

`learningMap`, `mainflow`, `showcase`, `takeaway`

### Overview Page Assets (overviewAssets)

`mentor`, `woodBoard`, `bridge`, `chest`, `flag`, `flowers`, `grass`, `sign`, `stones`, `stump`

### Usage Rules

1. **Always import from PixelStageKit** — do not recreate pixel card styles manually.
2. **Do not modify PixelStageKit.tsx** — if you need a new variant, create it in your page file.
3. **Use `ParchmentPanel` for all info cards** — it provides consistent pixel styling with tone colors.
4. **Use `FlowChain` for any sequential flow** — it handles numbering, arrows, and active state.
5. **Use `StageHero` for every stage page top section** — it handles background, mentor, speech, progress.
6. **PixelLogo supports custom sizes** — pass any number (e.g., `size={42}` for sidebar).
7. **Styles are in index.css** — pixel stage component styles are already defined globally, do not duplicate.

### Import Pattern

```tsx
import {
  StageHero,
  ParchmentPanel,
  FlowChain,
  TaskChecklist,
  NextStageCard,
  ConceptCard,
  RewardStrip,
  CodeFoldPanel,
  PixelAsset,
} from '../components/common/PixelStageKit'
```

### Forbidden

- Do not hand-code pixel card borders/shadows when `ParchmentPanel` exists.
- Do not create a new flow diagram component when `FlowChain` exists.
- Do not generate new pixel sprites or backgrounds — use the asset library.
- Do not modify `PixelStageKit.tsx`, `stage-library/index.ts`, or `index.css`.

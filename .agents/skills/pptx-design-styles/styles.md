Title: Live Content

Description: Fetched live

Source: https://raw.githubusercontent.com/corazzon/pptx-design-styles/main/references/styles.md

---

# 30 Modern PPTX Design Styles — Reference Guide

Each style is documented with:
- **Background** — slide background color / gradient
- **Colors** — primary, secondary, accent with HEX values
- **Fonts** — title and body font recommendations with sizes
- **Layout** — slide composition approach
- **Signature Elements** — must-have design details for authenticity
- **Avoid** — common mistakes that break the style

---

## 01. Glassmorphism

**Mood**: Premium, tech, futuristic  
**Best For**: SaaS, app launches, AI product decks

### Background
- Deep 3-color gradient: `#1A1A4E → #6B21A8 → #1E3A5F`
- Or deep single-tone blue: `#0F0F2D`

### Colors
| Role | Color | HEX |
|------|-------|-----|
| Glass card fill | White translucent | `#FFFFFF` @ 15–20% opacity |
| Glass card border | White translucent | `#FFFFFF` @ 25% opacity |
| Title text | White | `#FFFFFF` |
| Body text | Soft white | `#E0E0F0` |
| Accent | Cyan or violet | `#67E8F9` or `#A78BFA` |

### Fonts
- Title: **Segoe UI Light / Calibri Light**, 36–44pt, bold
- Body: **Segoe UI**, 14–16pt, regular
- KPI numbers: 52–64pt bold

### Layout
- **Card-based**: use frosted-glass rectangles as content containers
- Rounded corners (radius 12–20px equivalent)
- Layer cards slightly offset and rotated ±5° for depth
- Add large blurred circles/ellipses behind cards for glow effect

### Signature Elements
- Translucent card (fill 15–20%, white border 25%)
- Blurred glow blobs in background
- All containers use the same glass treatment

### Avoid
- White backgrounds (kills the effect)
- Fully opaque cards
- Bright saturated solid colors

---

## 02. Neo-Brutalism

**Mood**: Bold, raw, provocative, startup energy  
**Best For**: Startup pitches, marketing campaigns, creative agencies

### Background
- High-saturation solid: Yellow `#F5F500`, Lime `#CCFF00`, Hot pink `#FF2D55`
- Or pure white `#FFFFFF`

### Colors
| Role | Color | HEX |
|------|-------|-----|
| Background | Primary yellow/lime | `#F5F500` or `#CCFF00` |
| Card fill | White or black | `#FFFFFF` / `#000000` |
| Border & shadow | Pure black | `#000000` |
| Accent | Red or blue | `#FF3B30` / `#0000FF` |
| Text | Black | `#000000` |

### Fonts
- Title: **Arial Black / Impact / Bebas Neue**, 40–56pt
- Body: **Courier New / Space Mono**, 13–16pt
- Numbers: 72–96pt Arial Black

### Layout
- **Thick black borders** on all elements (2–4pt solid black)
- **Hard offset shadow** bottom-right of every card (5–8pt, no blur)
- Slight intentional misalignment — tilted shapes allowed

### Signature Elements
- Hard drop shadow (no blur, pure black offset)
- Thick border on every element
- One oversized number or word breaking the layout

### Avoid
- Soft shadows or gradients
- Rounded corners
- Pastel or muted colors

---

## 03. Bento Grid

**Mood**: Modular, informational, Apple-inspired  
**Best For**: Feature comparisons, product overviews, data summaries

### Background
- Near-white: `#F8F8F2` or `#F0F0F0`

### Colors
| Role | Color | HEX |
|------|-------|-----|
| Background | Off-white | `#F8F8F2` |
| Cell 1 (dark) | Deep navy | `#1A1A2E` |
| Cell 2 (accent 1) | Bright yellow | `#E8FF3B` |
| Cell 3 (accent 2) | Coral red | `#FF6B6B` |
| Cell 4 (accent 3) | Teal | `#4ECDC4` |
| Cell 5 (warm) | Warm yellow | `#FFE66D` |

### Fonts
- Cell title: **SF Pro / Inter**, 18–24pt, semibold
- Cell body: **Inter**, 12–14pt, regular
- Large stat: 48–64pt bold in dark cell

### Layout
- CSS Grid-style layout: cells of different sizes spanning columns/rows
- Gap between cells: 8–12pt equivalent
- **Asymmetric merging**: one cell spans 2 columns, one spans 2 rows
- Each cell has one focused piece of info

### Signature Elements
- Asymmetric multi-size grid
- One dark anchor cell with white text
- Color-coded cells for visual hierarchy

### Avoid
- Equal-sized cells (boring)
- Too many colors (max 5)
- Dense text inside cells

---

## 04. Dark Academia

**Mood**: Scholarly, vintage, refined, literary  
**Best For**: Education, historical research, book presentations, university talks

### Background
- Deep warm dark brown: `#1A1208`
- Or `#0E0A05` for maximum drama

### Colors
| Role | Color | HEX |
|------|-------|-----|
| Background | Deep warm brown | `#1A1208` |
| Title text | Antique gold | `#C9A84C` |
| Body text | Warm parchment | `#D4BF9A` |
| Border / ornament | Dark gold | `#3D2E10` |
| Accent | Muted gold | `#8A7340` |

### Fonts
- Title: **Playfair Display Italic / Georgia Italic**, 36–48pt
- Body: **EB Garamond / Georgia**, 13–16pt
- Label: **Space Mono**, 9–11pt, wide letter-spacing

### Layout
- **Inset border frame** — thin gold border 12–20pt from slide edge
- Centered title with wide letter-spacing (6–10pt)
- Body text in serif, generous leading (1.6–1.8)
- Decorative horizontal rule line (thin, gold tint)

### Signature Elements
- Double inset border (outer + inner, slightly different widths)
- Italic serif title in gold
- Monospace footnote or date in muted gold

### Avoid
- Modern sans-serif fonts
- Bright or saturated colors
- Clean minimal layouts — add texture and decoration

---

## 05. Gradient Mesh

**Mood**: Artistic, vibrant, sensory, brand-forward  
**Best For**: Brand launches, creative portfolios, music/film promotions

### Background
- Multi-point radial gradient blend (4–6 colors overlapping)
- Example: `#FF6EC7` + `#7B61FF` + `#00D4FF` + `#FFB347` bleeding into each other

### Colors
| Role | Color | HEX |
|------|-------|-----|
| Mesh node 1 | Hot pink | `#FF6EC7` |
| Mesh node 2 | Violet | `#7B61FF` |
| Mesh node 3 | Cyan | `#00D4FF` |
| Mesh node 4 | Warm orange | `#FFB347` |
| Text | Pure white | `#FFFFFF` |

### Fonts
- Title: **Bebas Neue / Barlow Condensed ExtraBold**, 48–72pt
- Body: **Outfit / Poppins Light**, 14–16pt
- All text white with subtle drop shadow for legibility

### Layout
- Full-bleed gradient as background
- Minimal text overlay — let the gradient breathe
- Large centered title, small subtitle below
- Optional: frosted glass card for body text

### Signature Elements
- Multi-radial gradient that feels painterly, not linear
- White text with drop shadow
- Large typographic element dominating

### Avoid
- Linear two-color gradients (too plain)
- Dark or muted text
- Overcrowded layouts

---

## 06. Claymorphism

**Mood**: Friendly, soft 3D, tactile, playful  
**Best For**: Product launches, education, children's content, app UI decks

### Background
- Warm pastel gradient: `#FFECD2 → #FCB69F` or `#E0F7FA → #B2EBF2`

### Colors
| Role | Color | HEX |
|------|-------|-----|
| Background | Warm peach gradient | `#FFECD2` → `#FCB69F` |
| Clay element 1 | Soft teal | `#A8EDEA` |
| Clay element 2 | Blush pink | `#FED6E3` |
| Clay element 3 | Warm yellow | `#FFEAA7` |
| Shadow | Color-matched shadow | element color @ 50%, offset 8–12pt down |

### Fonts
- Title: **Nunito ExtraBold / Rounded Mplus**, 32–48pt
- Body: **Nunito / DM Sans**, 14–16pt
- Icon labels: 11–13pt medium

### Layout
- **3D rounded shapes** as primary containers (radius 20–32pt equivalent)
- Each element casts a **colored drop shadow** (same hue, shifted down, no X offset)
- Inner highlight on top edge (white, 30% opacity)
- Playful asymmetric arrangement of clay bubbles

### Signature Elements
- Colored soft shadow (not grey) matching element color
- Very high border radius
- Inner highlight stripe at top of each element

### Avoid
- Sharp corners
- Grey/neutral shadows
- Flat design elements mixed in

---

## 07. Swiss International Style

**Mood**: Functional, authoritative, timeless, corporate  
**Best For**: Consulting, finance, government, institutional presentations

### Background
- Pure white: `#FFFFFF`
- Or off-white: `#FAFAFA`

### Colors
| Role | Color | HEX |
|------|-------|-----|
| Background | White | `#FFFFFF` |
| Primary text | Near-black | `#111111` |
| Accent bar | Signal red | `#E8000D` |
| Secondary text | Dark grey | `#444444` |
| Divider line | Light grey | `#DDDDDD` |

### Fonts
- Title: **Helvetica Neue Bold / Arial Bold**, 32–44pt, tight leading
- Body: **Helvetica Neue / Arial**, 12–14pt
- Labels/captions: **Space Mono**, 9–10pt, 3–4pt letter-spacing

### Layout
- Strict **5-column or 12-column grid** — every element snaps to columns
- **Vertical red rule** on left edge (4–8pt wide stripe)
- Single horizontal divider rule at mid-slide
- Circle accent element (red outline) in lower-right zone

### Signature Elements
- Left-edge vertical red bar
- Horizontal rule dividing title from content
- Grid-aligned text blocks with generous margins

### Avoid
- Decorative or illustrative elements
- Rounded corners
- More than 2 fonts

---

## 08. Aurora Neon Glow

**Mood**: Futuristic, AI, electric, otherworldly  
**Best For**: AI products, cybersecurity, deep tech, innovation summits

### Background
- Near-black deep space: `#050510` or `#020208`

### Colors
| Role | Color | HEX |
|------|-------|-----|
| Background | Deep space black | `#050510` |
| Glow 1 | Neon green | `#00FF88` |
| Glow 2 | Electric violet | `#7B00FF` |
| Glow 3 | Cyan | `#00B4FF` |
| Title gradient | Green → cyan → violet | multi-stop |
| Body text | Soft white | `#D0D0F0` |

### Fonts
- Title: **Bebas Neue / Barlow Condensed**, 44–60pt, wide letter-spacing 4–8pt
- Body: **DM Mono / Space Mono**, 12–14pt
- Gradient text clip on title

### Layout
- Large blurred glow blobs (filter blur 30–50pt) in background corners
- Centered or left-aligned title with gradient text effect
- Body on semi-transparent dark panel
- Optional scan-line texture overlay (5% opacity)

### Signature Elements
- Blurred neon glow circles (not sharp shapes)
- Gradient text (green → cyan → violet)
- Dark panel for body text legibility

### Avoid
- White or light backgrounds
- Solid non-glowing colors
- Dense body text without panels

---

## 09. Retro Y2K

**Mood**: Nostalgic, pop, chaotic fun, millennium energy  
**Best For**: Events, lifestyle marketing, fashion, creative campaigns

### Background
- Navy blue: `#000080`
- Or electric blue: `#0020C2`

### Colors
| Role | Color | HEX |
|------|-------|-----|
| Background | Navy | `#000080` |
| Rainbow stripe | Full spectrum | gradient: `#FF0080 → #FFFF00 → #00FF00 → #00FFFF → #0000FF → #FF00FF` |
| Title text | White | `#FFFFFF` |
| Title glow | Cyan + magenta shadow | `#00FFFF` / `#FF00FF` |
| Star accent | Yellow | `#FFFF00` |

### Fonts
- Title: **Bebas Neue / Impact**, 36–52pt
- Body: **VT323 / Space Mono**, 12–14pt
- Double text shadow: 2px cyan + 2px magenta offset

### Layout
- **Rainbow stripe bars** top and bottom (6–8pt height)
- Star/sparkle icons in corners (✦ ★)
- Title centered with double text shadow
- Optional: spinning star animation placeholder

### Signature Elements
- Rainbow gradient stripe bars
- Double-color text shadow (cyan + magenta)
- Star/sparkle motifs

### Avoid
- Minimalist layouts
- Muted or desaturated colors
- Serif fonts

---

## 10. Nordic Minimalism

**Mood**: Calm, natural, considered, Scandinavian  
**Best For**: Wellness, lifestyle, non-profit, sustainable brands

### Background
- Warm cream: `#F4F1EC` or `#F0EDE8`

### Colors
| Role | Color | HEX |
|------|-------|-----|
| Background | Warm cream | `#F4F1EC` |
| Organic shape | Warm grey | `#D9CFC4` |
| Primary text | Dark warm brown | `#3D3530` |
| Secondary text | Taupe | `#8A7A6A` |
| Accent dot | Deep brown | `#3D3530` |

### Fonts
- Title: **Canela / Freight Display / DM Serif Display**, 36–52pt, light weight
- Body: **Inter Light / Lato Light**, 13–15pt
- Caption: **Space Mono**, 9–10pt, 4–6pt letter-spacing

### Layout
- **Generous whitespace** — at least 40% of slide is empty
- One organic blob shape as background texture (low opacity, grey-beige)
- Minimal dot accent (3 dots in different brown tones) top-left corner
- Thin horizontal rule near bottom, then caption text

### Signature Elements
- Organic blob background shape
- 3-dot color accen


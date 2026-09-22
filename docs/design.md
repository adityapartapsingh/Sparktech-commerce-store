# Design System Specification: Obsidian Telemetry

## 1. Design Philosophy & Core Principles

The **"Obsidian Telemetry"** design system is engineered to reflect high-precision robotics, aerospace instrumentation, and laboratory-grade electronic hardware. It rejects the generic "AI startup template" tropes—meaningless neon gradients, bloated floating blobs, and fake cartoon robots—in favor of functional, tactile, and mathematically disciplined aesthetics.

### Key Design Pillars:
1. **Instrumented Authenticity**: Visual elements evoke physical benchtop oscilloscopes, avionics consoles, and cleanroom hardware racks.
2. **Zero-Latency Information Density**: Engineers scan by part number (`ESP32-WROOM-32`), voltage (`3.3V / 5V`), pin count, and interface (`SPI / I2C / UART`). Visual hierarchy emphasizes clarity over fluff.
3. **Tactile Micro-interactions**: Buttons, switches, and tabs react with crisp, physics-based springs using Framer Motion.
4. **Mobile Ergonomic Parity**: Adopts proven conversion patterns from Amazon and Flipkart (thumb-zone sticky CTA bar, instant drawer cart) without sacrificing technical depth.

---

## 2. Color Palette & Design Tokens

### Dark Theme (Primary Hardware Mode)

| Token Name | Hex Code | Purpose / Application |
| :--- | :--- | :--- |
| `--bg-primary` | `#0B0F17` | Canvas base, anti-static cleanroom obsidian |
| `--bg-secondary`| `#0F172A` | Substrate background, container panels |
| `--bg-card` | `#111827` | Primary instrument card background |
| `--bg-elevated` | `#161F30` | Active surface, input backgrounds, modal surfaces |
| `--bg-hover` | `#1E293B` | Interactive hover states |
| `--accent-blue` | `#2563EB` | Precision Cyber Blue — primary actions, focus rings |
| `--accent-emerald`| `#10B981` | Phosphor Emerald — operational status, live telemetry |
| `--accent-amber` | `#F59E0B` | Solder Flux Amber — stock warnings, pending alerts |
| `--accent-red` | `#EF4444` | Thermal / Overvoltage Red — errors, critical alerts |
| `--text-primary` | `#F8FAFC` | High-contrast matte white text |
| `--text-secondary`| `#94A3B8` | Slate telemetry readouts and helper copy |
| `--text-muted` | `#64748B` | Blueprint grid markings, secondary metadata |
| `--border` | `rgba(51, 65, 85, 0.45)` | 1px structural boundary lines |
| `--border-accent`| `rgba(37, 99, 235, 0.45)` | Active trace glow border |

### Light Theme (Benchtop Documentation Mode)

| Token Name | Hex Code | Purpose / Application |
| :--- | :--- | :--- |
| `--bg-primary` | `#F5F5FA` | Laboratory white canvas |
| `--bg-secondary`| `#FFFFFF` | Primary white cards |
| `--text-primary` | `#111118` | Crisp black text |
| `--text-secondary`| `#52526B` | Charcoal secondary text |
| `--border` | `rgba(0, 0, 0, 0.08)` | Subtle boundary line |

---

## 3. Typography Hierarchy

The typographic stack balances editorial readability with technical data precision:

```
Headings & Brand:        Outfit / Space Grotesk (700, 800)
Interface & Body:        Inter (400, 500, 600)
Telemetry, Specs & Code: JetBrains Mono (400, 500, 600)
```

| Text Style | Font Family | Size | Weight | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | Outfit | 2.5rem (40px) | 800 | -0.02em | Hero banner statements |
| `h1` | Inter | 1.75rem (28px) | 700 | -0.02em | Page headers, modal titles |
| `h2` | Inter | 1.35rem (22px) | 600 | -0.01em | Section titles, card groups |
| `body-md` | Inter | 0.95rem (15px) | 400 | normal | Descriptions, body copy |
| `telemetry-badge` | JetBrains Mono | 0.72rem (11px) | 600 | +0.06em | Status chips (`LIVE // LINKED`) |
| `spec-data` | JetBrains Mono | 0.82rem (13px) | 500 | normal | Voltage ratings, IC part serials |

---

## 4. UI/UX Components Architecture

### 4.1 Hardware Panel (`.hardware-panel`)
- Engineered glassmorphic composite substrate:
  ```css
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(51, 65, 85, 0.45);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  ```

### 4.2 Precision CAD Crosshairs (`.cad-crosshair`)
- Monospaced `+` crosshairs located at the 4 corners of primary cards (`top-left`, `top-right`, `bottom-left`, `bottom-right`), providing subtle blueprint alignment cues.

### 4.3 Telemetry Status Badges (`.badge-telemetry`)
- Compact monospaced indicators featuring animated pulsating signal dots (`.pulse-dot`):
  - `.emerald`: `GATEWAY // OPERATIONAL`
  - `.blue`: `256-BIT ENCRYPTED`

### 4.4 Animated PCB Circuit Canvas (`<CircuitBackground />`)
- Vector SVG component with:
  - 32px blueprint grid pattern.
  - 45-degree angle PCB traces (left & right flanks).
  - Micro-vias (circular solder nodes) with pulsating green/blue signals.
  - Signal current photons traveling along power rails using Framer Motion.

### 4.5 Mobile Sticky Action Bar (`.sticky-bottom-action-bar`)
- Fixed bottom navigation bar on screens `<768px`:
  - Displays current unit price and in-stock indicator.
  - Provides quick "Add to Cart" icon and full-width "Buy Now" CTA within thumb-reach.

---

## 5. UI/UX Laws Implemented

| Law | Implementation in SparkTech |
| :--- | :--- |
| **Jakob's Law** | Preserves familiar shopping conventions from Amazon and Flipkart: persistent sticky cart drawer, 1-tap "Buy Now", and recognizable review distributions. |
| **Hick's Law** | Eliminates choice paralysis during authentication: removed 6-field email/password registration in favor of 1-tap Google & GitHub OAuth. |
| **Fitts's Law** | Pinned primary conversion buttons to the bottom 64px mobile thumb-zone with minimum 48px tap targets. |
| **Miller's Law** | Divided dense component technical specifications into 5 structured categories (Power/Voltage, MCU Core, Memory, Interfaces, Physical Dimensions). |
| **Aesthetic-Usability Effect** | Clean laboratory layout, subtle animated circuit traces, and RoHS/CE badges instill trust that parts are authentic and pre-tested. |
| **Doherty Threshold** | Instant optimistic cart updates, <200ms modal open/close animations, and fast TanStack React Query caching ensure zero perceived latency. |

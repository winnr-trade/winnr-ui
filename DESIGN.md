# Design System Strategy: The Kinetic Forest

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Kinetic Forest."** 

In a prediction market, users require the absolute stability of a deep-rooted institution (The Forest) paired with the high-velocity, electric energy of real-time gains (The Kinetic). This system rejects the "standard dashboard" aesthetic in favor of a high-end, editorial experience. We break the rigid grid through **intentional asymmetry**, where data-heavy modules are offset by expansive, breathable "brand moments" using large-scale typography. 

The goal is to move away from "flat UI" and toward a multi-layered, tactile environment that feels like a premium physical device—where depth is communicated through light and transparency rather than lines and boxes.

---

## 2. Colors: The Monochromatic Spectrum
We utilize a monochromatic green palette to establish a singular, powerful brand identity. By removing the distraction of a multi-color wheel, we force the user to focus on **luminance** as the primary indicator of value and action.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Structural boundaries must be defined solely through background color shifts. 
- A card should not have a border; it should be a `surface-container-high` element sitting on a `surface` background. 
- Use the 1.3rem (`spacing-6`) or 1.75rem (`spacing-8`) gaps to let the background "bleed" through, creating natural separation.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, semi-translucent plates.
- **Base Layer:** `surface` (#0c160c) – The deep, forest floor.
- **Sectioning:** `surface-container-low` (#141e14) – Subsurface regions.
- **Interactive Elements:** `surface-container-high` (#222d22) – Raised tactile surfaces.
- **Floating/Active:** `surface-bright` (#313c31) – Elements requesting immediate attention.

### The "Glass & Gradient" Rule
To achieve a "gamified" premium feel, use Glassmorphism for floating overlays (Modals, Hover Tooltips). Use a `surface-variant` color at 60% opacity with a `backdrop-filter: blur(20px)`. 
**Signature Texture:** For primary CTAs, apply a linear gradient from `primary_fixed` (#9ffb06) to `secondary_fixed_dim` (#91d78a) at a 135-degree angle. This creates a "glow" that feels liquid and alive.

---

## 3. Typography: Authority Meets Precision
The system uses a dual-font strategy to balance brand character with data density.

*   **Display & Headlines (Space Grotesk):** This is our "Character" font. It is wide, bold, and modern. Use `display-lg` (3.5rem) for major market outcomes and `headline-md` (1.75rem) for section titles. Its geometric nature feels "engineered," reinforcing the "serious" aspect of the prediction market.
*   **Body & Titles (Manrope):** A high-readability sans-serif. Used for the "serious" work—market descriptions, terms, and conditions.
*   **Data & Labels (Inter):** Reserved for the high-density dashboard. Inter’s tall x-height and neutral personality ensure that even at `label-sm` (0.6875rem), numeric data remains surgical and clear.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too "dirty" for this clean, green aesthetic. We use **Luminous Depth**.

*   **The Layering Principle:** Instead of a drop shadow, elevate an element by moving it one step up the surface-container tier. An active market card should move from `surface-container-low` to `surface-container-highest`.
*   **Ambient Shadows:** If a floating state (like a dropdown) requires a shadow, use a large 40px blur with 8% opacity using the `on-secondary-fixed` color (#002203). This creates a dark-green ambient occlusion rather than a grey shadow, maintaining the "all green" theme.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-contrast modes), use the `outline-variant` (#414a34) at 15% opacity. It should be felt, not seen.
*   **Winning States:** When a prediction is successful, apply an outer glow using `primary_container` (#9ffb06) with a spread of 15px and a 30% opacity, accompanied by a subtle pulse animation.

---

## 5. Components

### Buttons
*   **Primary:** No border. Background: `primary_fixed` (#9ffb06). Text: `on-primary-fixed` (#102000). Use `rounded-md` (0.375rem). On hover, add a subtle box-shadow glow of the same color.
*   **Secondary (Tactile):** Background: `secondary_container` (#0f5518). Text: `on-secondary-container` (#84c97d).
*   **Tertiary:** Ghost style. No background. `label-md` weight. Text: `primary_fixed`.

### Input Fields
*   **Standard State:** Background: `surface-container-lowest`. No border. Bottom-heavy padding (`spacing-4`).
*   **Active State:** Background: `surface-container-low`. A 2px bottom-border of `primary_fixed` is the only "line" allowed in the system.

### Cards & Dashboards
*   **The Data Grid:** Markets are displayed in cards using `surface-container-high`. 
*   **No Dividers:** Separate "Current Odds" from "Volume" using a 1.1rem (`spacing-5`) vertical gap and a slight weight change in the Inter font.
*   **Predictive Sliders:** Use a `tertiary_container` track with a `primary_fixed` thumb. The thumb should have a small `primary_fixed` glow to make it feel "charged."

### High-Density Market Ticker
A custom component for this system. A horizontal scrolling list of `surface-container-highest` chips. It uses `label-sm` for the asset name and `title-sm` (Manrope) for the price, creating a clear "Editorial" hierarchy within a small space.

---

## 6. Do's and Don'ts

### Do
*   **Use Asymmetry:** Offset your headline `display-md` to the left while keeping data right-aligned to create an editorial, high-end feel.
*   **Embrace Dark Space:** Use `surface` (#0c160c) generously. The "Forest" needs depth to make the "Kinetic" neon pops feel valuable.
*   **Layer Surfaces:** Always place a "High" container on a "Low" container to create hierarchy.

### Don't
*   **Don't use 100% White:** Even "white" text should be `on-surface` (#dae6d6), which is a very pale green-grey, to keep the palette harmonious.
*   **Don't use sharp corners:** While serious, the system is tactile. Stick to the `md` (0.375rem) or `lg` (0.5rem) roundedness scale. 
*   **Don't use standard Dividers:** If you feel the need to draw a line, try adding `0.4rem` of whitespace instead. If that fails, use a subtle background shift.
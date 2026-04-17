# Design System Strategy: Veridian Frost
 
## 1. Overview & Creative North Star
**The Creative North Star: "The Kinetic Glade"**
 
This design system moves beyond traditional dashboard aesthetics to create a high-end, editorial environment that feels like a precision instrument forged in a digital forest. We are blending the "serious and professional" with a "sophisticated gamification" layer. The goal is "Kinetic Forest"—a UI that feels alive and deep, yet remains coolly analytical.
 
We break the "template" look through:
*   **Asymmetric Precision:** Avoiding perfectly centered layouts in favor of intentional, high-contrast white space and off-grid typography placement.
*   **Atmospheric Depth:** Using a "Veridian Frost" palette to create a sense of environmental layering, as if the UI is viewed through sheets of chilled glass in a twilight grove.
*   **High-Tech Editorial:** Large, aggressive `display` type paired with utilitarian `label` styles to create a hierarchy that feels like a premium financial or performance-tracking journal.
 
---
 
## 2. Colors & Surface Philosophy
The palette is rooted in the depth of deep teals (`#07100e`) contrasted against the crystalline vibrance of mint highlights (`#acead3`).
 
### The "No-Line" Rule
**Lines are prohibited for sectioning.** We do not use 1px borders to separate content. Boundaries must be defined strictly through:
*   **Tonal Shifts:** Placing a `surface-container-low` component on a `surface` background.
*   **Negative Space:** Using the spacing scale to create clear mental models of content grouping.
 
### Surface Hierarchy & Nesting
Treat the UI as a series of nested physical layers. 
*   **Base:** `surface` (#07100e)
*   **Lowered Areas:** `surface-container-low` (#0b1513) for recessed backgrounds.
*   **Floating Elements:** `surface-container-highest` (#1b2825) for high-priority cards.
*   **Interactive Layers:** Use `surface-bright` (#212f2c) to indicate active or "lit" zones within the dark environment.
 
### The "Glass & Gradient" Rule
To achieve the "Frost" aesthetic, floating elements should utilize **Glassmorphism**. Apply `surface-variant` with a 60-80% opacity and a 16px-24px `backdrop-blur`. 
**Signature Texture:** Primary CTAs should not be flat. Use a linear gradient (135°) from `primary` (#acead3) to `primary-container` (#70ac97) to provide a metallic, high-tech sheen.
 
---
 
## 3. Typography
The type system is a dialogue between the technical geometry of **Space Grotesk** and the humanistic clarity of **Manrope**.
 
*   **Space Grotesk (Display/Headline/Label):** Used for "The Machine." This is your data, your scores, and your high-impact statements. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero moments to command authority.
*   **Manrope (Title/Body):** Used for "The Narrative." This handles descriptions and long-form content. It provides the "professional" counterbalance to the high-tech display face.
 
**Hierarchy Tip:** Use `label-md` in Space Grotesk with `letter-spacing: 0.1em` and `text-transform: uppercase` for all category headers to reinforce the "instrumental" feel.
 
---
 
## 4. Elevation & Depth
In this system, elevation is a function of light and tone, not structure.
 
*   **Tonal Layering:** Depth is achieved by "stacking" the tiers. A `surface-container-lowest` card placed on a `surface-container-low` section creates a natural "drop" without a single line of CSS border.
*   **Ambient Shadows:** Use shadows sparingly. When required, use a large blur (32px+) and low opacity (6%). The shadow color must be a tinted dark teal (`#000000` with a hint of `primary_dim`) rather than neutral grey.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at **15% opacity**. This creates a suggestion of an edge that feels integrated into the "Frost" atmosphere.
 
---
 
## 5. Components
 
### Buttons
*   **Primary:** Gradient of `primary` to `primary-container`. `radius-sm` (0.125rem) for a sharp, professional edge. Text is `on-primary-container`.
*   **Secondary:** Ghost style. `outline` color at 20% opacity. On hover, fills to `surface-bright`.
*   **Kinetic State:** On click, use a subtle `primary` outer glow (4px blur) to simulate a "power-on" state.
 
### Input Fields
*   **Styling:** No borders. Use `surface-container-high` as the background. 
*   **Active State:** A bottom-only 2px bar of `primary`.
*   **Error:** Use `error_dim` (#d7383b) for the accent, never a full red box.
 
### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Implementation:** Use a 4px vertical bar of `secondary` on the left side of a list item to indicate selection or "active" status. Use `surface-container-low` and `surface-container-high` to distinguish between alternating list items.
 
### Chips
*   **Visual:** Pill-shaped (`radius-full`). 
*   **Style:** `surface-variant` background with `on-surface-variant` text. High-contrast mint `primary` text for "success" or "active" chips.
 
### Additional Component: The "Progress Glade"
A custom progress visualization. Instead of a standard bar, use a series of vertical dashes using the `primary` token, where the background "glows" using a `primary_container` blur effect behind the current progress point.
 
---
 
## 6. Do's and Don'ts
 
### Do
*   **Do** use asymmetrical margins. A 2/3 vs 1/3 grid split creates a high-end editorial feel.
*   **Do** embrace the dark. Ensure `surface` (#07100e) is the dominant color to make `primary` highlights feel truly "kinetic."
*   **Do** use `radius-sm` for most containers. Sharp corners feel more "professional" and "serious" than rounded ones.
 
### Don't
*   **Don't** use 100% white. Use `on-surface` (#f4fffa) for text; it is a soft mint-white that prevents eye strain in dark mode.
*   **Don't** use pure black shadows. They muddy the deep teal tones of the "Veridian Frost."
*   **Don't** use standard icons. Use "Thin" or "Light" weight stroke icons to match the refined Space Grotesk typeface.ce.
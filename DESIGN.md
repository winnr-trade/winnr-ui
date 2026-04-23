---
name: Winnr Core
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0em
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  data-mono:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: -0.01em
spacing:
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  gutter: 1px
  margin-page: 24px
---

## Brand & Style

This design system is built for high-performance environments where speed of cognition is the primary metric. The aesthetic is "Technological Realism"—a fusion of minimalist utility and futuristic precision. It avoids all decorative "fluff" such as glows, blurs, or unnecessary gradients in favor of absolute clarity and high data density.

The target audience consists of power users who require zero friction when scanning complex datasets. The emotional response is one of controlled authority and surgical efficiency. The style leverages a **Hard-Edge Minimalism** movement, utilizing structural lines and a monochrome base to elevate the importance of critical data signals.

## Colors

The palette is strictly functional. It utilizes a "Void Black" base to maximize contrast with white typography and sharp borders. 

- **Neutral Scale:** Deep blacks (#000000) for backgrounds, with subtle grey steps (#0A0A0A, #1A1A1A) to define surface hierarchy. 
- **Semantic Signals:** Emerald (#10B981) and Rose (#F43F5E) are used exclusively for status indicators and data movement. They are applied as solid fills or thin 1px strokes; no glows or outer shadows are permitted.
- **Accents:** Secondary actions use a mid-tone grey (#262626) to remain subordinate to primary white elements.

## Typography

The typographic hierarchy separates "Information Structure" from "Content Consumption." 

- **Space Grotesk** is used for headlines, labels, and data points. Its technical, geometric character reinforces the futuristic aesthetic. 
- **Manrope** is utilized for body text to ensure readability over long periods. 
- **Data Density:** Use the `label-caps` style for all metadata and section headers to maintain a compact vertical footprint. `data-mono` (Space Grotesk) should be used for all numerical values to ensure alignment in tables and lists.

## Layout & Spacing

This design system employs a **Modular Grid** layout. Rather than traditional soft whitespace, it uses "Structural Spacing" defined by 1px borders.

- **The 1px Rule:** Layout sections are separated by 1px borders (#262626) instead of margins wherever possible to maximize data real estate.
- **Density:** Padding is kept tight (8px to 12px for container internals) to ensure the maximum amount of information is visible above the fold.
- **Rhythm:** All spacing must be a multiple of 4px.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Sharp Borders**. 

1. **Base Layer (#000000):** Application background.
2. **Surface Layer (#0A0A0A):** Cards, tables, and sidebars.
3. **Overlay Layer (#1A1A1A):** Modals or active dropdowns.

Shadows are strictly prohibited. Visual separation is created solely through 1px solid strokes in `#262626`. When an element is focused or active, the border shifts to `#FFFFFF` (Primary) or the relevant semantic color (Emerald/Rose). This creates a "latched" look common in high-end hardware interfaces.

## Shapes

The shape language is **Zero-Radius**. Every element—from buttons and input fields to large cards and windows—must have 0px corner radius. This reinforces the "sharp," futuristic, and industrial tone of the system. Visual interest is generated through geometric alignment and line-work rather than organic curves.

## Components

- **Buttons:** Rectangular with 0px radius. Primary buttons are solid White with Black text. Secondary buttons are Ghost style with a 1px Grey stroke.
- **Inputs:** Solid #0A0A0A background with a 1px bottom stroke (#262626) that transforms into a full 1px box stroke on focus.
- **Data Cells:** High-density rows with 1px dividers. Use `data-mono` for all numerical values. Status signals use a 4x4px solid square icon (no circles).
- **Checkboxes:** Square, 0px radius. When active, they are solid White with a Black checkmark.
- **Navigation:** Vertical orientation, utilizing thin lines to separate categories. Active states are indicated by a 2px vertical "tick" on the far left of the item.
- **Chips/Badges:** Small, rectangular, with a 1px stroke. No background fill unless indicating a critical error (Solid Rose).
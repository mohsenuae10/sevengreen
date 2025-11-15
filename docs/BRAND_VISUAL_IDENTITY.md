# 🎨 الهوية البصرية لمتجر "لمسة الجمال"

## الألوان الرئيسية

### Primary Color - Mauve Elegance (موف أنيق)
- Default: `#B04D8C` - `hsl(320 30% 50%)`
- Light: `#CC80B3` - `hsl(320 35% 65%)`
- Dark: `#7A3359` - `hsl(320 25% 35%)`

### Accent Color - Creamy Gold (ذهبي كريمي)
- Default: `#EAD5BA` - `hsl(35 50% 85%)`

### Secondary Color - Soft Mauve (موف ناعم)
- Default: `#F5F0F3` - `hsl(320 15% 95%)`

## Gradients

### 1. Primary Gradient
```css
background: linear-gradient(135deg, #CC80B3 0%, #B04D8C 100%);
/* From Light Mauve to Primary Mauve */
```

### 2. Soft Gradient
```css
background: linear-gradient(180deg, #CC80B3 0%, #D999BB 100%);
/* Subtle light mauve variations */
```

### 3. Card Gradient
```css
background: linear-gradient(135deg, #F5F0F3 0%, #EDE5EA 100%);
/* Soft background for cards and sections */
```

### 4. Hero Gradient
```css
background: linear-gradient(135deg, #7A3359 0%, #B04D8C 50%, #CC80B3 100%);
/* Dark to light mauve for hero sections */
```

## Visual Style

### Brand Personality
- **Mood:** Sophisticated, feminine, luxurious
- **Style:** Modern elegance meets natural beauty
- **Target:** Premium cosmetics shoppers seeking natural products
- **Feeling:** Refined, trustworthy, elegant yet approachable

### Design Elements

#### Typography
- **Headings:** Bold, elegant, with proper hierarchy
- **Body:** Clean, readable, professional
- **Arabic:** Properly supported with natural RTL flow

#### Imagery
- **Photography Style:** Professional, soft lighting, dreamy atmosphere
- **Color Treatment:** Purple/lavender botanicals, gold accents
- **Composition:** Clean, minimalist, premium aesthetic
- **Lighting:** Soft, natural, with sophisticated atmosphere

#### Botanical Elements
- ✅ Lavender flowers
- ✅ Purple petals
- ✅ Mauve-toned leaves
- ✅ Soft botanical textures
- ❌ Green plants (unless specifically needed)
- ❌ Bright/neon colors
- ❌ Earth tones (browns, beiges)

## Usage Guidelines

### For AI Image Generation

When generating images for categories or promotional banners:

#### ✅ DO USE:
- Mauve/purple tones as primary colors (#B04D8C, #CC80B3, #7A3359)
- Creamy gold accents for luxury touch (#EAD5BA)
- Lavender, purple flowers, and botanicals
- Soft gradients from light to dark mauve
- Dreamy, sophisticated lighting
- Professional photography style
- Clean, minimalist compositions

#### ❌ DON'T USE:
- Green, beige, or earth tones
- Bright neon or fluorescent colors
- Cold blues or warm oranges
- Busy or cluttered compositions
- Generic stock photo aesthetics
- Text or logos in generated images

### Color Combinations

#### Primary Combination (High Contrast)
```
Background: #F5F0F3 (Soft Mauve)
Text/Elements: #7A3359 (Dark Mauve)
Accents: #EAD5BA (Creamy Gold)
```

#### Gradient Combination
```
Start: #CC80B3 (Light Mauve)
Middle: #B04D8C (Primary Mauve)
End: #7A3359 (Dark Mauve)
Highlight: #EAD5BA (Creamy Gold)
```

#### Card/Section Combination
```
Background: linear-gradient(#F5F0F3, #EDE5EA)
Border: #CC80B3 (Light Mauve)
Text: #7A3359 (Dark Mauve)
Icon/Badge: #EAD5BA (Creamy Gold)
```

## Technical Implementation

### CSS Variables (from index.css)
```css
--primary: 320 30% 50%;           /* #B04D8C */
--primary-glow: 320 35% 65%;      /* #CC80B3 */
--primary-dark: 320 25% 35%;      /* #7A3359 */
--accent: 35 50% 85%;             /* #EAD5BA */
--muted: 320 15% 95%;             /* #F5F0F3 */
```

### Tailwind Classes
```html
<!-- Primary Colors -->
<div class="bg-primary text-primary-foreground">
<div class="bg-primary-glow text-primary-dark">

<!-- Gradients -->
<div class="bg-gradient-primary">
<div class="bg-gradient-subtle">

<!-- Accents -->
<div class="bg-accent text-accent-foreground">
<div class="border-accent shadow-elegant">
```

## Brand Applications

### Category Banners
- Size: 1920x640 pixels
- Mauve gradient backgrounds
- Purple/lavender botanical elements
- Gold accents for premium feel
- No text in image (added programmatically)

### Promotional Banners
- Size: 1536x512 pixels
- Bold mauve color schemes
- Product integration with brand colors
- Strategic space for text overlay
- Sophisticated, luxury aesthetic

### Product Photography
- Soft mauve backgrounds or gradients
- Natural lighting with purple/lavender props
- Gold accents for premium products
- Clean, elegant presentation

## Quality Standards

### Image Generation
- ✅ Ultra high resolution
- ✅ Professional photography quality
- ✅ Consistent brand colors
- ✅ Sophisticated composition
- ✅ No text or logos in generated images

### Color Accuracy
- ✅ Use exact hex codes when possible
- ✅ Maintain gradient directions
- ✅ Ensure proper contrast ratios
- ✅ Test on light and dark backgrounds

### Brand Consistency
- ✅ All images follow mauve/gold palette
- ✅ Botanical elements are purple/lavender toned
- ✅ Professional, luxury aesthetic maintained
- ✅ Cohesive visual identity across all touchpoints

---

## Quick Reference Card

| Element | Primary Color | Accent | Background |
|---------|--------------|--------|------------|
| Headers | #7A3359 | #EAD5BA | #F5F0F3 |
| Buttons | #B04D8C | #EAD5BA | - |
| Cards | #CC80B3 | #EAD5BA | #F5F0F3 |
| Gradients | #CC80B3→#B04D8C | #EAD5BA | - |

**Last Updated:** November 2024  
**Version:** 1.0  
**Brand:** لمسة الجمال | Lamset Beauty

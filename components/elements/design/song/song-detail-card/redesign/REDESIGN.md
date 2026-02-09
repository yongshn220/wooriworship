# Song Detail Page - Complete Redesign

## Design Philosophy: "Concert Hall"

A complete reimagining of the Song Detail experience with a focus on **premium quality**, **music sheet clarity**, and **sophisticated interactions**.

---

## Design Direction

**Aesthetic:** Luxury/Refined + Editorial/Magazine

**Core Principles:**
1. **Sheet Music is Hero** - Full-bleed, distraction-free viewing
2. **Auto-hiding UI** - Controls fade away to let the sheet breathe
3. **Premium Interactions** - Smooth animations, thoughtful transitions
4. **Editorial Typography** - Magazine-style metadata presentation
5. **Spatial Intelligence** - Side-by-side layout on larger screens

---

## Key Features

### 1. Auto-Hiding Controls ✨
- Controls automatically appear on interaction
- Fade out after 3 seconds of inactivity
- Keeps focus on the music sheet
- Smart: shows immediately on touch/mouse move

```tsx
// Auto-hide mechanism
const showControls = () => {
  setControlsVisible(true);
  clearTimeout(hideTimeout.current);
  hideTimeout.current = setTimeout(() => {
    setControlsVisible(false);
  }, 3000);
};
```

### 2. Floating UI Elements
All interactive controls float over the content with glassmorphism:

- **Top-right:** Key selector (with dropdown for multiple keys)
- **Bottom-center:** Page navigation (multi-page only)
- **Top-left:** Zoom indicator + reset button (when zoomed)
- **Top-center:** Title (auto-hiding header)

Design details:
- `bg-background/95 backdrop-blur-xl` - Premium glassmorphism
- `shadow-toss` / `shadow-toss-lg` - Soft, premium shadows
- `rounded-full` - Pill-shaped controls for modern feel
- Smooth fade animations with Framer Motion

### 3. Responsive Layout

**Mobile (default):**
```
┌─────────────────┐
│   Sheet Viewer  │ (full screen)
│                 │
│   (pull up →)   │
│   Metadata      │
└─────────────────┘
```

**Desktop (md+):**
```
┌──────────────┬──────────┐
│              │          │
│   Sheet      │ Metadata │
│   Viewer     │ Sidebar  │
│   (60%)      │  (40%)   │
│              │          │
└──────────────┴──────────┘
```

### 4. Fullscreen Mode
- Toggle button in header
- Hides metadata panel entirely
- Sheet viewer takes 100% width
- Perfect for focused reading

### 5. Advanced Sheet Viewing

**Zoom & Pan:**
- Double-tap to toggle zoom (1x ↔ 2x)
- Pinch-to-zoom (1x - 4x range)
- Pan enabled automatically when zoomed
- Live zoom percentage indicator
- Quick reset button

**Multi-page Navigation:**
- Elegant bottom floating navigation
- Prev/Next buttons with disabled states
- Page counter (e.g., "2 / 5")
- Swipe gestures (disabled when zoomed)
- Keyboard support ready (arrow keys)

**Key Selection:**
- Floating dropdown for multiple keys
- Music note icon for visual identity
- Shows current key prominently
- Smooth key switching with animations

### 6. Premium Metadata Panel

**Editorial Typography:**
- Large, bold title (2xl)
- Hierarchical information architecture
- Uppercase labels with tracking
- Icon-based visual language

**Information Sections:**
1. **Header** - Title + Subtitle with bottom border
2. **Key Info** - Artist, Available Keys, Tags
3. **Actions** - Original source link button
4. **Timeline** - Last used, Created dates
5. **Notes** - Description in elegant card

**Visual Details:**
- Keys displayed as prominent primary-colored badges
- Tags as subtle outline badges
- Timeline with icons (Clock, Calendar)
- Description in muted background card
- Consistent spacing (space-y-8, space-y-6)

---

## Component Architecture

```
song-detail-redesign.tsx
├── Main Layout (Drawer)
├── Auto-hiding Header
│   ├── Close Button
│   ├── Title/Subtitle
│   └── Fullscreen + Menu
├── Content Area (flex row on desktop)
│   ├── SheetViewer (60% desktop, 100% mobile)
│   │   ├── Floating Controls Overlay
│   │   │   ├── Key Selector (top-right)
│   │   │   ├── Page Nav (bottom)
│   │   │   └── Zoom Controls (top-left)
│   │   └── Carousel/Single Sheet
│   │       └── SingleSheetItem (zoom/pan)
│   └── SongMetadata (40% desktop sidebar)
│       ├── Title Section
│       ├── Key Information
│       ├── Timeline
│       └── Description
```

---

## Design Tokens Used

### Colors
- `primary` - oklch(0.6231 0.1880 259.8145) - Purple accent
- `background` - White/Dark adaptive
- `muted` - Subtle backgrounds
- `border` - Soft dividers with `/50` opacity

### Shadows
- `shadow-toss` - `0 4px 24px rgba(0, 0, 0, 0.08)`
- `shadow-toss-lg` - `0 8px 30px rgba(0, 0, 0, 0.12)`

### Border Radius
- Buttons: `rounded-full` (infinite radius)
- Cards: `rounded-xl` (12px)
- Drawer: `rounded-t-[24px]` (top corners only)

### Spacing
- Section gaps: `space-y-8` (32px)
- Subsection gaps: `space-y-6` (24px)
- Item gaps: `space-y-4` (16px)
- Inline gaps: `gap-2` (8px), `gap-3` (12px)

### Typography
- Title: `text-2xl font-bold`
- Subtitle: `text-base font-medium`
- Labels: `text-xs font-semibold uppercase tracking-wide`
- Body: `text-sm font-medium`

---

## Accessibility Improvements

1. **WCAG Compliant Touch Targets**
   - All buttons: `h-11 w-11` (44px minimum)
   - Proper padding for icon buttons

2. **Semantic HTML**
   - `aria-label` on all icon buttons
   - `sr-only` class for screen-reader-only title
   - Proper heading hierarchy

3. **Keyboard Navigation Ready**
   - Focus states on all interactive elements
   - Can extend with arrow key navigation for carousel

4. **Visual Feedback**
   - Hover states: `hover:bg-muted/80`
   - Active states: `active:scale-95`
   - Disabled states: `opacity-30`

5. **Error Handling**
   - Image load failures show retry option
   - Graceful fallbacks for missing data
   - Error boundary at top level

---

## Motion Design

**Framer Motion Animations:**

1. **Control Fade In/Out**
   ```tsx
   initial={{ opacity: 0, y: -20 }}
   animate={{ opacity: 1, y: 0 }}
   exit={{ opacity: 0, y: -20 }}
   transition={{ duration: 0.2 }}
   ```

2. **Metadata Entrance**
   ```tsx
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.4 }}
   ```

3. **Zoom Indicator**
   ```tsx
   initial={{ opacity: 0, y: 10 }}
   animate={{ opacity: 1, y: 0 }}
   ```

4. **Button Interactions**
   - `active:scale-95` - Tactile press feedback
   - `transition-all` - Smooth hover transitions

---

## Performance Optimizations

1. **Lazy Loading**
   - Images use Next.js Image component
   - `priority` flag on first page
   - `sizes="100vw"` for responsive images

2. **Conditional Rendering**
   - Controls only render when visible
   - Metadata hidden in fullscreen mode
   - Suspense boundaries for async data

3. **Ref-based Zoom Control**
   - Direct DOM manipulation via refs
   - Avoids re-renders on zoom changes

4. **Carousel Optimization**
   - `watchDrag` disabled when zoomed
   - Prevents conflicting gestures

---

## Comparison: Old vs New

| Aspect | Old Design | New Design |
|--------|-----------|------------|
| **Layout** | Fixed header + scrollable body | Auto-hiding controls + immersive view |
| **Controls** | Always visible | Auto-hide after 3s |
| **Desktop** | Single column | Side-by-side (60/40 split) |
| **Fullscreen** | No option | Toggle button available |
| **Zoom UI** | No indicator | Live percentage + reset button |
| **Metadata** | Pull-up card | Editorial sidebar/panel |
| **Key Selector** | Basic dropdown | Floating pill with icon |
| **Page Nav** | Fixed position | Floating bottom pill |
| **Typography** | Standard labels | Editorial uppercase labels |
| **Shadows** | Generic shadows | Premium toss shadows |
| **Animations** | Minimal | Framer Motion throughout |
| **Touch Targets** | 40px (below WCAG) | 44px (WCAG compliant) |

---

## Usage

The redesign is automatically applied. The trigger component has been updated:

```tsx
// components/elements/design/song/song-detail-card/default/song-detail-dialog-trigger.tsx
import { SongDetailRedesign } from "@/components/elements/design/song/song-detail-card/redesign/song-detail-redesign";

<SongDetailRedesign
  teamId={teamId}
  isOpen={isOpen}
  setIsOpen={setIsOpen}
  songId={songId}
  readOnly={false}
/>
```

---

## Future Enhancements

### Planned
- [ ] Keyboard navigation (arrow keys for pages)
- [ ] Pinch-to-zoom on trackpad
- [ ] Annotation mode integration
- [ ] Print-optimized view
- [ ] Share sheet as image

### Advanced
- [ ] Multi-sheet comparison view
- [ ] Collaborative annotations
- [ ] Audio playback sync
- [ ] Metronome overlay
- [ ] Transpose preview

---

## Credits

**Design Inspiration:**
- Apple Music - Auto-hiding controls
- Spotify - Floating UI elements
- Medium - Editorial typography
- Linear - Premium glassmorphism

**Libraries:**
- Framer Motion - Animations
- react-zoom-pan-pinch - Sheet zoom/pan
- Vaul (Drawer) - Mobile-first drawer
- Embla Carousel - Touch-optimized carousel

---

Built with high-end UI/UX principles for the Wooriworship worship team platform.

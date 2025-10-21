# RAJGPT Design Guidelines

## Design Approach

**Selected Approach:** Design System-Based (Material Design + Linear-inspired)

**Justification:** RAJGPT is a utility-focused, information-dense application requiring real-time data visualization, clear hierarchies for multi-agent coordination, and professional monitoring interfaces. The design prioritizes efficiency, readability during extended monitoring sessions, and clear visual feedback for complex operations.

**Key Principles:**
- Data clarity over decoration
- Real-time feedback through subtle, purposeful animations
- Professional aesthetic suitable for technical users
- Clear visual hierarchy for simultaneous agent monitoring
- Accessibility for extended use sessions

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background Base: `222 15% 9%` (deep charcoal)
- Surface Elevated: `222 15% 12%` (cards, panels)
- Surface Higher: `222 15% 15%` (modals, popovers)
- Border Subtle: `222 10% 20%` (dividers)
- Border Emphasis: `222 10% 30%` (focused elements)

**Agent Color Coding:**
- Planner: `260 70% 65%` (vibrant purple)
- Executor: `200 85% 55%` (bright cyan)
- Researcher: `150 60% 55%` (teal green)
- Coder: `30 85% 60%` (warm orange)
- Analyst: `280 65% 60%` (magenta)

**Semantic Colors:**
- Success: `142 76% 45%`
- Warning: `38 92% 50%`
- Error: `0 84% 60%`
- Info: `217 91% 60%`

**Text Hierarchy:**
- Primary Text: `222 10% 95%`
- Secondary Text: `222 8% 70%`
- Tertiary Text: `222 8% 50%`
- Disabled: `222 8% 35%`

**Light Mode:**
- Background: `222 15% 98%`
- Surface: `0 0% 100%`
- Text Primary: `222 15% 15%`
- Borders: `222 10% 85%`

---

### B. Typography

**Font Families:**
- **UI Text:** Inter (Google Fonts) - clean, modern, excellent readability
- **Monospace:** JetBrains Mono (Google Fonts) - code, logs, technical output
- **Accent:** Space Grotesk (Google Fonts) - headings, agent names

**Type Scale:**
- Display: 2.5rem / 600 weight (Space Grotesk)
- H1: 2rem / 600 weight (Space Grotesk)
- H2: 1.5rem / 600 weight (Space Grotesk)
- H3: 1.25rem / 600 weight (Inter)
- Body Large: 1rem / 400 weight (Inter)
- Body: 0.875rem / 400 weight (Inter)
- Caption: 0.75rem / 400 weight (Inter)
- Code: 0.875rem / 400 weight (JetBrains Mono)

**Line Heights:**
- Headings: 1.2
- Body: 1.6
- Code: 1.5

---

### C. Layout System

**Spacing Scale:** Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Micro spacing: `p-2`, `gap-2` (8px)
- Component internal: `p-4`, `gap-4` (16px)
- Section spacing: `p-6`, `p-8` (24-32px)
- Major sections: `p-12`, `p-16` (48-64px)

**Grid System:**
- Dashboard: 12-column grid with 16px gutters
- Main content: 2-column split (sidebar 280px + main fluid)
- Real-time panels: 3-column grid on desktop, stack on mobile
- Analytics: 4-column metric cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)

**Container Widths:**
- Full dashboard: `max-w-full` with side padding
- Content sections: `max-w-7xl mx-auto`
- Modals: `max-w-2xl` for forms, `max-w-4xl` for previews

---

### D. Component Library

**Navigation:**
- Left sidebar (280px): Fixed, collapsible on mobile
- Top bar (64px): Logo, global actions, user menu
- Breadcrumbs: Secondary navigation with agent context

**Agent Dashboard:**
- **Agent Card:** Rounded corners (rounded-lg), elevation (shadow-lg), color-coded border-l-4
- **Status Indicators:** Pulsing dot for active, solid for idle, gray for offline
- **Progress Bars:** Linear with agent color, percentage label, animated fill
- **Task Timeline:** Vertical timeline with color-coded nodes, connecting lines

**Data Display:**
- **Metrics Cards:** Grid layout, large numbers, trend indicators, sparklines
- **Output Windows:** Terminal-style with monospace font, syntax highlighting, auto-scroll
- **Log Viewer:** Searchable, filterable, with timestamp and severity badges
- **Code Blocks:** Dark theme, line numbers, copy button, language badge

**Real-Time Visualizer:**
- **Agent Network Graph:** SVG-based node connections, animated data flow
- **Task Queue:** Sortable list with drag-drop, priority indicators
- **Execution Preview:** Modal overlay with live stdout/stderr streams

**Forms & Inputs:**
- Text inputs: Border focus ring with agent color, clear validation states
- Buttons: Primary (filled agent color), Secondary (outline), Ghost (transparent)
- Dropdowns: Custom styled with smooth transitions
- Toggles: Switch component for enable/disable features

**Overlays:**
- **Modals:** Centered, backdrop blur, slide-up animation
- **Toasts:** Top-right notifications, auto-dismiss, icon + message
- **Tooltips:** Dark background, small arrow, appear on hover (delay 300ms)

---

### E. Animations & Interactions

**Purposeful Animations Only:**
- Agent status changes: Fade transition (200ms)
- Real-time data updates: Pulse effect on new data (300ms)
- Progress indicators: Smooth fill animation (ease-in-out)
- Loading states: Skeleton screens, not spinners
- Page transitions: None - instant for data-focused apps
- Hover states: Subtle scale (1.02) on interactive cards

**Prohibited:**
- Decorative scroll animations
- Page parallax effects
- Excessive micro-interactions
- Auto-playing media

---

## Page-Specific Guidelines

**Dashboard (Main View):**
- Top: Metric summary cards (4-column grid)
- Middle: Agent status grid (3-column) + Live visualizer panel
- Bottom: Recent activity log + Quick actions sidebar
- Right sidebar: Task queue with add new goal input

**Agent Detail View:**
- Hero: Agent name (Space Grotesk), status, performance metrics
- Tabs: Execution history, Settings, Logs, Analytics
- Live output window: Full-width terminal-style display
- Timeline: Vertical task execution flow with expandable details

**Analytics Dashboard:**
- Filter bar: Date range, agent selection, metric type
- Charts: Line graphs for performance trends, bar charts for comparisons
- Tables: Sortable, paginated, with export functionality
- Summary cards: KPIs with percentage change indicators

---

## Images

**Not Applicable:** RAJGPT is a technical dashboard application focused on real-time data visualization and monitoring. No hero images or marketing imagery needed. All visuals are data-driven (charts, graphs, agent network diagrams, code execution previews).

---

## Accessibility

- WCAG AA contrast ratios (4.5:1 minimum)
- Keyboard navigation for all interactive elements
- Screen reader labels for icons and status indicators
- Focus visible indicators (2px ring with agent color)
- Reduced motion support via `prefers-reduced-motion`
- Consistent dark mode implementation across all inputs and surfaces
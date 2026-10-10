---
brand: "Trading Journal v2"
version: "1.0.0"
theme: "Modern, Clean, Analytical"
colors:
  primary: '#7371f7'
  primaryLight: '#a3a2f9'
  primaryDark: '#4543db'
  secondary: '#8e33ff'
  info: '#70b7f9'
  success: '#55b526'
  warning: '#ffd242'
  error: '#ff4332'
  textPrimary: '#212B36'
  textSecondary: '#637381'
  background: '#f9fafb'
  surface: '#ffffff'
  border: '#e5e7eb'
typography:
  body:
    fontFamily: '"Bai Jamjuree", sans-serif'
    fontSize: '1rem'
  heading:
    fontFamily: '"Bai Jamjuree", sans-serif'
    fontSize: '1.5rem'
spacing:
  xs: '0.25rem'
  sm: '0.5rem'
  md: '1rem'
  lg: '1.5rem'
  xl: '2rem'
rounded:
  sm: '0.25rem'
  md: '0.375rem'
  lg: '0.5rem'
  xl: '0.75rem'
  2xl: '1rem'
components:
  button:
    backgroundColor: '{colors.primaryDark}'
    textColor: '{colors.surface}'
    rounded: '{rounded.md}'
    padding: '{spacing.md}'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.textPrimary}'
    rounded: '{rounded.2xl}'
    padding: '{spacing.lg}'
  input:
    backgroundColor: '{colors.border}'
    textColor: '{colors.textPrimary}'
  layout:
    backgroundColor: '{colors.background}'
  badgeSuccess:
    backgroundColor: '{colors.success}'
  badgeError:
    backgroundColor: '{colors.error}'
  badgeWarning:
    backgroundColor: '{colors.warning}'
  badgeInfo:
    backgroundColor: '{colors.info}'
  badgeSecondary:
    backgroundColor: '{colors.secondary}'
  label:
    textColor: '{colors.textSecondary}'
    backgroundColor: '{colors.surface}'
  primaryLightItem:
    backgroundColor: '{colors.primaryLight}'
  primaryDarkItem:
    backgroundColor: '{colors.primaryDark}'
---

# Trading Journal v2 Design System

## 1. Visual Theme & Atmosphere
The Trading Journal v2 is designed to be a modern, clean, and analytical workspace for traders. The primary goal is to present complex financial data, performance metrics, and trade setups in a highly legible and actionable format without overwhelming the user. 
The atmosphere is professional and calm, leveraging a clean white and soft gray background with vibrant accent colors to highlight success, danger, and informational elements.

## 2. Color Palette & Roles
We use role-based colors to maintain consistency and meaning across the UI:
- **Primary (`#7371f7`)**: Used for main actions, active states, and positive growth indicators. Represents stability and success.
- **Secondary (`#8e33ff`)**: Used sparingly for special highlights or premium features.
- **Info (`#70b7f9`)**: Used for informational badges, neutral stat highlights, and secondary buttons.
- **Success (`#55b526`)**: Used for winning trades, positive PnL, and success states.
- **Warning (`#ffd242`)**: Used for breakeven trades, caution alerts, and pending states.
- **Error (`#ff4332`)**: Used for losing trades, negative PnL, destructive actions (e.g., Delete), and error states.
- **Text Primary (`#212B36`)**: Main text color for high readability.
- **Text Secondary (`#637381`)**: Used for labels, placeholder text, and less important information.
- **Background (`#f9fafb`)**: App background color, providing subtle contrast against pure white (`#ffffff`) cards.

## 3. Typography Rules
- **Font Family**: `Bai Jamjuree` is the primary font for the entire application, providing a clean and highly legible sans-serif experience ideal for reading numbers and data tables.
- **Headings**: Use bold weights (700) for section titles and stat card values.
- **Body Text**: Use medium (500) and regular (400) weights.
- **Small Text**: Use smaller text sizes (text-sm, text-xs) for labels, tags, and secondary information to maintain a high data density.

## 4. Component Stylings
- **Buttons**: Should have clear hover states (darkening the background or changing opacity). Primary buttons use the primary color with white text.
- **Cards**: All stat cards and dashboard panels use a pure white background (`#ffffff`), rounded corners (`rounded-2xl`), and a soft custom shadow (`shadow-card`) to lift them off the main background.
- **Tables**: Clean and borderless rows with subtle gray borders only on the header or between rows. Hover states (`hover:bg-gray-50`) are essential for readability.
- **Badges/Tags**: Use a 10-20% opacity background of the base color with the text color set to the dark variant (e.g., `bg-success/20 text-success-dark`).
- **Icons**: Use **Phosphor Icons** (`ph`, `ph-fill`, `ph-bold`) for modern, consistent line/fill iconography.

## 5. Layout Principles
- **App Shell**: Features a fixed left sidebar (288px width) for navigation and a sticky top header (80px height) for user controls and search.
- **Content Area**: The main content area occupies the remaining space and handles its own vertical scrolling (`overflow-y-auto`).
- **Grid System**: Use a 12-column CSS Grid (`grid-cols-12`) with consistent gaps (`gap-6`) for dashboard layouts.
- **Spacing**: Generous padding (`p-6` or `p-8`) inside cards and panels to let the content breathe.

## 6. Depth & Elevation
- The application is mostly flat, relying on the custom `shadow-card` to separate interactive or contained elements (like cards and modals) from the background.
- Overlays (like headers) may use `backdrop-blur-md` with semi-transparent backgrounds (`bg-white/80`) to create a sense of depth when content scrolls underneath.
- Interactive elements (like cards that link to other pages) may scale slightly on hover (`hover:scale-105`) with a smooth transition.

## 7. Do's & Don'ts
- **DO** use the designated success/error colors for financial outcomes (Green = Profit/Win, Red = Loss).
- **DO** use Phosphor icons consistently; do not mix icon sets.
- **DO** ensure high contrast between text and background.
- **DON'T** use raw hex colors in Vue components; always use the Tailwind classes mapped to the design tokens (e.g., `text-primary`, `bg-error`).
- **DON'T** clutter the UI with heavy borders. Rely on whitespace and subtle shadows for separation.

## 8. Responsive Behavior
- **Mobile/Tablet**: The sidebar is hidden (`hidden lg:flex`) and replaced by a hamburger menu icon in the top header.
- **Dashboard Grid**: Cards stack vertically on small screens (`col-span-1`) and expand to take up 4, 8, or 12 columns on medium (`md:`) and large (`lg:`) breakpoints.
- **Data Tables**: Wrap in `overflow-x-auto` to allow horizontal scrolling on smaller devices without breaking the layout.

## 9. Metadata/Other
- **UI Library Compatibility**: The design system integrates seamlessly with `shadcn-vue`, extending its base variables (like `--radius`, `--border`) where applicable, while overriding colors to match the brand identity.
- **Custom Scrollbars**: Minimalist scrollbars (`::-webkit-scrollbar`) are enforced globally to maintain a clean aesthetic across different operating systems.

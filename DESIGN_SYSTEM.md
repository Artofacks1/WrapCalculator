# Design System Documentation

This document defines the design system for WrapQuote. All UI components should follow these guidelines to maintain consistency and prevent breakage.

## Typography

Use only these predefined typography classes. Do not create custom font sizes or weights.

### Headings

- **Hero Heading**: `text-hero-heading` (60px, bold, line-height: 1.2)
  - Use for: Page titles, hero sections
  - Example: Main page heading "WrapQuote"

- **Section Heading**: `text-section-heading` (36px, semibold, line-height: 1.3)
  - Use for: Major section titles
  - Example: "Material Calculator", "Labor Hours"

- **Card Heading**: `text-card-heading` (20px, semibold, line-height: 1.4)
  - Use for: Card titles, subsection headings
  - Example: Card headers, quote titles

- **Small Heading**: `text-small-heading` (16px, semibold, line-height: 1.5)
  - Use for: Form labels, small section headers
  - Example: Form field labels

### Body Text

- **Body XL**: `text-body-xl` (20px, regular, line-height: 1.6)
  - Use for: Large body text, introductions

- **Body Base**: `text-body-base` (16px, regular, line-height: 1.6)
  - Use for: Standard body text, most content

- **Body Small**: `text-body-sm` (14px, regular, line-height: 1.5)
  - Use for: Captions, helper text, small descriptions

### Font Family

- **Primary Font**: Inter (already configured in `tailwind.config.ts`)
- Applied globally via `fontFamily.sans`

## Colors

### Primary Colors

- **Teal 600** (`text-teal-600`, `bg-teal-600`, `border-teal-600`): Primary actions, CTAs, accents
- **Teal 700** (`text-teal-700`, `bg-teal-700`): Hover states for teal
- **Blue 600** (`text-blue-600`, `bg-blue-600`): Gradients, secondary accents
- **Blue 700** (`text-blue-700`, `bg-blue-700`): Deep accents

### Neutral Colors (Light Mode)

- **White** (`bg-white`, `text-white`): Background, primary text in dark contexts
- **Gray 50** (`bg-gray-50`): Surface backgrounds
- **Gray 100** (`bg-gray-100`, `border-gray-100`): Borders, subtle backgrounds
- **Gray 600** (`text-gray-600`): Secondary text
- **Gray 900** (`text-gray-900`, `bg-gray-900`): Primary text, dark backgrounds

### Semantic Colors

- **Red 600** (`text-red-600`): Error messages, warnings
- **Red 300** (`border-red-300`): Error input borders
- **Amber 600** (`text-amber-600`): Warnings (non-critical)

### Color Usage Rules

- **DO NOT** use dark mode classes (`dark:`). This app is light-mode only.
- Always use semantic color names (e.g., `text-gray-900` for primary text)
- Use teal for primary actions and CTAs
- Use gray scale for neutral elements

## Spacing

Use the defined spacing scale based on 4px increments:

- `2` = 8px
- `3` = 12px
- `4` = 16px
- `6` = 24px
- `8` = 32px
- `10` = 40px
- `12` = 48px
- `16` = 64px
- `20` = 80px
- `24` = 96px
- `32` = 128px
- `40` = 160px

### Common Patterns

- Card padding: `p-6`
- Card margins: `mb-6`
- Section gaps: `gap-4` or `gap-6`
- Button padding: `px-6 py-3`

## Components

### Card

Use the `<Card>` component from `@/components/ui/Card` for all card containers.

```tsx
import Card from '@/components/ui/Card';

<Card>
  {/* Card content */}
</Card>
```

**Props:**
- `children`: React.ReactNode
- `className?`: string (additional classes)
- `hover?`: boolean (default: true) - enables hover shadow effect

### Label

Use the `<Label>` component from `@/components/ui/Label` for form labels.

```tsx
import Label from '@/components/ui/Label';

<Label required>Field Name</Label>
```

**Props:**
- `children`: React.ReactNode
- `required?`: boolean - shows red asterisk
- `disabled?`: boolean - applies disabled styling
- `htmlFor?`: string - for accessibility
- `className?`: string

### Input

Use the `<Input>` component from `@/components/ui/Input` for form inputs.

```tsx
import Input from '@/components/ui/Input';

<Input
  label="Field Name"
  type="number"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={hasError ? "Error message" : undefined}
  disabled={isDisabled}
/>
```

**Props:**
- Standard HTML input props
- `label?`: React.ReactNode - renders Label component
- `required?`: boolean - passed to Label
- `error?`: string - shows error message and red border
- `disabled?`: boolean - applies disabled styling

### Select

Use the `<Select>` component from `@/components/ui/Select` for dropdowns.

```tsx
import Select from '@/components/ui/Select';

<Select
  label="Choose Option"
  value={value}
  onChange={(e) => setValue(e.target.value)}
>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>
```

**Props:**
- Standard HTML select props
- `label?`: React.ReactNode - renders Label component
- `required?`: boolean - passed to Label
- `error?`: string - shows error message and red border
- `disabled?`: boolean - applies disabled styling

### Button

Use the `<Button>` component from `@/components/ui/Button` for buttons.

```tsx
import Button from '@/components/ui/Button';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**
- Standard HTML button props
- `variant?`: 'primary' | 'secondary' | 'outline' (default: 'primary')
- `isLoading?`: boolean - shows "Loading..." text

## Utility Functions

### className Helper

Use the `cn()` utility function for conditional classes:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  condition && 'conditional-class',
  anotherCondition ? 'class-a' : 'class-b'
)}>
```

This prevents className string concatenation errors and makes conditional styling cleaner.

## Common Patterns

### Card Layout
```tsx
<Card>
  <h2 className="text-card-heading font-small-heading text-gray-900 mb-6">
    Section Title
  </h2>
  {/* Content */}
</Card>
```

### Form Field
```tsx
<Input
  label="Field Label"
  required
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={errorMessage}
/>
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Grid items */}
</div>
```

## Rules & Guidelines

1. **Always use design system components** - Don't create custom styled divs that duplicate Card/Input/etc.
2. **Never use `dark:` classes** - App is light-mode only
3. **Use typography classes** - Don't create custom font sizes
4. **Use spacing scale** - Don't use arbitrary values like `p-5` or `mb-7`
5. **Use color palette** - Don't use arbitrary colors
6. **Use `cn()` for conditionals** - Don't manually concatenate className strings

## Pre-commit Checks

The pre-commit hook automatically checks for:
- TypeScript compilation errors
- ESLint violations
- `dark:` class usage

Fix these issues before committing code.


# Frontend Engineering Reference

> Personal reference for patterns, decisions, and standards used day-to-day.
> Keep this living. Update it when you solve something worth remembering.

---

## Table of Contents

- [Coding Priorities](#coding-priorities)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Performance Patterns](#performance-patterns)
- [Accessibility Checklist](#accessibility-checklist)
- [CSS Conventions](#css-conventions)
- [TypeScript Patterns](#typescript-patterns)
- [Testing Strategy](#testing-strategy)
- [Code Review Checklist](#code-review-checklist)
- [Debugging Toolkit](#debugging-toolkit)
- [Useful Snippets](#useful-snippets)

---

## Coding Priorities

When writing code, apply these in order. If a decision conflicts with a higher priority, flag before writing code.


### 1. Accessible + Semantic HTML

Use the right element for the job. Accessibility is not a retrofit — it's the foundation.

```html
<!-- ❌ -->
<div class="heading" onclick="...">Dashboard</div>
<div class="btn">Submit</div>
<div class="list"><div>Item</div></div>

<!-- ✅ -->
<h1>Dashboard</h1>
<button type="submit">Submit</button>
<ul><li>Item</li></ul>
```

- Prefer native HTML semantics over ARIA where possible
- Every interactive element must be keyboard-reachable and have a visible focus state
- Forms need `<label>` associations, not just placeholder text
- Images need meaningful `alt` text (or `alt=""` if purely decorative)

### 2. Responsive

Design desktop-first. Base styles target large viewports; scale down with `max-width` breakpoints.

```css
/* Desktop-first: base styles target large screens */
.card { padding: 2rem; display: grid; grid-template-columns: 1fr 1fr; }

/* Scale down for smaller viewports */
@media (max-width: 1024px) {
  .card { grid-template-columns: 1fr; padding: 1.5rem; }
}

@media (max-width: 768px) {
  .card { padding: 1rem; }
}
```

- Use relative units (`rem`, `%`, `fr`, `ch`) over fixed `px` where it matters
- Primary test targets: 1440px, 1280px, 1024px — then verify nothing breaks below
- Design for mouse + keyboard; hover states are fair game as primary interactions
- Layouts can use multi-column, sidebars, and fixed panels freely — don't artificially constrain to a single-column mental model
- If the app has a minimum supported width, enforce it: `min-width: 1024px` on the root rather than letting it silently break

### 3. Readable for Our Future Selves

Write code for the next person (who is probably you in 6 months).

```tsx
// ❌ Clever but cryptic
const d = u?.p?.a?.find(x => x.t === 'admin')?.id ?? null;

// ✅ Clear intent
const adminPermission = user?.profile?.permissions?.find(
  (permission) => permission.type === 'admin'
);
const adminId = adminPermission?.id ?? null;
```

- Name things for what they *mean*, not what they *are* (`isLoading` not `bool1`)
- Prefer explicit over terse — a few extra characters beat a head-scratch
- Leave a comment when you're doing something non-obvious, not when it's self-evident
- Keep functions small and single-purpose; if you need to scroll to read a function, split it

### 4. Sparks Joy ✨

Code that works is table stakes. Code that *delights* is the goal.

This means:
- Smooth transitions and micro-interactions where they add meaning, not noise
- Thoughtful empty states, loading skeletons, and error messages — not just spinners and "Something went wrong"
- Visual polish that respects the design system without being sterile
- The small things: hover states that feel responsive, focus rings that look intentional, animations that have a sense of physics

> Joy is not decoration. It's the signal that someone cared.

### 5. Not Overengineered — 🚩 Flag It

If a solution feels more complex than the problem it solves, stop and flag it.

**Overengineering signals:**
- Abstraction before there are 3+ real use cases
- A custom hook that wraps a single `useState`
- A context provider for data only one component uses
- A config-driven system for something that only has 2 variants
- Generic utilities built speculatively ("we might need this")

**How to flag it:**

Leave a comment and raise it in review:

```ts
// 🚩 OVERENGINEERING CHECK: This factory pattern was added for future plugin support
// that isn't on the roadmap. Consider simplifying to a plain function until needed.
```
Prefer: boring code that works over clever code that impresses. [Rule of Three](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)) — abstract on the third repetition, not the first.

### 6. QA Agent — 🤖 Functionality, Edge Cases & Playwright Tests

Before shipping, run (or mentally simulate) a QA pass focused on:

**Functionality**
- Does the happy path work end-to-end?
- Does it work across Chrome, Firefox, and Safari?
- Does it work on real mobile devices, not just browser emulation?

**Edge Cases to Always Check**
- [ ] Empty state (no data)
- [ ] Single item vs. many items
- [ ] Very long strings / content overflow
- [ ] Slow / failed network requests
- [ ] Unauthenticated / unauthorized states
- [ ] Rapid repeated interactions (double-click, fast typing)
- [ ] Form submission with invalid data
- [ ] Browser back/forward navigation

**Playwright Test Template**

```ts
import { test, expect } from '@playwright/test';

test.describe('Feature: [name]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-route');
  });

  test('happy path — [describe expected outcome]', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('status')).toContainText('Success');
  });

  test('edge case — empty state shows correct UI', async ({ page }) => {
    // mock empty response
    await page.route('/api/items', route =>
      route.fulfill({ json: [] })
    );
    await page.reload();
    await expect(page.getByText('No items yet')).toBeVisible();
  });

  test('error state — network failure shows error message', async ({ page }) => {
    await page.route('/api/items', route => route.abort());
    await page.reload();
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
```

> The QA agent mindset: assume nothing works until you've proven it does.

---

## Component Architecture

### Decision Criteria

| Concern | Approach |
|---|---|
| Pure UI, no logic | Presentational component |
| Logic + UI together | Container / smart component |
| Reusable behavior | Custom hook |
| Cross-cutting concern | Context or composition |
| Heavy/infrequent | Lazy load with `React.lazy` |

### File Structure Convention

```
src/
  components/
    Button/
      Button.tsx          # Component
      Button.test.tsx     # Unit tests
      Button.stories.tsx  # Storybook
      index.ts            # Re-export only
  hooks/
    useDebounce.ts
    usePrevious.ts
  features/
    checkout/
      CheckoutForm.tsx
      useCheckout.ts
      checkout.types.ts
```

### Composition Over Configuration

Prefer slots/children over a growing list of boolean props.

```tsx
// ❌ Avoid
<Card title="..." hasFooter hasBorder iconLeft="star" />

// ✅ Prefer
<Card>
  <Card.Header>
    <StarIcon /> <h2>Title</h2>
  </Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

---

## State Management

### Decision Tree

```
Is the state used by only one component?
  └─ Yes → useState / useReducer (local)

Is it shared across a subtree?
  └─ Yes → Lift state or Context

Is it server state (remote data)?
  └─ Yes → React Query / SWR

Is it global UI state (modals, toasts, theme)?
  └─ Yes → Zustand or Context

Is it URL-driven (filters, pagination)?
  └─ Yes → URL search params (useSearchParams)
```

### React Query Key Conventions

```ts
// Flat key for collections
queryKey: ['users']

// Parameterized key for single items
queryKey: ['users', userId]

// Scoped keys for related data
queryKey: ['users', userId, 'posts']

// Filtered collections
queryKey: ['products', { category, page, sort }]
```

---

## Performance Patterns

### When to Memoize

- `useMemo` — expensive pure computation that runs on every render
- `useCallback` — stable function reference passed to memoized children
- `React.memo` — component re-renders only when props change (profile first)

**Rule of thumb:** measure before memoizing. Premature memoization adds cognitive overhead.

### Code Splitting

```tsx
// Route-level splitting
const SettingsPage = React.lazy(() => import('./pages/Settings'));

// Component-level (heavy charts, editors, maps)
const RichTextEditor = React.lazy(() => import('./components/RichTextEditor'));
```

### Image Optimization Checklist

- [ ] Use `next/image` or equivalent with width/height set
- [ ] Serve WebP with JPEG fallback
- [ ] Use `loading="lazy"` for below-fold images
- [ ] Use `fetchpriority="high"` on LCP image
- [ ] Responsive `srcset` for different viewports

### Core Web Vitals Targets

| Metric | Target | Tool |
|---|---|---|
| LCP | < 2.5s | Lighthouse, CrUX |
| INP | < 200ms | Chrome DevTools |
| CLS | < 0.1 | Layout Shift regions |
| TTFB | < 800ms | WebPageTest |

---

## Accessibility Checklist

### Keyboard Navigation

- [ ] All interactive elements reachable via `Tab`
- [ ] `Enter`/`Space` activate buttons
- [ ] `Escape` closes modals/popovers
- [ ] Focus is managed on route changes and modal open/close
- [ ] No keyboard traps (except intentional modal focus trap)

### Semantic HTML

```html
<!-- ❌ Avoid div soup -->
<div class="button" onClick="...">Submit</div>

<!-- ✅ Use semantic elements -->
<button type="submit">Submit</button>
```

### ARIA Guidelines

- Don't add ARIA where native semantics already exist
- `aria-label` when there's no visible label
- `aria-describedby` to associate helper text with inputs
- `aria-live="polite"` for async status updates
- `role="alert"` for urgent messages

### Color & Contrast

- Normal text: 4.5:1 minimum contrast ratio
- Large text (18pt+): 3:1 minimum
- Never convey meaning with color alone — add icon or text

---

## CSS Conventions

### Custom Properties Structure

```css
:root {
  /* Primitives */
  --color-blue-500: #3b82f6;
  --space-4: 1rem;

  /* Semantic tokens */
  --color-action: var(--color-blue-500);
  --space-component-gap: var(--space-4);
}
```

### Utility-First with BEM for Complex Components

```css
/* Simple UI → Tailwind utility classes */
<div class="flex items-center gap-2 p-4 rounded-lg bg-surface">

/* Complex stateful components → BEM */
.card { ... }
.card--featured { ... }
.card__header { ... }
.card__header--sticky { ... }
```

### Z-Index Scale

```css
:root {
  --z-below:    -1;
  --z-base:      0;
  --z-raised:   10;
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-overlay:  300;
  --z-modal:    400;
  --z-toast:    500;
}
```

---

## TypeScript Patterns

### Discriminated Unions for State

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

### Prop Variants with `VariantProps`

```ts
import { cva, type VariantProps } from 'class-variance-authority';

const button = cva('base-styles', {
  variants: {
    intent: { primary: '...', secondary: '...' },
    size: { sm: '...', md: '...', lg: '...' },
  },
});

type ButtonProps = VariantProps<typeof button> & React.ButtonHTMLAttributes<HTMLButtonElement>;
```

### Exhaustive Switch

```ts
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}

switch (state.status) {
  case 'idle':    return <Idle />;
  case 'loading': return <Spinner />;
  case 'success': return <Data data={state.data} />;
  case 'error':   return <ErrorView error={state.error} />;
  default:        return assertNever(state);
}
```

---

## Testing Strategy

### The Testing Trophy

```
         /\
        /  \   E2E (few, critical flows)
       /----\
      / Intg \  Integration (main coverage layer)
     /--------\
    /   Unit   \ Unit (pure functions, hooks, utils)
   /____________\
      Static    TypeScript + ESLint
```

### What to Test

| Type | Test this |
|---|---|
| Unit | Pure functions, transformers, custom hooks |
| Integration | Components + real hooks + MSW-mocked API |
| E2E | Critical user paths: login, checkout, onboarding |

### MSW Pattern

```ts
// handlers/user.ts
import { http, HttpResponse } from 'msw';

export const userHandlers = [
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: 'Jane Doe' });
  }),
];
```

---

## Code Review Checklist

### Before Requesting Review

- [ ] Self-reviewed the diff from a reviewer's perspective
- [ ] No commented-out code or debug logs left in
- [ ] New components have tests
- [ ] Accessibility requirements met (keyboard + screen reader)
- [ ] No hardcoded strings that should be i18n keys
- [ ] Error and loading states handled, not just happy path
- [ ] No `any` types without justifying comment
- [ ] Performance implications considered (bundle size, re-renders)

### When Reviewing Others

- Lead with questions over statements when unsure of intent
- Distinguish blocking issues from nits (use `nit:` prefix)
- Approve with comments for style-only feedback
- Acknowledge good patterns — not just problems

---

## Debugging Toolkit

### React DevTools

```
Components tab  → inspect props, state, context in real time
Profiler tab    → record and flame-graph renders
"Highlight updates" → spot unexpected re-renders visually
```

### Performance

```js
// Quick render counter in dev
const renderCount = useRef(0);
console.log(`[MyComponent] render #${++renderCount.current}`);

// Why did this component re-render?
// Install: why-did-you-render
MyComponent.whyDidYouRender = true;
```

### Network

```js
// Intercept and log all fetch calls in console
const origFetch = window.fetch;
window.fetch = (...args) => {
  console.log('[fetch]', args[0]);
  return origFetch(...args);
};
```

### CSS

```css
/* Outline everything to debug layout */
* { outline: 1px solid red !important; }
```

---

## Useful Snippets

### useDebounce

```ts
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

### useLocalStorage

```ts
function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStored(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [stored, setValue] as const;
}
```

### useMediaQuery

```ts
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}
```
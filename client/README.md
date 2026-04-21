# WorkOS Admin Panel - Frontend Take-Home

A small admin panel for managing users and roles, built with React 19, TypeScript, and Radix Themes.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 19 + Vite | App framework and dev server |
| TypeScript | Type safety throughout |
| Radix Themes | Component and design system foundation |
| TanStack Query v5 | Server state, caching, and optimistic updates |
| React Router v7 | URL-based navigation and tab state |
| Vitest + Testing Library | Unit and integration tests |

---

## Getting Started

```bash
# From the client directory
npm install
npm run dev       # Start dev server at http://localhost:5173
npm run test      # Watch mode
npm run test:run  # Single run (CI)
npm run build     # Production build
```

The API server must be running at `http://localhost:3002` 

---

## Project Structure

```
src/
  components/          # Shared, reusable UI
    DataTable.tsx      # Generic sortable/searchable/paginated table
    FormDialog.tsx     # Shared dialog shell (accepts children)
    ToastProvider.tsx  # Toast context + fixed-position stack
    Pagination.tsx     # Previous / Next pagination controls
  pages/
    users/
      Users.tsx                     # Orchestration layer
      hooks/useUsers.ts             # All user mutations + delayed delete
      hooks/useUsers.test.tsx       # Tests for scheduleDelete
      components/UserDialog.tsx     # Add / edit user
    roles/
      Roles.tsx
      hooks/useRoles.ts
      components/RoleDialog.tsx     # Add / edit role
  lib/
    api.ts             # apiFetch<T> + fetchAllPages<T>
    api.test.ts
    constants.ts       # UNDO_DELAY, Z-index scale
  types/
    api.ts             # User, Role, PagedData<T>
  theme.css            # Design token overrides (brand color, component tokens)
  main.tsx
  App.tsx
```

---

## Architecture Notes

### Generic DataTable

`DataTable<T extends { id: string }>` handles sort, search, pagination, and compact density toggle internally. Pages pass a `columns` array with a `render: (item: T, compact: boolean) => ReactNode` function, keeping feature-specific rendering (avatars, badges) out of the shared component.

### Delayed Delete with Undo

Deletes are optimistic: the item disappears immediately from the UI, but the actual `DELETE` request fires after a 5-second delay (`UNDO_DELAY`). The `scheduleDelete` hook returns an undo function that cancels the timer and restores the cache. A toast with an "Undo" action button wires these together.

```ts
const undo = scheduleDelete(user.id, onError)
showToast({ title: `${user.name} deleted`, action: { label: 'Undo', onClick: undo } })
```

### FormDialog Composition

`FormDialog` is a thin shell (title, error callout, cancel/submit buttons). Feature-specific fields are passed as `children`, keeping the dialog component from growing a long list of boolean props.

### Toast System

`ToastProvider` is rendered inside `<Theme>` (not portaled to `document.body`) so Radix CSS variables cascade correctly in dark mode. The `dismissRef` pattern ensures the auto-dismiss timer fires once on mount without needing to reschedule when the dismiss callback reference changes.

---

## Theming

Brand colors and component tokens live in `src/theme.css`.

- **Accent color**: the `--violet-*` scale is generated from `#6565EC` using the [Radix color generator](https://www.radix-ui.com/colors/custom). Replace the scale to change the brand color.
- **Component tokens**: `--border-subtle`, `--dialog-max-width`, `--toast-min-width` are defined at the top of `theme.css`.
- **Z-index**: CSS tokens (`--z-*`) are mirrored in `src/lib/constants.ts` (`Z.*`) for use in React inline styles. Keep them in sync.

---

## Delightful Additions

- **Skeleton loading** — shimmer table with real column headers while data fetches, no layout shift on load
- **Compact density toggle** — icon button in the table header switches between comfortable and dense row height
- **Optimistic delete with undo** — instant feedback, reversible within 5 seconds via toast action
- **Dark mode** — persists to localStorage, respects system preference on first load
- **Column sorting** — click any sortable column header; click again to reverse, third click to clear
- **URL-driven search and sort state** — filter/sort/page persists to query params, survives refresh, and is shareable

---

## Testing

Tests are focused on the two pieces of logic that are genuinely non-obvious and would be painful to debug manually.

**`src/lib/api.test.ts`** — `fetchAllPages`
- Returns data correctly from a single page
- Fetches remaining pages in parallel when multiple pages exist
- Throws with the provided message when the first request fails
- Throws when a subsequent page request fails

**`src/pages/users/hooks/useUsers.test.tsx`** — `scheduleDelete`
- Optimistically removes the user from cache immediately
- Calls the DELETE API only after the undo delay expires
- Does not call the API when undo is triggered before the delay
- Restores the cache when undo is triggered
- Restores the cache and fires `onError` when the API call fails

Component-level behaviour (form validation, dialog open/close, search filtering) is covered by manual testing and is straightforward enough that the ROI on automating it is low relative to the complexity it would add.

---

## AI Collaboration

The engineering standards and context used throughout are in `claude.md` at the root of the repo.

---

## Potential Wish List (if more time)

- **Keyboard shortcut to open Add dialog** — a single `useEffect` listening for `n` keydown opens the Add user/role dialog; small touch but could be useful for power users
- **Optimistic add/edit** — currently only delete is optimistic; adds and edits wait for the server response
- **E2E tests** — Playwright covering the critical paths (add user, assign role, delete with undo)

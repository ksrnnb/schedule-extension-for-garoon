# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

Chrome extension (Manifest V3) that enhances schedule notifications for Garoon (Cybozu groupware). It is a **personal side project, not an official Cybozu product** — keep that framing if you touch user-visible copy. Originally forked from `kamiaka/garoon-chrome-extension` (MIT) and substantially modified.

## Commands

Package manager is **pnpm** (`packageManager: pnpm@10.33.0`). Toolchain is webpack + ts-loader + sass-loader.

```sh
pnpm install
pnpm build:dev   # one-shot development build → dist/
pnpm build       # production build (NODE_ENV=production) + scripts/zip.sh → archive.zip
pnpm start       # webpack --watch
pnpm icons       # regenerate public/icon/icon-{16,32,48,128}{,-gray}.png from src/icon/calendar.svg via sharp
```

There are **no test, lint, or typecheck npm scripts** in `package.json`. ESLint is configured (`.eslintrc.yaml`, with `@typescript-eslint/no-explicit-any: error` and `prettier/prettier`) but must be invoked manually with `npx eslint` if needed. Webpack runs `ts-loader`, so `pnpm build:dev` is the closest thing to a typecheck.

To load the extension locally: `pnpm build:dev`, then in `chrome://extensions` (developer mode) load `dist/` as an unpacked extension. Reload from that page after each rebuild.

## Architecture

The five webpack entry points in `webpack.config.ts` map directly to MV3 surfaces (everything in `src/` is bundled into `dist/<name>.js`):

| Entry | File | Surface |
| --- | --- | --- |
| `background` | `src/background.ts` | MV3 service worker |
| `content_scripts` | `src/content_scripts.ts` | Injected into `https://*.cybozu.com/g/*` |
| `popup` | `src/popup.ts` (+ `public/popup.html`) | Toolbar popup |
| `options` | `src/options.ts` (+ `public/options.html`) | Options page (`open_in_tab`) |
| `offscreen` | `src/offscreen.ts` (+ `public/offscreen.html`) | Offscreen document for audio playback |
| `style` | `src/css/style.scss` | Shared styles, emitted as `style.css` via MiniCssExtractPlugin |

`public/` is copied verbatim into `dist/` by `CopyWebpackPlugin` (manifest, HTML, `_locales/`, generated icons).

### Single-alarm event loop

`src/background.ts` is the heart of the extension. A single `chrome.alarms` alarm (`watchNotification`, `periodInMinutes: 1`) drives **three responsibilities** on every tick:

1. **`notifyEvents()`** — scan stored events, match `start - now == notifyMinutesBefore` minutes, and emit a notification (and chime if enabled). Subjects are filtered against the user's `ignoreEventKeywords` list.
2. **Stale-store refresh** — if `Date.now() - lastUpdate >= refreshInMinutes`, call the Garoon REST API (`GaroonAPI.getScheduleEvents`) and overwrite `events` in `chrome.storage.local`.
3. **`updateBadge()`** — set the action icon (color vs. gray-on-error), badge text (next event's HH:MM, or `!` on auth error), and badge color.

The store keeps events from **today 00:00 through ~30 days ahead** so the popup can render already-finished events from earlier today. Don't tighten that filter without checking `popup.ts setEvents()` and `badge.ts nextEventToday()`.

### Auth-error path

API 401 surfaces through `ErrorResponse` (thrown from `src/common/api/API.ts`), caught at the top of `update()`, and routed to `requireAuth()` (`src/common/util/error.ts`). That sets a localized error string in the store, which `updateBadge()` renders as a gray icon + `!` badge, and (if `notifiesRequireAuth`) fires a click-to-open-portal notification. New error paths should funnel through `setError`/`clearError` so the badge stays in sync.

### Offscreen document for audio (MV3 constraint)

MV3 service workers cannot construct an `AudioContext`, so the chime is synthesized in a hidden offscreen document. The flow:

```
background.ts notifyEvent()
  → playChime() (src/common/util/sound.ts)
    → ensureOffscreenDocument() (creates offscreen.html lazily)
    → message.sendMessage(Type.PlaySound, volume)
      → offscreen.ts listens on Type.PlaySound and calls playChime()
```

`offscreen.ts` is a procedural FM-synthesis bell (additive partials over a 3800Hz fundamental + a short bandpass-filtered noise transient) — it does **not** load an audio asset. If you change `OFFSCREEN_PATH`, also update the manifest's `offscreen` permission/usage and `ensureOffscreenDocument()`'s URL check.

### Typed runtime-message bus

`src/common/background/index.ts` is a small wrapper around `chrome.runtime.sendMessage` / `onMessage` with two types: `Type.Update` (popup → background, "refresh now") and `Type.PlaySound` (background → offscreen). Add new cross-context calls here rather than calling `chrome.runtime` directly — listeners are registered/unregistered via the returned `UnregisterFunc`, and errors flow through `handleError`.

### Content script: "now" indicator on the schedule grid

`src/content/timeIndicator.ts` overlays a red horizontal line on Garoon's day/week schedule view. Two non-obvious gotchas worth preserving:

- **Week-view column ids freeze at first render** — to find the column for "today", iterate `td.personal_week_calendar_date_cell` and pick the index where `aria-current === 'date'`, or fall back to the all-day cell whose `data-bdate` matches today. Don't rely on the column id matching the displayed date.
- **`data-bdate` formats are inconsistent** — all-day cells use zero-padded `YYYY-MM-DD`, time rows use unpadded `YYYY-M-D`. `isTodayBdate()` matches both via regex + numeric comparison.

The script renders via a `requestAnimationFrame`-debounced `schedule()` triggered by a `MutationObserver` on `document.body`, plus a minute-aligned `setTimeout` chain and `scroll`/`resize` listeners. An `AbortController` and a returned cleanup function tear everything down — call sites currently don't use it but preserve the contract.

### Storage shape

A single key `grn.config` in `chrome.storage.local` holds the entire `Store` (see `src/common/store/index.ts`). `load()` always merges over `defaultConfig`, so adding a new field requires (a) adding it to the `Store` interface, (b) giving it a default in `defaultConfig`, and (c) wiring it into `options.ts` (read on init, write on submit).

### i18n

Locale files live in `public/_locales/{en,ja}/messages.json`; `default_locale` is `ja`. HTML uses `__MSG_<key>__` placeholders, rewritten at runtime by `localizeHTML()` (`src/common/util/dom.ts`) — this string-replaces `document.body.innerHTML`, so don't put untrusted user content into the DOM before `localizeHTML()` runs. TS code reads via `__('key')` (`src/common/util/message.ts`).

## Conventions

- TypeScript: `target: es5`, `module: commonjs`, `strict: true`. Webpack does the bundling.
- Prettier: `singleQuote`, `printWidth: 80`, `trailingComma: all`, `tabWidth: 2`, `arrowParens: avoid`.
- `any` is forbidden by ESLint; the few existing `eslint-disable-next-line @typescript-eslint/no-explicit-any` comments are in the generic message bus and store — keep new code typed.
- The `src/common/` barrel files (`index.ts`) re-export everything; importing from `'../common'` (or `'./common'`) is the established style rather than reaching into subpaths.

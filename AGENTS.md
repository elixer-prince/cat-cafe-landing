# Catpuccino Café landing page

A one page static marketing site for a cat café in Camden: hand written HTML, one stylesheet and one script, no build step.

## Stack

- **Language / Runtime**: HTML5, CSS3, browser JavaScript written in ES5 style
- **Framework**: none, a single static page served as it sits in the repo
- **Key dependencies**: none; Google Fonts (Fraunces, Nunito Sans) and Unsplash photos load over the network
- **Package manager**: none, no `package.json`, no bundler, no install step

## Build approach

Tracer Bullet: prove the whole pipe works end to end, thin but real, before building any part of it out. (Recorded in `docs/scope/scope.md`.)

## Commands

```bash
# Install
none, there is nothing to install
# Run the page
start index.html   # Windows; open index.html on macOS
# or Live Server in VS Code, pinned to port 5501 in .vscode/settings.json
# Build
none, the files are served as written
# Check / test
none yet, the repo has no lint or test command (feature 1 in docs/scope/scope.md)
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`.

## Rules

- The three files at the repo root are the whole product: `index.html`, `styles.css`, `script.js`. No bundler, no package manager, no dependency to install, nothing generated. The only remote assets are the Google Fonts stylesheet and the Unsplash photos.
- JavaScript stays old style on purpose: one IIFE per file, `"use strict"`, `var` and `function` only, no arrow functions, no modules, no library. Each block of behaviour sits under a banner comment.
- Progressive enhancement is a hard rule: the page must work with JavaScript off. The script only adds behaviour (classes such as `is-open`, `is-stuck`, `is-visible`, and `js` on `<html>`); anything that needs script is gated behind `html.js` in CSS.
- Colour, type, spacing and motion come from the tokens in `:root` (section 1 of `styles.css`, Design tokens). Dark mode maps the same token names under `html[data-theme="dark"]`, so a component never hard codes a colour.
- `data-theme` on `<html>` is the single source of truth for the theme. The inline script in `<head>` applies the saved choice before first paint (localStorage key `catpuccino-theme`); `script.js` keeps the toggle, `aria-pressed` and the `theme-color` meta in step.
- Put new CSS in the matching numbered section of `styles.css` (1 design tokens through 18 motion and print). Base rules live in the numbered block, responsive overrides belong in the `@media` blocks of sections 17 and 18.
- Sections and ids are the contract: one `<section>` per page area (`#cats`, `#menu`, `#gallery`, `#why`, `#reviews`, `#book`, with `#visit` an anchor inside the booking section), the navigation and footer links target those ids, and neighbouring sections alternate `class="section"` and `class="section section-alt"` for the tinted background. Class names are kebab case (`.site-header`, `.card-grid`) and state classes take the `is-` prefix (`.is-open`, `.is-visible`).
- Accessibility is house style, not a later pass: skip link, a text label on every icon button (inline SVG icons are `aria-hidden`), `role="status"` for form messages, visible focus rings, and `prefers-reduced-motion` honoured.
- There is no backend. The booking form really sends through Web3Forms from its own markup and reports the honest outcome (feature 2, spec 0001); the newsletter signup is still a front end demo that prints a friendly confirmation until feature 3 makes it real, so never write code or copy that implies its details are sent before then.
- Copy is hand written British English in a warm, playful voice, written straight into the HTML.

## Agent skills

Declined: plannotator/effective-html@html, microsoft/vscode@hygiene, jeremylongshore/tons-of-skills-marketplace@performance-lighthouse-runner
MCP servers: chrome-devtools (recommended)

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->
- [docs/scope/scope.md](docs/scope/scope.md): the build scope, the features and their status

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
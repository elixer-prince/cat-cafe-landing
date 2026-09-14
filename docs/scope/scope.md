# Scope: Catpuccino Café landing page

A one page marketing site for a cat café in Camden, London: small batch coffee, single origin chocolate and twelve rescue cats. It exists to convince a visitor to want a table, then to take a booking request from them.

**Build approach:** Tracer Bullet (prove the whole pipe works end to end, thin but real, before building any part of it out).
**Workflow:** Alpha (after `/develop`, run `/check verify`; that is also the sensible place to call a feature `done`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· Beta`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| A | Page shell & design system | Already built | existing |
| B | Hero & perks strip | Already built | existing |
| C | Resident cats showcase | Already built | existing |
| D | Menu boards & gallery | Already built | existing |
| E | Why Catpuccino & guest reviews | Already built | existing |
| F | Visit details, hours & contact | Already built | existing |
| G | Page interactions | Already built | existing |
| H | Booking request form | Already built | in-progress |
| I | Newsletter signup | Already built | in-progress |
| 1 | Coding standards & tooling | Foundation | planned |
| 2 | Booking request delivery | Slice 1 | planned |
| 3 | Newsletter signup delivery | Slice 1 | planned |

## Already built

Work that predates the workflow, enrolled so the plan stays honest. `existing` means complete and left alone; `in-progress` means partial, and the section says which planned feature finishes it.

### A. Page shell & design system · existing
Layout primitives, buttons, the sticky header, the primary navigation and the footer, plus the light and dark theme tokens with responsive, print and reduced motion rules. code in `index.html`, `styles.css`

### B. Hero & perks strip · existing
The opening hero with its three headline stats and the stacked photo cards, then the four promise strip (small batch roastery, bean to bar chocolate, rescue cats, reading nook). code in `index.html`, `styles.css`

### C. Resident cats showcase · existing
Six cat cards, each with a photo, a role, a breed, an age and personality chips, plus the weekly adopt a cat Sunday line that links down to the booking section. code in `index.html`, `styles.css`

### D. Menu boards & gallery · existing
Two price boards (the coffee bar and the chocolate counter) and the seven photo gallery grid. code in `index.html`, `styles.css`

### E. Why Catpuccino & guest reviews · existing
Four perk cards (ninety minute tables, roast and rest schedule, adopt don't shop, quiet hours) and three guest quotes with star ratings. code in `index.html`, `styles.css`

### F. Visit details, hours & contact · existing
Opening hours, quiet hours, the Camden address, and the phone and email links. code in `index.html`, `styles.css`

### G. Page interactions · existing
Theme toggle with a saved choice that follows the operating system until the visitor picks a side, sticky header shadow, mobile navigation, reveal on scroll, and the footer year. Every one of them degrades gracefully without JavaScript. code in `script.js`

### H. Booking request form · in-progress
Collects name, email, date, time, guests, which cat to sit with and a free text note, and the page promises a confirmation by email within the hour. Nothing is sent anywhere: the submit handler prints a friendly message and clears the form. code in `index.html`, `script.js`

### I. Newsletter signup · in-progress
The footer Cat mail signup validates an address and prints a cheerful confirmation. No address is stored or sent anywhere. code in `index.html`, `script.js`

## Foundation

### 1. Coding standards & tooling
Capture the conventions this static page already follows and add one check that keeps them true, so later features have a single place to look for house rules. There is no root `AGENTS.md` in the repo yet.
**Done when:** a root `AGENTS.md` describes the real structure, the naming and the code style of the page, the stylesheet and the script, and one documented command checks all three without errors.
- [ ] Capture standards & tooling: `/audit`

## Slice 1: forms that really send

### 2. Booking request delivery · needs a decision
Booking is the whole point of the page, and today the form only pretends to work. Send each request to the café through the chosen form service, and let the guest see the truth about what happened.
**Done when:** a submitted request really arrives at the café's chosen destination with the guest's details, the guest reads a success message only after a real send, a failed send shows an honest message with a way to retry, and the form states what those details are used for.
- [ ] Design it (spec): `/architect booking request delivery`

### 3. Newsletter signup delivery · needs a decision
The monthly Cat mail signup should really add a subscriber, with the same honesty about the outcome.
**Done when:** a valid address really joins the café's list through the chosen service, the visitor sees a true confirmation only after a real success, a failure shows an honest message, and the signup states how the address will be used.
- [ ] Design it (spec): `/architect newsletter signup delivery`

## Deferred

Out of scope for the current build pass, kept so the plan stays honest.

- **Privacy notice**: a real privacy page, and a decision on the third party requests the page already makes (web fonts and photos loaded from Unsplash) · needs a decision
- **Deployment & hosting**: a real URL to point the form service at, plus the fonts and photos served from the project instead of hotlinked
- **SEO & social cards**: local business structured data, a sitemap and Open Graph images
- **Analytics**: see which sections and which booking path actually convert
- **Menu & cats as content**: let the café change the menu and the residents without editing HTML · needs a decision
- **Adoption Sunday applications**: a second form for adoption enquiries · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on a stack feature), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Rows that carry a letter** are the already built work: `existing` is complete and left alone, `in-progress` is partial and finished by the planned feature its section names. **Rows that carry a number** are the planned build order.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` after `/develop`; `Alpha` after `/check verify`; `Beta`/`GA` after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (built before the workflow) and `dropped` (de scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag inherits it.
- **Workflow tier tag** beside a heading (e.g. `· Beta`, `· GA`) sets that one feature's rigor above or below the project default; no tag inherits the default.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.

# 0001. Deliver booking requests through Web3Forms

**Date**: 2026-09-16
**Status**: Proposed

## Summary

Today the booking form takes a guest's details and then pretends to send them: nothing leaves the browser. This spec makes it real by posting each request to Web3Forms, a hosted form service, and by telling the guest the truth about what happened. It also tidies the small dishonesties around the edge (the time value the café would read, the date check, the line saying what the details are for). Nothing new is built, installed or run, and the form still works with JavaScript off.

## Context

The page exists to take a booking, so the form is the one place the café earns its money. `AGENTS.md` and `docs/scope/scope.md` record the same gap: the submit handler in `script.js` prints a friendly confirmation and clears the form, and no request goes anywhere, while the copy promises a confirmation by email within the hour. A guest who trusts that promise and turns up has been misled by the site.

The constraints are tight and few. The product is three files served as they sit, with no build step, no package manager and no dependency to install, so a service that needs a script or a package is out. Progressive enhancement is a hard rule, so whatever carries the request must work from the form's own markup with JavaScript off. There is no backend, and hosting is itself deferred in the scope, so a serverless function of our own would drag deferred work forward.

Guest details are personal data and the café is in London, so this work sits under **UK GDPR**. The details are a name, an email address, a date, a slot, a guest count, a cat and a free text note. That note's placeholder currently invites allergies, which is health data (special category data under UK GDPR) that a booking does not need, and this spec removes the invitation. A third party will process the details, which the deferred privacy notice has to name.

> ⚠️ Premise note: the account that makes a real send possible does not exist yet, and hosting stays deferred. The build can wire everything and fail honestly, but a request cannot be proven to arrive until the café opens a free Web3Forms account and its access key is pasted into the marked value. Recommended order: open the account first, so the acceptance criteria below can be tested for real. If that has to wait, ship with the placeholder and treat the switch on as a step to run before anyone calls this feature done.

## Requirements

**User stories**:
- As a guest, I want my booking request to reach the café so that I can turn up to a table that is really held for me.
- As a guest, I want to be told honestly whether my request arrived, and to find my details still on screen with a way to try again when it did not, so that I am never left wondering.
- As the café, I want each request in my inbox with the guest's name, email, slot and chosen cat, so that I can answer within the hour by hitting reply.
- As the café, I want bot submissions filtered without asking a guest to prove themselves, so that the inbox stays readable.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: With JavaScript on, submitting a valid form sends exactly one request to the Web3Forms endpoint, and the page shows the confirmation state only after an HTTP `200` whose body reports success. The confirmation repeats the date, the time, the guest count and the chosen cat, offers the café phone number, and the form clears.
- **AC-2**: Every other outcome reaches a failure state instead: a rejected request (`400`), a rate limit (`429`), a server fault (`500`), a reply that does not report success, about fifteen seconds with no reply, and a network failure.
- **AC-3**: The failure wording claims only what the page knows. A rejected request says the request did not arrive. A rate limit says the café is busy and asks the guest to give it a moment. A timeout, a network failure or a server fault says the page could not confirm whether the request arrived.
- **AC-4**: A failure keeps every value the guest typed, makes the submit control ready to press again, and offers the café phone number (`tel:+442071234567`) and email address.
- **AC-5**: With JavaScript off the form posts to the same endpoint from its own `action`, so a request still arrives and the guest sees the service's own confirmation page.
- **AC-6**: The payload carries exactly the seven scope fields (name, email, date, time, guests, cat, message) plus the notification subject and the bot trap, and the guest's email address is the reply to address the café replies to.
- **AC-7**: While a request is in flight the submit control reads `Sending…`, carries `aria-busy="true"` and stays focusable, and a second press sends nothing and leaves the typed values alone.
- **AC-8**: A hidden bot trap field sits in the markup, is never visible, never in the keyboard tab order and never announced by assistive technology, and a submission with the trap filled is not sent by the page.
- **AC-9**: One line near the submit control states that the details are used only to arrange the booking and that they reach the café's booking inbox through Web3Forms.
- **AC-10**: The date field refuses a date earlier than today according to the guest's own device, and the note field stops at 500 characters.
- **AC-11**: No guest detail is written to `localStorage`, to a cookie, or kept in the page once a send has succeeded.

## Options considered

### Option 1: Web3Forms

A hosted form service reached over plain HTTP. The form's own `action` posts to `https://api.web3forms.com/submit` with a public access key in a hidden field, so a request arrives even with JavaScript off, and with script on the same endpoint answers with JSON (`200`, `400`, `429`, `500`), which is what lets the page report the truth. Spam handling is a hidden `botcheck` field plus the service's own filtering.

**Pros**:
- Nothing to build, deploy or run
- No third party script, so the project keeps its no dependency rule
- The access key is a public identifier that can only post to the café's own mailbox, not a secret we must hide
- Documented status codes map straight onto the honesty states
- A built in bot trap means the spam decision needs no configuration
- Free to start, which suits a form that takes a few requests a day

**Cons**:
- Guest details sit with a processor as well as in the café's inbox
- The free tier has a monthly ceiling to watch
- A guest with JavaScript off leaves the page for the service's own confirmation page

### Option 2: Formspree

The same shape, and the most mature of the four: per field error detail in the JSON reply, filtering on every plan, and the strongest paperwork (SOC 2 Type II, GDPR through standard contractual clauses).

**Pros**:
- The most useful error detail of the four
- Formshield spam filtering on every plan, with captcha options documented
- Well documented, with a large user base

**Cons**:
- The free tier allows 50 submissions a month and is described as being for testing and development, so a café taking bookings daily outgrows it at once
- A custom thank you page needs the paid tier
- A custom honeypot field is a Business plan feature
- Hosted in the United States on AWS, the same processor caveat as option 1

### Option 3: Formspark

A paid hosted service with filtering on every submission on every plan, and the thank you page, the redirect and the error page all customisable.

**Pros**:
- The tidiest guest facing surfaces of the four
- Spam filtering on every plan with nothing to set up
- Botpoison, reCAPTCHA, hCaptcha or Turnstile available if bot traffic ever demands it

**Cons**:
- It reads as a paid service with a trial rather than a free tier, so the café pays monthly from day one
- Its pricing was not confirmed during this design

### Option 4: A serverless function we deploy

Our own small function receives the post and passes it to the café, either straight to an email service or into an inbox we own.

**Pros**:
- Full control of handling, retention and wording
- No third party holds the guest's details
- The failure wording is entirely ours, including the no script path

**Cons**:
- It needs hosting, accounts, secrets and monitoring, and hosting is deferred in the scope, so this pulls deferred work forward
- It turns a five minute change into a project, and adds a thing to operate that nobody at a café will maintain
- It cannot be built at all until the hosting decision is made

## Decision

**Chosen option**: Option 1: Web3Forms

Post the form to the Web3Forms endpoint, report the real outcome honestly, and let the form's own markup carry the request with JavaScript off.

## Rationale

The forces here are the no build step rule, the progressive enhancement rule, no backend and café volume. Web3Forms is the only option that meets all four without adding a moving part or a monthly bill drawn before the page has proven it books tables. Its public access key suits a page with nowhere to keep a secret, its documented status codes are exactly what the three honest states need, and its built in bot trap satisfies the spam decision with nothing to configure.

Formspree is the runner up and would become the pick if the café ever wants per field error detail or the SOC 2 paperwork, at which point the paid tier and a custom thank you page come with it. Formspark is the tidy paid alternative if polish matters more than cost. The serverless function is the only option that keeps the details away from a third party, which is a real principle, but it buys that with hosting, secrets and upkeep on a project built to have none, and it is the one option that cannot be verified until the deferred hosting work happens. If data location becomes a hard requirement, that is the moment to revisit this decision, and the Follow-up items record it.

## Feature design

**Data model sketch**:

This feature stores nothing of its own: no database, no browser storage, no record the page keeps. The model is the request the page hands to the service, and the only values it needs besides the guest's answers are two constants.

| Field sent | Type | Required | Source | Notes |
|---|---|---|---|---|
| `access_key` | string | yes | the café's Web3Forms access key, one marked value in `index.html` | a public identifier, not a secret; it can only deliver to the café's own mailbox |
| `subject` | string | yes | fixed copy in the markup: `New booking request from the Catpuccino website` | the subject the café reads in the notification |
| `botcheck` | boolean | no | a hidden checkbox named `botcheck`, hidden by a class in `styles.css` section 14, with `tabindex="-1"`, `aria-hidden="true"` and `autocomplete="off"` | filled means a bot, and the service drops it |
| `name` | string | yes | the name input, trimmed | |
| `email` | string | yes | the email input | the service uses it as the reply to address |
| `date` | string `YYYY-MM-DD` | yes | the date input | earliest today as the guest's own device counts days |
| `time` | string | yes | the time select, the label it displays | the `value` attributes change to the labels so both paths send the same readable text |
| `guests` | string | yes | the guests select | already plain, such as `2 guests` |
| `cat` | string | yes | the cat select | the cat's name, or `any cat who is awake` |
| `message` | string | no | the note textarea | capped at 500 characters |

**State transitions**:

- idle → sending: a valid submit starts one request
- sending → sent: an HTTP `200` whose body reports success, the confirmation replaces the status line, and the form clears
- sending → failed (rejected): a reply reports a rejection, and every typed value stays
- sending → failed (busy): a rate limit, and every typed value stays
- sending → failed (unconfirmed): a server fault, a timeout of about fifteen seconds, or a network failure, and every typed value stays
- failed → sending: the guest presses the control again

**Message copy** (the strings the build uses: the café's voice, British English, honest about what the page knows):

| State | Copy |
|---|---|
| sent | `Purrfect, {first name}. Your booking request is in: {guests}, {readable date} at {time}, with {cat}. We confirm by email within the hour. Need us sooner? Call 020 7123 4567.` |
| busy (rate limit) | `We are taking a lot of requests this minute, so yours did not get through. Give it a moment and press Request booking again, or call us on 020 7123 4567.` |
| rejected (not arrived) | `That request did not reach us. Check the details, press Request booking once more, or call us on 020 7123 4567.` |
| could not confirm (timeout, network failure, server fault) | `We could not confirm whether that reached us. Press Request booking once more, or call us on 020 7123 4567 so we can check the book.` |

The café's phone number appears in three of these strings, so it must stay the same number as the contact line in `index.html`: a number change touches both places.

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `https://api.web3forms.com/submit` | POST, form encoded from the markup and JSON from the script | `access_key`, `subject`, `botcheck`, `name`, `email`, `date`, `time`, `guests`, `cat`, `message` | JSON carrying a success flag and a message | none, the access key is a public identifier | `400` rejected, `429` rate limited, `500` service fault, and no reply at all |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Send the request | the endpoint | a constant in the form's `action` in `index.html`, decided in this spec |
| Send the request | the access key | the café's Web3Forms account, pasted into one marked value (a placeholder until then) |
| Send the request | the notification subject | fixed copy in the hidden `subject` field |
| Send the request | the trap value | the hidden `botcheck` checkbox |
| Send the request | the seven details | the form inputs; the time is the selected option's own label once the `value` attributes are aligned |
| Show the confirmation | the slot echoed back (date, time, guests, cat) | the values the guest typed, held in the page for the duration of the send, never in storage |
| Show the confirmation | the readable date, such as `Friday 20 September` | derived from the date input's ISO value with the browser's own local formatting (`en-GB`), decided in this spec; the café's notification keeps the ISO value |
| Show the confirmation | the café phone number | the existing contact line in `index.html` (`tel:+442071234567`) |
| Show a failure | the wording of each state | the message copy above, shaped by **AC-3** |
| Show a failure | the café phone number and email address | the existing contact line and mailto in `index.html` |
| Show the busy state | `Sending…` on the submit control | this spec, **AC-7** |
| Check the date | today, in the guest's own timezone | the guest's device clock, read as local date parts rather than as UTC |

**Key invariants**:

- The confirmation appears only after a reply that reports success
- A failure never clears the form
- The endpoint and the access key each live in exactly one place, and the markup and the script both read them from there
- The bot trap is never visible, never focusable and never announced
- No guest detail reaches `localStorage` or a cookie
- With JavaScript off the request still travels, so the form is never a dead end
- A success reply means an HTTP `200` **and** a parsed body that reports success: neither alone is enough, so a `200` whose body reports otherwise never paints the confirmation
- No `redirect` field is sent, so a guest with JavaScript off lands on the service's own confirmation page

**Security model**:

A public form: no accounts, no sessions, nothing to authorise. The access key is a public identifier that can only deliver to the café's own mailbox, so it is safe in the markup, and the café can rotate it in their account if a bot ever targets it. Personal data handled: a name, an email address and an optional note. The note copy stops inviting health details, so no special category data is asked for. Compliance scope is UK GDPR, with Web3Forms as a processor of the guest's details, which the deferred privacy notice has to name. Spam is handled by the hidden trap plus the service's own filtering, with no captcha and no third party script, so the page makes no new third party request beyond the post itself.

**Configuration required**:

No environment variables and no secrets. One value in `index.html`: the Web3Forms access key, in a hidden field, marked with a comment and holding a placeholder until the café signs up. A second fixed value sits beside it, the endpoint in the form's `action`.

**Critical test scenarios** (each maps to an acceptance criterion in `## Requirements`):

- Happy path: fill every field and submit with script on, expect the confirmation echoing the date, time, guests and cat, the form cleared, and one request at the service, verifies **AC-1**, **AC-6**, **AC-11**
- Unconfirmed failure: submit with the network offline or the endpoint unreachable, expect the could not confirm wording, every typed value intact, the control ready again and the phone number offered, verifies **AC-2**, **AC-3**, **AC-4**
- Rate limit: make the service answer `429`, expect the busy wording rather than the could not confirm wording, verifies **AC-2**, **AC-3**
- No script: submit with JavaScript off, expect the service's own confirmation page and the request present in the café's inbox, verifies **AC-5**
- Double press: press the control twice in quick succession, expect one request, the busy label, and the typed values untouched, verifies **AC-7**
- Bot trap: fill the hidden field, expect the page not to send, verifies **AC-8**
- Limits: pick yesterday in the date field and type past 500 characters in the note, expect the browser to refuse both, verifies **AC-10**
- Purpose line: read the line beside the submit control, expect the purpose and Web3Forms named, verifies **AC-9**

The happy path, the rate limit and the no script scenario all need a real access key, which is exactly what the switch on step makes testable.

## Build plan

Ordered for a Tracer Bullet: the first task proves the thinnest possible thread (the form's own markup carrying a real request, with no script at all), and every task after it thickens that thread.

1. Point the form at the service and prove the thin thread: set the form's `action` to the endpoint, add the hidden `subject` field and a hidden `access_key` holding one clearly commented placeholder, and confirm a plain post already travels with JavaScript off, satisfies **AC-5**, **AC-6**
2. Make the payload honest: align the time select's `value` attributes with the labels they display, cap the note at 500 characters, and derive the date minimum from local date parts so the guest's own day is respected, satisfies **AC-6**, **AC-10**
3. Replace the demo submit handler with the real send: one `fetch` to the endpoint as JSON, a fifteen second timeout, the in flight guard with `Sending…` and the busy mark, the reply mapped onto the three states using the message copy above, the form cleared only on success, and no value written to any storage, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-7**, **AC-11**
4. Keep the guest whole on failure: leave every typed value in place, make the control ready again, name the café phone number and email address in the failure wording, reveal the status line and then move focus to it so it is announced, satisfies **AC-2**, **AC-3**, **AC-4**
5. Add the bot trap and the purpose line: the hidden trap field named `botcheck`, hidden by a class in section 14 with `tabindex="-1"`, `aria-hidden="true"` and `autocomplete="off"`, plus one line beside the submit control naming the purpose and Web3Forms, satisfies **AC-8**, **AC-9**
6. Style the three states from tokens: add the alert colour pair to section 1 (for light and for dark) and the busy, sent and error state classes in section 14, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**

## Consequences

**Positive**:
- The page stops pretending: a guest is told the truth about their request
- The café receives real requests, with the guest's own email address as the reply to address
- Nothing new is built, installed or run, and the three file shape survives
- The form keeps working with JavaScript off, and no third party script joins the page
- The copy stops inviting health details it does not need

**Negative / tradeoffs**:
- Guest details now sit with a third party processor as well as in the café's inbox, which the deferred privacy notice has to name
- A real send depends on a value the café must paste in, and on a service outside our control: its free tier ceiling and any future price change are not ours to set
- A guest with JavaScript off leaves the page for the service's own confirmation page, in wording we do not own
- Three pieces of failure copy now have to stay honest if the service's behaviour changes
- A service outage or an exhausted quota means a request that cannot be sent, where the demo always appeared to succeed
- A guest whose send could not be confirmed may press again, and the first request may have arrived, so a duplicate is possible; the café spots a repeat by eye (an accepted tradeoff, taken instead of added machinery)

**Neutral**:
- One new third party request happens when a guest sends, joining the web fonts and the Unsplash photos already noted in the deferred privacy item
- The message copy now lives in `script.js` and in the markup, so a change of voice touches both
- The newsletter form stays a demo until feature 3, so the page is briefly half honest; that is scope, not oversight

## Follow-up

- [ ] The café opens a free Web3Forms account and the access key is pasted into the marked value in `index.html`. Until then the form can only fail honestly
- [ ] Confirm the current free tier monthly limit on Web3Forms' own pricing page when the account is created (that page refused an automated fetch during this design)
- [ ] The deferred privacy notice item in `docs/scope/scope.md` must name Web3Forms as a processor of guest details, alongside the web fonts and Unsplash photos already listed there
- [ ] Watch the first weeks of real requests for bot traffic. If the trap and the service's filtering prove thin, the next step is a capture challenge, which adds a third party script and needs its own decision
- [ ] Feature 3 in the scope, newsletter signup delivery, is the same shape of problem. Reuse this decision rather than choosing a second service without a reason

## References

**Project sources** (verifiable, in this repo):
- `AGENTS.md`: the no build step rule, progressive enhancement as a hard rule, the honest copy rule, and the note that features 2 and 3 are what make the two forms real
- `docs/scope/scope.md`: feature 2, Booking request delivery, and its Done when
- `index.html` (the form and the contact line) and `script.js` (the demo handler this replaces)
- `styles.css` section 1, design tokens, and section 14, visit and booking

**Practices & standards**:
- Progressive enhancement: the request travels from the form's own markup, so the baseline works without script
- Public identifier over hidden secret: a static page cannot keep a secret, so the key is chosen for its limited reach
- A honeypot rather than a capture challenge for a low volume form: fewer third party requests, and no puzzle for a guest
- Honest partial failure: report what is known (could not confirm) rather than asserting an outcome the page cannot observe
- A single configurable seam: one marked value to paste in on switch on day

**Links** (web verified only, `sources+links` level only):
- Web3Forms API reference, form submission using an access key: https://github.com/surjithctly/web3forms-docs/blob/main/getting-started/api-reference.md
- Web3Forms how to guides, HTML and JavaScript: https://docs.web3forms.com/how-to-guides/html-and-javascript
- Formspree, HTML forms with no server code: https://formspree.io/html/
- Formspree, submit forms with JavaScript: https://help.formspree.io/articles/building-your-form/submit-forms-with-javascript-ajax/
- Formspree security, United States hosting on AWS, GDPR through standard contractual clauses, SOC 2 Type II: https://formspree.io/security/
- Formspree pricing, free tier monthly submissions and archive: https://formspree.io/pricing/
- Formspark product page, spam filtering on every plan, customisable thank you, redirect and error pages: https://formspark.io/

No Web3Forms pricing link appears above because that page refused the fetch during this design; the Follow-up covers checking it at signup.

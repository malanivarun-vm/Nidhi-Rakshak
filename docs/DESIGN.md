# Nidhi Rakshak — Design System & Product UX Specification

**Status:** Ready for implementation  
**Product:** Nidhi Rakshak  
**Platform:** EPFO claim-rescue experience  
**Artifact:** `design.md`  
**Primary use:** Shared design contract for two developers building in parallel  
**Sources of truth:** `docs/PRD.md` §8 (Rejection Taxonomy v2), `docs/journeys.md` (journeys + screen inventory S1–S21), `assets/` (logo, favicon)  
**Last updated:** 27 August 2026

---

# 1. Product Design Thesis

Nidhi Rakshak should feel like a calm, competent guide inside EPFO that removes ambiguity from a rejected claim.

It should not feel like:

- a government form,
- a legal notice,
- a chatbot,
- an AI demo,
- a dense dashboard,
- or a troubleshooting manual.

The member should never need to understand EPFO’s internal terminology or Nidhi Rakshak’s internal taxonomy.

The experience should move the user through three questions:

1. **What happened?**
2. **What should I do or avoid doing?**
3. **Who acts next?**

The product should reveal supporting evidence only after the answer is clear.

The visual system should communicate trust through:

- clarity,
- consistency,
- source visibility,
- explicit ownership,
- honest uncertainty,
- and checkable reasoning.

Not through:
- fake confidence,
- excessive badges,
- AI branding,
- or bureaucratic density.

> **Design for comprehension before density. If we have to choose between showing more information and making the next action unmistakable, choose the next action.**

---

# 2. Primary ICP & Context

## Primary ICP

An EPFO member whose claim has already been rejected and who does not clearly understand:

- what went wrong,
- whether their own record is wrong,
- who owns the fix,
- what they should do next,
- and what they should avoid changing.

## Design priority

The system should work especially well for members who may have:

- low familiarity with EPFO terminology,
- lower digital confidence,
- cheaper or older Android phones,
- unstable connectivity,
- Hindi or code-mixed language preference,
- dependence on employers, family members, cyber cafes or helpers,
- difficulty deciding which record is “correct,”
- high risk of making unnecessary changes after a rejection.

This is a design priority, not an exclusion rule.

The same interface should work for digitally confident white-collar users.

---

# 3. Core Product Principles

## 3.1 Use context before asking

**Rule:** Never ask the member for information EPFO already has.

### Implementation consequence

The primary rejected-claim entry should not ask for:

- screenshots,
- UAN,
- claim ID,
- rejection reason,
- member name,
- or records already available in the claim context.

### Failure example

A first screen that says:

> Upload a screenshot of your rejected claim.

when the product was opened from that exact rejected claim.

---

## 3.2 Answer first, evidence second

### Meaning

The member should understand the diagnosis before seeing detailed record evidence.

### Implementation consequence

Prefer:

> **Your current name is correct. Don’t change it.**

followed by the supporting comparison.

Avoid opening on:

| Aadhaar | PAN | EPFO | Employer |
|---|---|---|---|

and expecting the member to infer the conclusion.

---

## 3.3 One obvious primary action

Every action-oriented screen should have one dominant CTA.

Secondary actions are allowed only when they are meaningfully secondary.

### Good

**Resolve this with EPFO**

Secondary:
See why

### Bad

- Continue
- Download
- Share
- Edit
- Go back
- Raise grievance
- View details

all competing at equal hierarchy.

---

## 3.4 Internal complexity stays internal

Never expose:

- `FIGHT`
- `FORWARD`
- `FIX`
- `MISMATCH`
- `journey_type`
- rejection codes
- model confidence
- internal ownership enums

as the member’s primary language.

---

## 3.5 Danger is explicit, not subtle

When a member could make a harmful change, the product must visibly stop them.

Example:

> **Your current name is correct. Don’t change it.**

This should not be buried in helper text.

---

## 3.6 Waiting is a valid resolution

The correct answer may be:

> **You don’t need to do anything right now.**

The design should not force every flow to end in a button that creates more activity.

---

## 3.7 Evidence is inspectable

If the product makes a consequential recommendation, the member should be able to inspect:

- which records were used,
- where they came from,
- what differed,
- and what is still unknown.

---

## 3.8 Uncertainty should look intentional

Unsupported or insufficient-evidence states must feel like valid product states.

They should not look like:

- server errors,
- empty states,
- broken AI,
- or “try again” loops.

---

## 3.9 Mobile is the default

Every P0 screen must be designed at 390px first.

Desktop should improve readability and comparison, not introduce a different mental model.

---

## 3.10 Typing is the last resort

Prefer:

1. system context,
2. one-tap confirmation,
3. selection,
4. camera/upload,
5. voice,
6. typing.

---

## 3.11 Trust through specificity

Prefer:

> Your 2019 PF record shows RAJESH.

over:

> We are 92% confident that a discrepancy exists.

---

## 3.12 Text must survive translation

No critical text should depend on:

- fixed-height cards,
- one-line labels,
- tiny buttons,
- or narrow columns.

Hindi expansion must not break core layouts.

---

# 4. Universal Information Hierarchy

For diagnosis and resolution screens, use this order:

## 1. What happened?

Plain-language diagnosis.

## 2. What should I not do?

Only when a harmful action is plausible.

## 3. What should I do now?

One primary action.

## 4. Who owns it?

Member, employer, bank, EPFO, or nobody right now.

## 5. Why?

Evidence, comparison, timeline or rule.

## 6. How can I check this?

Falsifiability or supporting document.

This hierarchy is the default product grammar.

Do not invert it unless the journey genuinely requires it.

---

# 5. Product Navigation Model

Nidhi Rakshak is task-oriented, not dashboard-oriented.

Primary entry:

```text
EPFO
↓
Claim Status
↓
Rejected Claim
↓
Understand & resolve this rejection
↓
Nidhi Rakshak
```

The user should feel like they are resolving one claim, not entering a new application.

## Primary flow shell

```text
Claim Context
↓
Diagnosis
↓
Resolution
↓
Action / Handoff / Wait
↓
Re-check
↓
Resolved / Next blocker
```

---

# 6. Visual Direction

## Desired feel

- calm
- direct
- human
- trustworthy
- grounded
- modern
- lightweight
- action-led

## Avoid

- fintech neon
- “AI assistant” gradients
- overuse of glowing cards
- government-portal imitation
- glassmorphism
- dense admin UI
- dashboard-first layouts
- playful gamification
- visual celebration of serious claim problems
- large decorative illustrations that push the answer below the fold

## Brand assets

The brand mark lives in `assets/`.

- `assets/logo.png` — full horizontal lockup: shield emblem, the "Nidhi Rakshak" wordmark, and the tagline "Understand · Fix · Move Forward". Use in app-intro, headers, the receipt footer, and external artifacts.
- `assets/favicon.png` — the shield emblem on its own (the same emblem the logo uses, so the two always match), plus `favicon-16/32/48/180.png` for browser tabs and home-screen icons.

Usage rules:

- Do not recolour, restretch, or add effects to the mark.
- Keep clear space around the logo roughly equal to the height of the shield.
- The favicon must stay the logo's own emblem. If the logo art changes, re-export the favicon from it so they never diverge.
- The mark is brand chrome, not a member-facing status icon. Never reuse the shield or its green check to signal a per-record verified or resolved state inside a flow. Those states use the icon system in §11.

## Brand palette

These brand colours are the source for the semantic tokens in §7. Feature code still binds to semantic tokens, never to these hex values directly.

| Role | Brand hex | Notes |
|---|---|---|
| Brand blue (primary) | `#005FCD` | Wordmark "Nidhi"; source for `--action-primary` |
| Brand navy (dark) | `#002353` | Wordmark "Rakshak"; headings, `--text-primary` on light |
| Brand blue bright | `#0182FB` | Shield highlight; gradients and accents only, never body text |
| Brand green | `#1CB36B` | Tagline swoosh and the forward arrow; the "move forward" accent |
| Signal green (success) | `#12924A` | Accessible success text and icon; `--state-success` |
| Signal red (danger) | `#D92D20` | `--state-danger`; reserved per §7 rules, not "the claim was rejected" |
| Signal amber (warning) | `#B45309` | `--state-warning` |

The red and green inside the mark itself (the rejected-document stamp and the check) are illustration colours. Do not read product meaning from them.

---

# 7. Design Tokens

The implementation should reuse existing project tokens if present. If none exist, use this system.

## 7.1 Color Roles

Do not bind product meaning directly to literal hex values in feature code.

Use semantic tokens. The concrete brand values that back these tokens are in the Brand palette (§6).

```text
--bg-page
--bg-surface
--bg-subtle
--bg-elevated

--text-primary
--text-secondary
--text-muted
--text-inverse

--border-default
--border-strong

--action-primary
--action-primary-hover
--action-primary-disabled

--state-success
--state-success-bg

--state-warning
--state-warning-bg

--state-danger
--state-danger-bg

--state-info
--state-info-bg

--focus-ring
```

### Color rules

**Danger** is reserved for:

- Do Not Touch,
- destructive action,
- high-risk correction,
- serious failure.

Do not use danger red simply because the claim was rejected.

**Warning** is for:

- attention required,
- uncertain evidence,
- partial information.

**Success** is for:

- blocker cleared,
- action completed,
- verified value,
- resolved state.

**Info** is for:

- explanations,
- contextual guidance,
- neutral ownership.

Do not rely on color alone.

Every semantic state requires:
- icon or marker,
- label,
- textual explanation.

---

# 8. Typography

Typography must remain readable on low-end mobile displays.

## Default family

Use the project’s existing UI font if it supports:

- Latin,
- Devanagari,
- numerals,
- mixed English/Hindi layouts.

If not, choose a widely available UI family with strong Devanagari support.

Do not introduce separate visual identities for English and Hindi.

## Type scale

### Display / Hero

Use sparingly.

Purpose:
- major completed state,
- key product intro.

### H1

Use for the answer to the member’s current question.

Examples:

> We found the problem.

> Your current name is correct.

> Your previous employer needs to fix this.

### H2

Use for major supporting sections.

Examples:

> What we found

> What happens next

> Check this yourself

### H3

Use for compact cards and subsections.

### Body

Primary explanation text.

### Small

Metadata, source, helper copy.

### Label

Source names, statuses, field names.

### Data value

Names, dates, IFSC, account fragments, employer values.

## Typography rules

- minimum body size should remain comfortable on mobile,
- avoid body text below 14px,
- avoid long uppercase strings,
- avoid light font weights,
- use 1.4–1.6 line height for explanatory text,
- use stronger weight for actual record values,
- never use monospace for member-facing data unless technically necessary.

---

# 9. Spacing System

Use a small consistent scale.

Suggested conceptual scale:

```text
2
4
8
12
16
20
24
32
40
48
64
```

Feature components should not introduce arbitrary spacing values.

## Default mobile page

- horizontal gutter: 16px
- vertical section gap: 24–32px
- related-item gap: 8–12px
- card padding: 16px minimum
- primary CTA minimum vertical tap area: 44px

---

# 10. Radius, Borders & Elevation

## Radius

Use a restrained hierarchy:

- small: controls
- medium: cards
- large: sheets / major surfaces

Avoid overly rounded “toy UI.”

## Shadows

Use minimally.

Most hierarchy should come from:
- spacing,
- surface change,
- border,
- typography.

## Borders

Use subtle borders for evidence and structural grouping.

Use stronger border treatment for:
- selected value,
- mismatch,
- Do Not Touch,
- important state.

---

# 11. Icon System

Use one existing icon library if available.

Do not mix icon families.

## Icon rules

- icons support text; they do not replace it,
- ownership should always have a text label,
- mismatch should always have a textual explanation,
- do not use ambiguous shield/check icons without labels,
- keep core icons visually simple.

Recommended conceptual icon roles:

- issue
- verified
- mismatch
- employer
- bank
- EPFO / institution
- member
- document
- timeline
- warning
- audio
- share
- retry
- resolved

---

# 12. Motion

Motion should explain a state change.

Use motion for:

- diagnosis completion,
- mismatch reveal,
- Mool timeline expansion,
- simulation before/after,
- blocker resolved,
- sheet transitions.

Avoid:

- bouncing buttons,
- confetti,
- looping animations,
- animated “AI thinking,”
- aggressive progress theatrics.

## Motion rule

All important meaning must still be understandable with reduced motion enabled.

---

# 13. Copy System

Copy is part of the design system.

## 13.1 Voice

Use:

- short sentences,
- active voice,
- explicit actor,
- plain language,
- one idea per sentence.

## 13.2 Avoid bureaucratic language

Prefer:

> Your previous employer needs to update this.

Avoid:

> Action is required from the establishment.

Prefer:

> Your current name is correct. Don’t change it.

Avoid:

> Current member master is valid. No modification advised.

---

# 14. CTA Rules

A CTA should describe the actual next action.

## Good

- Fix this detail
- Resolve this with EPFO
- Send this to my employer
- Add this document
- Check again
- View what changed
- Share case summary
- Continue with my claim

## Avoid

- Proceed
- Next
- Submit
- Continue

unless the next step is completely obvious from context.

---

# 15. Canonical Screen Shell

Most task screens should use this shell:

```text
[Claim context / compact header]

[Primary answer]

[Safety warning, only when needed]

[Primary CTA]

[Supporting explanation]

[Evidence / timeline / rule]

[Check-us / trust line]

[Secondary action]
```

## Rule

The member should usually see:

- the answer,
- warning if applicable,
- and primary CTA

without needing to scroll through detailed evidence first.

---

# 16. Shared Primitive Components

These primitives are shared and should be implemented once.

- Button
- IconButton
- Card
- Alert
- Divider
- Badge
- StatusLabel
- Accordion
- BottomSheet
- Dialog
- Skeleton
- Toast
- ProgressIndicator
- FileUpload
- RadioGroup
- Checkbox
- InlineNotice
- SourceLabel
- AudioButton
- StepHeader

Do not create feature-specific copies such as:

- `DiagnosisButton`
- `ResolutionButton`
- `EmployerButton`

if the underlying primitive is the same.

---

# 17. Shared Feature Components

These may be shared across domains but must have one clear owner.

- ClaimContextHeader
- PrimaryAnswer
- OwnershipCard
- EvidenceSource
- SourceValue
- VerificationState
- PrimaryActionFooter
- TrustDisclosure
- PrototypeNotice

These should be frozen early because both implementation tracks will depend on them.

---

# 18. Journey Family Composition

Journey families define which feature modules appear.

## MISMATCH

Typical composition:

```text
Decode
↓
Record Diff
↓
Mool, if history matters
↓
Ownership
↓
Do Not Touch, if Fight
↓
Try Before You Touch
↓
Falsifiability
↓
Correction Route, if the member corrects
↓
Resolution
```

## MISSING_DATA

```text
Decode
↓
Missing Detail
↓
Why it matters
↓
Ownership
↓
Evidence request or handoff
↓
Tracking
```

## VALIDATION_FAILURE

```text
Decode
↓
Exact failing component
↓
Comparison / evidence
↓
Ownership
↓
Fix or escalation
```

## SERVICE_HISTORY

```text
Decode
↓
Service Timeline
↓
Blocking event
↓
Mool, where useful
↓
Ownership
↓
Handoff / resolution
```

## ELIGIBILITY

```text
Decode
↓
Rule explanation
↓
Current claim vs rule
↓
Alternative / wait
```

## RECORD_CONSOLIDATION

```text
Decode
↓
Record map
↓
Relationship explanation
↓
Ownership
↓
Merge / transfer / escalation
```

## PENDING_PROCESS

```text
Current process
↓
Owner
↓
Do I need to act?
↓
Wait / track / escalate
```

## UNSUPPORTED

```text
Refusal
↓
What is missing / unsupported
↓
Evidence request, if useful
↓
Safe fallback
```

---

# 19. Decode Module

## Purpose

Translate EPFO’s rejection into one plain-language statement.

## Anatomy

1. short label: Claim rejected
2. clear headline
3. one-sentence explanation
4. optional “EPFO said” expandable detail

## Example

### We found what EPFO is flagging.

One of your older PF records has a different name.

### Optional detail

**EPFO message:** Discrepancy in name

Do not make the raw rejection the dominant visual element.

---

# 20. Record Diff

## Purpose

Show exactly which values disagree.

The member should understand the mismatch in under 3 seconds.

## Mobile design

Do not use a spreadsheet table.

Use stacked source cards:

```text
Aadhaar
RAMESH BADIGER
✓ Matches

PAN
RAMESH BADIGER
✓ Matches

Current PF
RAMESH BADIGER
✓ Matches

2019 PF record
RAJESH BADIGER
⚠ Different
```

## Highlighting

Highlight only the exact meaningful difference where possible.

Example:

`RAMESH`
vs
`RAJESH`

Do not color the entire record red unless the whole record is invalid.

## Source states

Use:

- Matches
- Different
- Missing
- Could not verify

Avoid:
- Correct / Wrong

unless the product has sufficient evidence to make that claim.

---

# 21. Record Diff Edge Cases

## 2 sources

Use direct side-by-side or stacked comparison.

## 3–5 sources

Stack by source, with matching records visually grouped.

## Long names

Allow wrapping.

Never truncate the decisive substring.

## Dates

Use one human-readable format consistently.

## Account / IFSC

Mask sensitive portions if real data is ever used.

## Missing value

Show:

> Not available

not:
`null`

## Multiple mismatches

Do not show everything at once.

Lead with the blocker relevant to the current rejection.

Allow “See other differences” if needed.

---

# 22. Mool

## Purpose

Show the first observable relevant divergence.

## User-facing framing

> **We found where the mismatch starts.**

Avoid:

- Root cause identified
- Responsible employer identified
- Error originated here

unless direct evidence supports it.

## Anatomy

1. headline
2. one-sentence explanation
3. timeline
4. first divergent event
5. evidence state
6. “What we don’t know”

## Example

```text
2017 employment record
RAMESH
Matches

2018 employment record
RAMESH
Matches

2019 employment record
RAJESH
First different record

Current record
RAMESH
Matches
```

Then:

> The first different value we can see appears in the 2019 record.

> We cannot see who entered it.

---

# 23. Mool Evidence States

Use textual states:

## Verified

> This value appears directly in the source record.

## Inferred

> The timeline suggests this is where the difference begins, but the exact change event is not available.

## Unknown

> We do not have enough evidence to locate the earlier change.

Do not use numeric confidence percentages.

---

# 24. Service Timeline

## Purpose

Explain service-history blockers.

## Anatomy

Each employment block shows:

- employer
- joining date
- exit date
- contribution range if relevant
- relevant status

Example:

```text
ABC Industries
Jan 2018 → Jun 2020

XYZ Ltd
May 2020 → Present
```

Then:

> **These employment dates overlap by one month.**

The blocking relationship should be explained immediately below the timeline.

---

# 25. Missing Detail

## Purpose

Explain a required field that is absent.

## Anatomy

### Headline

> Your last working day is missing.

### Why it matters

> EPFO needs this date before this claim can move forward.

### Owner

> Your previous employer needs to update it.

### CTA

**Send this to my employer**

Avoid technical field names like:

`date_of_exit = NULL`

---

# 26. Rule Explanation / Eligibility

## Purpose

Explain why the current claim configuration cannot proceed.

## Pattern

### Your details are okay.

Then:

> This claim cannot be processed in its current form because…

Show:
- current claim choice,
- blocking rule,
- valid alternative if supported.

Do not make eligibility failures look like identity errors.

---

# 27. Ownership UI

Ownership is a core reusable component.

Possible user-facing states:

## MEMBER

> **You need to fix this.**

## EMPLOYER

> **Your previous employer needs to fix this.**

## BANK

> **Your bank needs to verify this.**

## EPFO

> **EPFO needs to review this.**

## NOBODY RIGHT NOW

> **You don’t need to do anything right now.**

## Anatomy

- actor icon
- clear headline
- one sentence on why
- one next action
- optional expected next state

Do not show the enum itself.

---

# 28. Do Not Touch

## Purpose

Stop the member from making a harmful correction.

This is a dedicated product state.

## Example

### Your current name is correct. Don’t change it.

Your Aadhaar, PAN and current PF record already match.

Changing your current name could create more mismatches.

**Primary CTA:** Resolve this with EPFO

Secondary:
See why

## Visual treatment

- high visual priority,
- danger icon or strong warning marker,
- restrained danger background/border,
- no full-screen red,
- no competing edit CTA.

---

# 29. Try Before You Touch

## Purpose

Let the member see the consequence of a proposed correction before taking action.

## Fight example

### Before

1 mismatch

### If you change your current name

2 mismatches

### Result

> **This change creates more mismatches.**

> Keep your current name as it is.

## Fix example

### Before

1 blocker found

### After proposed correction

No blocker found in the checks we support.

### Result

> **Correcting this detail clears the blocker we found.**

Do not say:

> Your claim will now be approved.

---

# 30. Simulation Interaction

## Controls

The user should not manually type arbitrary values for the golden flow.

Use:
- proposed known correction,
- one-tap preview,
- clear before/after.

## Animation

A short transition can show values changing.

But the static state must also clearly communicate the result.

## Required label

> **Simulation only**

for prototype/demo actions.

---

# 31. Falsifiability

## Purpose

Give the user a concrete way to challenge the diagnosis.

## Pattern

### Want to double-check this?

> If your 2019 payslip also shows RAMESH BADIGER, this diagnosis may be wrong.

Optional CTA:

**Add this document**

or:

**I’ll check this myself**

## Visual treatment

Neutral trust card, not a warning.

This should feel empowering.

---

# 32. Evidence Request

Evidence capture appears only when it can materially change the diagnosis.

## Pattern

### We need one more record to be sure.

> A payslip or joining document from your 2019 employer can help us check which record is different.

Primary CTA:

**Take a photo**

Secondary:

**Upload document**

## Guidance

Before camera/upload, show:

- what document,
- what part must be visible,
- why it matters.

Bank cheque or passbook capture is no longer required for online claims that pass validation (PRD §8.4, category B). Do not request it for a bank rejection.

---

# 33. Extraction Confirmation

If extraction is high confidence:

Show the extracted value and continue.

If confidence is low:

### We found this name:

**RAMESH BADIGER**

> Is this correct?

**Yes**

**No**

Do not force typing unless the user says No and no better structured option exists.

---

# 34. Resolution Summary

Resolution screens translate the internal verdict. Taxonomy v2 also uses FORK, meaning the verdict depends on the member's records. The engine resolves FORK to one of the states below before this screen renders, so the member never sees FORK.

## FIX

### One detail needs to be corrected.

Then:
- exact field,
- current value,
- correct value if known,
- primary correction CTA.

## FIGHT

### Your current details are correct. Don’t change them.

Then:
- why,
- EPFO action,
- resolution CTA.

## FORWARD

### Your previous employer needs to fix this.

Then:
- exact action required,
- handoff CTA.

## NONE

### We can’t safely tell you what to change yet.

Then:
- why,
- evidence or fallback CTA.

---

# 34A. Correction Route (Branch Ladder)

## Purpose

For a Fix or Forward that touches a name, date of birth, or profile field, ownership alone does not tell the member how to correct it. The correction route depends on four facts about their account, not on what went wrong. This module shows which of four routes applies and why the others do not. It is screen S21 in `docs/journeys.md`, it feeds Try Before You Touch (§29), and the full logic and inputs live in PRD §8.6.

## Show one route, not a menu

Do not present four branches as a chooser. The engine reads the inputs, selects the route, and the UI shows that route with a short reason. The others sit behind an optional "why this route" disclosure.

## Anatomy

1. headline naming the route in plain language, for example "You can fix this yourself" or "Only your previous employer can change this"
2. one sentence on why this route and not the others
3. the concrete steps, or the handoff, for the selected route
4. a human time expectation: minutes, a few days, weeks
5. optional "Why this route" disclosure naming the routes that do not apply

## The four routes, in member language

| Route | Member-facing framing | Time |
|---|---|---|
| Self-service | "You can fix this yourself right now." | Minutes |
| Employer certification | "Your employer needs to confirm this once." | A few days |
| Previous employer files it | "Only your previous employer can change this record." | Weeks |
| Offline attested route | "This one needs a signed form and an attesting officer." | No fixed timeline |

Never show route numbers or the input enum names.

## Design rules

- One route is dominant, with one primary CTA.
- The offline route must not read as a dead end. Name the attesting authority (bank manager, gazetted officer, magistrate) and the closure letter as concrete steps.
- Reuse OwnershipCard and PrimaryActionFooter. Do not build a route-specific card system.
- If the selecting input is unknown (see the BLOCKING item in PRD §44: whether self-service reaches past member-ID records), show the safe employer route, never a guessed self-service path.

## The reframe

The moment is not "this is unfixable." It is: there are a few ways to fix this, one applies to you, here is that one and why. Present it as a solved routing problem, not as bureaucracy the member has to navigate.

---

# 35. Handoff

The handoff artifact is designed for the receiver.

## Employer handoff anatomy

### Action required for PF claim

- member name
- synthetic UAN/member ID in prototype
- employer
- issue
- exact field/action required
- supporting context
- requested next action
- case reference
- prototype label

## Member actions

Primary:

**Share with employer**

Secondary:

**Copy message**

Optional:

**View full case**

---

# 36. Receipt

The primary receipt format is a forwardable image.

## Receipt must contain

- claim issue
- what was found
- first relevant divergence, if applicable
- current owner
- what not to change
- next action
- key evidence
- falsifiability / check-us line
- current state
- SIMULATED PROTOTYPE label

## Design rule

The receipt must remain understandable when viewed outside the app.

Do not rely on hidden context.

---

# 37. Tracking

Do not show fake percentages.

## Tracking card

### Current blocker

Date of Exit missing

### Waiting on

Previous employer

### Last action

Request shared

### Next step

Employer updates Date of Exit

### Check again

Only show a date if based on a verified rule or user-selected reminder.

## States

- action required
- waiting
- external action completed
- blocker remains
- resolved
- new blocker found
- repeated rejection

---

# 38. Waiting / No Action

A valid state may be:

### Your transfer is already being processed.

You don’t need to submit another request.

**Current owner:** EPFO

**Your next action:** Nothing right now

Primary CTA:

**Check transfer status**

The UI must not make inactivity look like a dead end.

---

# 39. Re-check

After a meaningful action:

### Checking this issue again…

Then one of:

## Cleared

> **The issue we found is now resolved.**

## Still present

> **This issue is still showing.**

## New blocker

> **The previous issue is resolved, but we found another problem.**

Do not collapse all re-check outcomes into generic success/error.

---

# 40. Resolved

## Pattern

### The issue we found has been resolved.

> Your records now pass the checks that previously found this blocker.

Primary CTA:

**Continue with my claim**

Do not say:

> Your claim will be approved.

---

# 41. Unsupported / Refusal

This must look like intentional boundedness.

## Pattern

### We can’t safely diagnose this rejection yet.

> The information available is not enough for us to tell you what should be changed.

Then either:

### If a specific document would help

**Add this document**

or:

### If genuinely unsupported

**Get help with this claim**

## Avoid

- Something went wrong
- Try again
- AI failed
- Unknown error

unless there is actually a technical error.

---

# 42. Loading States

Loading copy should describe what the system is doing in user terms.

## Good

> Checking the details linked to this claim…

> Comparing the records relevant to this rejection…

> Checking whether this change clears the blocker…

## Avoid

> AI is thinking…

> Running agent…

> Processing pipeline…

---

# 43. Error States

Technical failure and product uncertainty are different.

## Technical failure

> We couldn’t load the claim details.

CTA:

**Try again**

## Product uncertainty

> We can’t safely diagnose this rejection yet.

CTA:

**See what we need**

Do not use the same design for both.

---

# 44. Empty & Partial States

## Empty

Only show if the product truly has nothing to display.

Example:

> No previous actions yet.

## Partial

If some evidence is available:

> We found part of the information we need.

Then explicitly show:
- what is known,
- what is missing,
- what can happen next.

---

# 45. Offline / Weak Network

The interface should preserve already-loaded case information when possible.

If connectivity is lost:

> You’re offline. Your current case is still available.

Disable actions that require network and explain why.

Avoid losing user-provided evidence without warning.

---

# 46. Audio / Low-Literacy Support

Audio is supportive, not required for P0.

## Priority content for “Hear this”

1. primary diagnosis
2. Do Not Touch warning
3. next action
4. owner
5. evidence request

Use:

🔊 Hear this

Do not autoplay audio.

## Interaction

- tap to play,
- tap again to pause,
- show replay,
- preserve text alongside audio.

---

# 47. Multilingual / Hindi

The UI must be resilient to English/Hindi expansion.

## Rules

- no fixed-height text cards,
- CTAs may wrap to two lines if needed,
- avoid overly narrow columns,
- support Devanagari in selected font,
- preserve numerals and dates clearly,
- do not encode important meaning only in acronyms,
- avoid sentence fragments that translate poorly.

Internal terms such as:
- KYC
- UAN
- EPFiGMS

should either:
- be expanded,
- explained,
- or hidden behind the actual user action.

---

# 48. Accessibility

Minimum requirements:

- 44px minimum touch target,
- visible focus,
- keyboard access,
- semantic headings,
- screen-reader reading order matches visual order,
- form controls have labels,
- errors announced,
- status not communicated by color alone,
- sufficient contrast,
- zoom does not break layout,
- reduced-motion support,
- audio controls have accessible labels.

## Low-literacy accessibility

Also test:

- short sentences,
- no jargon,
- visual grouping,
- explicit actor,
- clear next action,
- minimal choices,
- no unnecessary forms.

---

# 49. Responsive Layout

## 390px

Primary target.

Rules:
- single-column,
- 16px gutters,
- stacked evidence,
- sticky primary CTA where helpful,
- bottom-sheet secondary detail,
- avoid horizontal tables,
- timelines remain readable without horizontal scrolling where possible.

## 768px

Allow:
- wider evidence cards,
- selective two-column comparison,
- greater whitespace.

Do not radically change navigation.

## 1280px

Use a centered content column.

For evidence-heavy views, optional split:

```text
Primary answer / action
|
Supporting evidence
```

or:

```text
Answer / action       Evidence
```

if the hierarchy remains clear.

Do not stretch body copy across the full screen.

---

# 50. Primary Action Footer

On long mobile screens, the primary CTA may become sticky.

## Rules

- one primary CTA,
- safe-area aware,
- must not cover important evidence,
- secondary action remains in content unless genuinely necessary.

---

# 51. Journey-Specific Screen Inventory

The reusable module inventory (S1–S21, including S21 Correction Route) and all eight journey families live in `docs/journeys.md`. The flow screens below compose those modules for the four P0 golden flows. Where a Fix or Forward lets the member correct a profile field, insert the Correction Route module (§34A) before the correction step.

## P0 Fight Flow

### F1 — Rejected Claim Entry

**Owner:** A  
**Purpose:** Enter rescue flow from EPFO claim context  
**Primary message:** Claim rejected  
**CTA:** Understand & resolve this rejection  
**Modules:** ClaimContextHeader  
**States:** normal, loading, technical error

### F2 — Diagnosis Loading

**Owner:** A  
**Primary message:** Checking the details linked to this claim…  
**States:** loading, partial, technical error

### F3 — Mismatch Diagnosis

**Owner:** A  
**Primary message:** We found the problem.  
**Modules:** Decode, Record Diff  
**CTA:** See where this mismatch starts

### F4 — Mool

**Owner:** A  
**Primary message:** We found where the mismatch starts.  
**Modules:** DivergenceTimeline  
**CTA:** See what you should do

### F5 — Do Not Touch

**Owner:** A  
**Primary message:** Your current name is correct. Don’t change it.  
**CTA:** Resolve this with EPFO  
**Secondary:** See why

### F6 — Simulation

**Owner:** B  
**Primary message:** See what would happen if you changed it.  
**Modules:** SimulationComparison  
**CTA:** Keep my current details

### F7 — Falsifiability

**Owner:** B  
**Primary message:** Want to double-check this?  
**CTA:** Add supporting document / Continue

### F8 — EPFO Resolution

**Owner:** B  
**Primary message:** Here’s what EPFO needs to review.  
**CTA:** Review my case

### F9 — Receipt

**Owner:** B  
**Primary message:** Your case summary is ready.  
**CTA:** Share case summary

---

# 52. P0 Forward Flow

Date of Exit is a FORK (PRD §8, Golden Case 2). If the member is Mark-Exit-eligible (two months since the last PF contribution received, an Aadhaar-verified UAN, and the exit date inside the last-contribution month) the route is self-serve, handled through the Correction Route (§34A) as a Fix, not this employer flow. The golden Forward demo uses the employer-owned state. Route an eligible member to self-serve; do not send them to their employer.

### W1 — Missing Detail

**Owner:** A  
**Primary message:** Your last working day is missing.  
**CTA:** See who needs to fix this

### W2 — Service Context

**Owner:** A  
**Primary message:** We found the missing point in your employment record.  
**Modules:** ServiceTimeline

### W3 — Ownership

**Owner:** B  
**Primary message:** Your previous employer needs to update this.  
**CTA:** Send this to my employer

### W4 — Employer Handoff

**Owner:** B  
**Primary message:** This is what your employer needs to do.  
**CTA:** Share with employer

### W5 — Tracking

**Owner:** B  
**Primary message:** Waiting on your previous employer.  
**CTA:** Check for update

---

# 53. P0 Fix Flow

Bank corrections changed with the 3 April 2025 circular (PRD §8.4, category B): no employer approval step, and no cheque or passbook upload when the account passes bank or NPCI validation. A spouse-joint account is valid; never tell a member to open a new account when theirs is individual or joint with a spouse. Only a non-spouse or third-party joint account fails.

### X1 — Validation Diagnosis

**Owner:** A  
**Primary message:** One bank detail needs to be corrected.  
**Modules:** field comparison  
**CTA:** See the fix

### X2 — Simulation

**Owner:** B  
**Primary message:** This correction clears the blocker we found.  
**CTA:** Fix this detail

### X3 — Correction Route

**Owner:** B  
**Primary message:** Update this bank detail in your PF account.  
**CTA:** Update bank details

### X4 — Re-check

**Owner:** B  
**Primary message:** Checking the bank issue again…  
**Terminal:** cleared / still blocked / new blocker

---

# 54. P0 Refusal Flow

### R1 — Unsupported

**Owner:** A  
**Primary message:** We can’t safely diagnose this rejection yet.  
**CTA:** See what we need / Get help with this claim

### R2 — Evidence Request, if applicable

**Owner:** A  
**Primary message:** We need one more record to be sure.  
**CTA:** Take a photo  
**Secondary:** Upload document

### R3 — Safe Fallback

**Owner:** B if it becomes a resolution route  
**Primary message:** This rejection is not supported yet.  
**CTA:** Get help through EPFO

---

# 55. Component Ownership for Parallel Build

Two developers are building independently.

The UI boundary must mirror the engineering boundary.

## Shared / Integration-Owned

These should be created/frozen before both feature tracks diverge:

```text
components/ui/**
components/shared/ClaimContextHeader
components/shared/PrimaryAnswer
components/shared/OwnershipCard
components/shared/SourceLabel
components/shared/VerificationState
components/shared/PrimaryActionFooter
components/shared/PrototypeNotice
styles/tokens/**
global typography
global layout shell
```

Exact paths should follow the actual repo.

---

# 56. Teammate A — Claim Intelligence UI Ownership

Owns:

```text
features/diagnosis/**
features/evidence/**
features/mool/**
features/service-timeline/**
features/refusal/**
```

Conceptual components:

- RejectionSummary
- DiagnosisLoading
- RecordComparison
- DivergenceTimeline
- MissingDetail
- ServiceTimeline
- EvidenceRequest
- DoNotTouchCard
- UnsupportedState
- DiagnosisSummary

A may read shared components.

A must not edit B feature components.

---

# 57. Teammate B — Resolution & Recovery UI Ownership

Owns:

```text
features/resolution/**
features/simulation/**
features/handoff/**
features/receipt/**
features/tracking/**
```

Conceptual components:

- ResolutionSummary
- SimulationComparison
- ResolutionRoute
- EmployerHandoff
- EPFOHandoff
- BankHandoff
- CaseReceipt
- ClaimTracker
- RecheckState
- ResolvedState
- WaitState

B may read A’s DiagnosisResult contract.

B must not duplicate diagnosis UI.

---

# 58. Shared Component Rule

If both developers need the same primitive:

Do not independently create two versions.

Shared primitives must be:

1. defined once,
2. committed in shared foundation,
3. treated as stable,
4. changed through an explicit integration commit if necessary.

Avoid:

```text
features/diagnosis/Button.tsx
features/resolution/Button.tsx
```

when both are the same design primitive.

---

# 59. Design File Ownership

Protect these from simultaneous editing:

- root layout
- global CSS
- Tailwind config
- token files
- typography setup
- icon provider
- shared primitives
- shared screen shell

Any necessary modification after branching should happen through a small integration commit and be synced into both worktrees.

---

# 60. Analytics-Related UX Considerations

Analytics must not distort the interaction.

Do not add extra screens purely to create funnel events.

Track meaningful user states such as:

- rescue opened
- diagnosis shown
- Do Not Touch shown
- simulation completed
- evidence requested
- resolution started
- handoff shared
- case rechecked
- blocker resolved
- refusal shown

Do not show analytics-derived “confidence” or “success probability” to the user unless deliberately designed and valid.

---

# 61. Prototype Labels

The hackathon build is simulated.

Any surface implying a real write or submission must show a clear but non-disruptive label.

Examples:

> **Prototype simulation**

> No EPFO record will be changed.

For receipts:

> **SIMULATED PROTOTYPE**

Do not put the label above the primary diagnosis unless required.

It should be visible without overwhelming the task.

---

# 62. Anti-Patterns

The following are explicitly banned.

## Product language

- “Verdict: FIGHT” or “FORK”
- “Journey type: MISMATCH”
- “Mool result”
- raw rejection code as headline
- unexplained KYC/EPFiGMS terminology

## Interaction

- screenshot upload as primary rejected-claim entry
- asking for UAN when claim context exists
- typing-first forms
- chatbot-first interaction
- multiple primary CTAs
- asking member to choose bureaucratic route manually

## Visual

- dense dashboard
- red entire screen because claim is rejected
- random colors per rejection type
- fake AI gradients
- fake “AI confidence”
- fake progress percentages
- excessive status badges
- spreadsheet-style mobile comparison
- tiny helper text containing the real warning
- decorative illustrations pushing the answer below fold

## Trust

- hidden evidence
- unsupported diagnosis presented confidently
- assigning blame from chronology alone
- claiming claim approval after simulation
- vague “contact support” terminal state
- telling a member to open a new bank account when an individual or spouse-joint account is already valid

## Parallel implementation

- duplicated primitives
- separate token systems
- competing ownership cards
- branch-specific global styles
- feature code editing protected shared files without coordination

---

# 63. Design QA — Pre-Build Gate

Before feature implementation starts:

- [ ] token system defined
- [ ] typography defined
- [ ] shared primitives assigned
- [ ] shared screen shell agreed
- [ ] A/B component ownership clear
- [ ] golden flow screen inventory complete
- [ ] mobile-first states specified
- [ ] internal taxonomy hidden from user copy
- [ ] prototype labelling defined
- [ ] unsupported state designed
- [ ] no load-bearing visual decision remains ambiguous

---

# 64. Design QA — Per Screen

For every P0 screen ask:

- [ ] Can the user tell what happened?
- [ ] Is the primary action obvious in under 5 seconds?
- [ ] Is there only one dominant CTA?
- [ ] Is the actor/owner explicit?
- [ ] If harmful action is possible, is it explicitly prevented?
- [ ] Does the answer appear before detailed evidence?
- [ ] Is jargon hidden or explained?
- [ ] Does the screen work at 390px?
- [ ] Does text expansion work?
- [ ] Does status remain understandable without color?
- [ ] Is loading defined?
- [ ] Is technical error defined?
- [ ] Is partial state defined if relevant?
- [ ] Is back/retry behavior clear?
- [ ] Is prototype simulation labelled where relevant?

---

# 65. Golden Flow Design Audit

## Fight

The member must be able to answer:

- What is different?
- Which record is different?
- Is my current name correct?
- Should I change it?
- Why not?
- What happens if I do?
- Who should act instead?
- How can I check the diagnosis?

If any answer requires a team member to verbally explain the prototype, revise the UI.

---

## Forward

The member must understand:

- what is missing,
- why it blocks the claim,
- why they cannot fix it,
- who owns it,
- exactly what the employer needs to do,
- what happens after sharing.

The employer artifact must be independently understandable.

---

## Fix

The member must understand:

- exactly which value is wrong,
- what the proposed correction is,
- what the simulation does and does not prove,
- where they need to make the correction,
- how the product will re-check it.

---

## Refusal

The member must understand:

- that the product is intentionally not guessing,
- why it cannot safely diagnose,
- whether more evidence can help,
- what the safest fallback is.

The state must not look broken.

---

# 66. Demo-Specific Design Priorities

For the hackathon, prioritize polish in this order:

1. Fight flow
2. Forward flow
3. Fix flow
4. Refusal
5. Receipt
6. Tracking
7. Pre-flight
8. Additional journey-family coverage

The most important “trust beat” is:

> **Your current name is correct. Don’t change it.**

The most important “system intelligence beat” is:

> **We found where the mismatch starts.**

The most important “action beat” is:

> **Your previous employer needs to fix this.**

The most important “boundedness beat” is:

> **We can’t safely diagnose this rejection yet.**

---

# 67. Implementation Notes for Shared Design

## Do not over-componentize too early

A component deserves extraction when:

- reused across flows,
- has meaningful state,
- or enforces a design rule.

Do not create a component for every wrapper or sentence.

## Do not under-componentize critical patterns

The following should be reusable:

- PrimaryAnswer
- OwnershipCard
- SourceValue
- VerificationState
- DoNotTouchCard
- SimulationComparison
- EvidenceRequest
- CaseReceipt
- ClaimTracker
- UnsupportedState

---

# 68. Open Design Decisions

These should be resolved against the real repo before build if not already known.

1. Exact font family and Devanagari support.
2. Existing token system vs new token file.
3. Existing icon library.
4. Existing primitive component library.
5. Whether the app shell visually mirrors EPFO or uses a distinct embedded Nidhi Rakshak surface.
6. Whether audio ships in P0 demo or stays prepared but disabled.
7. Whether the receipt is generated as image directly in client or via backend.
8. Whether the mobile primary CTA is always sticky or only on long screens.
9. Exact bilingual switching pattern if Hindi is included in demo.
10. How much existing EPFO chrome is simulated around Nidhi Rakshak.

None of these should change the core interaction model.

---

# 69. Final Design Contract

The product can contain complicated internal logic:

```text
rejection taxonomy
→ evidence
→ journey family
→ Mool
→ ownership
→ Fix/Fight/Forward
→ routing
```

The member-facing product should not feel complicated.

It should feel like:

```text
Here’s what happened.
↓
Here’s what you should not do.
↓
Here’s who needs to act.
↓
Here’s what happens next.
```

The design is successful when a member can move through the experience without understanding:

- the rejection taxonomy,
- Mool,
- Fix/Fight/Forward,
- internal ownership rules,
- AI architecture,
- or EPFO’s bureaucratic route structure.

The system carries that complexity for them.

That is the design bar for Nidhi Rakshak.

# PRD: Nidhi Rakshak

**Status:** Draft for Build
**Product:** EPFO Claim Rescue Layer
**Platform:** Employees’ Provident Fund Organisation (EPFO)
**Primary surface:** EPFO Member e-Sewa / Claim Status
**Prototype:** Independent simulated prototype. No live EPFO, Aadhaar, PAN, bank or employer data is read or written.
**Last updated:** 26 August 2026

---

# 1. Problem Alignment

## 1.1 The Problem

A rejected EPFO claim is not just a failed transaction.

For a member, especially someone who is not deeply familiar with EPFO processes, a rejection often creates a much harder problem:

> **What exactly went wrong, whose responsibility is it, and what should I do now?**

The rejection message may name a mismatch, missing detail or eligibility issue, but it does not necessarily tell the member:

* which specific field is causing the problem
* which record is different
* whether their current details are actually wrong
* whether changing something will make the situation worse
* whether the member, employer, bank or EPFO owns the next action
* which existing EPFO route they should use
* what evidence they need
* whether they should fix something, challenge the rejection, or wait for someone else

This creates trial-and-error behaviour.

Members may:

* change a record that was already correct
* repeatedly submit the same claim
* visit a cyber cafe or employer without knowing what to ask for
* call or raise grievances without the right evidence
* get pushed between EPFO, employer and bank
* create a second mismatch while trying to solve the first

The product should not simply explain EPFO terminology better.

It should **diagnose the blocker, establish ownership, prevent harmful changes, and take the member to the right next action.**

---

# 1.2 The Core Product Question

The question is not:

> “How can we explain a rejection reason?”

It is:

> **“Given everything already known about this rejected claim, what is the safest and shortest path for this member to resolve the actual blocker?”**

---

# 1.3 ICP

## Primary ICP

An EPFO member whose claim has already been rejected and who does not clearly understand:

* what exactly went wrong
* whether their own record is wrong
* who is responsible for fixing it
* what they should do next
* what they should avoid changing

The design should prioritize members who may have:

* low familiarity with EPFO terminology
* limited understanding of government workflows
* Hindi or code-mixed language preference
* cheaper or older phones
* dependence on family, employers, cyber cafes, or local helpers
* low confidence in deciding which record is correct
* high risk of making the wrong correction just to get the claim moving

This is a design priority, not an exclusion criterion. The same product should also work for digitally confident white-collar members.

---

# 1.4 Secondary Users

The primary product is for the member, but some resolution paths require another actor.

Secondary actors include:

* previous employer
* current employer
* HR / payroll team
* bank
* EPFO
* trusted family member or helper

The member should not have to understand the workflow of these actors.

When another party owns the problem, Nidhi Rakshak should package the case so that the receiving party immediately knows what needs to be done.

---

# 1.5 What the User Is Actually Trying to Do

The member is not trying to understand KYC, Joint Declaration, EPFiGMS, Mool, or Fix/Fight/Forward.

They are trying to answer:

> **Why was my claim rejected, what should I do now, and how do I fix it without making things worse?**

Every product decision should follow from that.

---

# 2. North Star

## Claim Rescue Rate

### Definition

Percentage of supported rejected claims where Nidhi Rakshak correctly:

1. identifies the real blocker,
2. identifies who owns that blocker,
3. determines the correct resolution direction,
4. gets the member onto the correct next path without trial and error.

### Prototype definition

For the hackathon, a claim is considered successfully rescued when the product gets all four right:

> **Correct blocker + correct owner + correct verdict + correct next action**

We should not use final claim settlement as the immediate North Star because settlement depends on EPFO, employers, banks, and other actors outside the product's control.

### Supporting metrics

* % of supported rejections correctly decoded
* % of cases with correct ownership assignment
* % of verdicts matching golden-case truth
* % of users who understand the next action without assistance
* % of unsupported cases correctly refused
* % of Fight cases where the user avoids an unnecessary or harmful correction

---

# 3. Aha Moments

Nidhi Rakshak has three distinct aha moments.

## Aha 1: “Now I know what is actually wrong.”

The product moves the user from a vague rejection message to a concrete blocker.

Example:

> **We found the problem. One older PF record has a different name.**

The member no longer has to interpret the rejection themselves.

---

## Aha 2: “I know what I should not change.”

This is the product's strongest safety moment.

Example:

> **Your current name is correct. Don’t change it.**

This matters because many rejected-claim journeys currently push the member toward changing something without first establishing which record is actually wrong.

The product should actively prevent a user from creating a second problem while trying to solve the first.

---

## Aha 3: “I know exactly what happens next.”

Once the blocker is understood, the product gives one clear action.

Examples:

> **Fix this bank detail.**

> **Resolve this with EPFO.**

> **Your previous employer needs to update your last working day.**

> **You do not need to do anything right now. This transfer is already in progress.**

The member should not have to decide whether they need Basic Details, Joint Declaration, EPFiGMS, employer action, bank action, or another route.

Nidhi Rakshak makes that decision for the supported case and takes them to the correct next step.

---

## The combined product moment

The complete aha is:

> **I understand what went wrong, I know what not to touch, and I know exactly what to do next.**

That is the core value of Nidhi Rakshak.

---

# 4. Product Principle

## Primary principle

> **Never ask the member for information EPFO already has.**

Because Nidhi Rakshak sits within the EPFO claim journey, the rejected claim itself is already available.

We should not ask the member to:

* screenshot the rejection
* photograph the rejection
* enter claim ID
* enter UAN
* type the rejection reason
* type details that are already present in EPFO

---

## Input hierarchy

| Priority | Input                                                        | Behaviour                                                |
| -------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| 1        | Existing EPFO claim context                                  | Use automatically                                        |
| 2        | Other records already available within the supported context | Compare automatically                                    |
| 3        | One-tap confirmation                                         | Use when ambiguity can be resolved simply                |
| 4        | Additional evidence                                          | Ask for photo/upload only if it can change the diagnosis |
| 5        | Voice                                                        | Use for accessibility and explanation                    |
| 6        | Typing                                                       | Last resort                                              |

The design principle becomes:

> **Context-first, zero duplication. Ask only for evidence the system does not already have.**

---

# 5. High-Level Approach

Nidhi Rakshak acts as a **claim rescue layer inside EPFO**.

It does five things:

### 1. Decode

Translate the rejection into plain language.

### 2. Diagnose

Look only at the records relevant to that rejection.

### 3. Establish ownership

Determine whether the blocker belongs to:

* the member
* EPFO
* employer
* bank / another party

### 4. Protect

Tell the member what they should not change when their existing record is already correct.

### 5. Route

Take them to the shortest valid resolution path.

The internal framework is:

> **Fix / Fight / Forward**

But the user should not have to learn those terms.

---

# 6. Where Nidhi Rakshak Lives

Nidhi Rakshak is not a separate government portal.

It is an embedded diagnosis and routing layer within the existing EPFO claim journey.

## Primary placement

```text
EPFO
└── Member e-Sewa
    └── Claim
        └── Claim Status
            ├── Settled
            └── Rejected
                └── Understand & resolve this rejection
                    └── Nidhi Rakshak
```

The primary CTA appears directly against a rejected claim:

> **Understand & resolve this rejection**

---

## Secondary placement

Before claim submission:

```text
File Claim
↓
Review Claim
↓
Check for blockers
↓
Submit
```

This becomes the future / secondary **Claim Compiler or Pre-flight Check**.

---

# 7. Core Journey

Every supported rejected claim follows the same high-level spine.

```text
Rejected Claim
↓
Understand & resolve this rejection
↓
Use existing EPFO claim context
↓
Decode rejection
↓
Determine rejection family
↓
Load only the relevant records
↓
Do we have enough evidence?
├── No
│   ↓
│   Ask for specific missing evidence
│   ↓
│   Re-run
│   ↓
│   Still insufficient?
│   ↓
│   Refuse safely
│
└── Yes
    ↓
    Explain actual blocker
    ↓
    Show relevant comparison / timeline / rule
    ↓
    Determine ownership
    ↓
    Fix / Fight / Forward internally
    ↓
    Translate verdict into plain user-facing action
    ↓
    Route to correct EPFO / employer / bank flow
    ↓
    Track until blocker clears
```

The important design decision is:

> **We do not create a separate journey for every rejection reason.**

Instead, rejection reasons are mapped into a smaller set of reusable **journey families**.

---

# 8. Rejection Taxonomy

The current working taxonomy contains multiple rejection reasons spanning identity, banking, service records, eligibility and other cases. The taxonomy itself already establishes that ownership cannot simply be attached to a rejection code. The same mismatch can lead to Fix, Fight or Forward depending on the underlying records. 

Each rejection code therefore carries a common contract.

## Rejection Contract

| Field                  | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `code`                 | Stable internal identifier                   |
| `category`             | High-level taxonomy                          |
| `journey_type`         | Determines the UX family                     |
| `epfo_text_patterns`   | Known rejection text variants                |
| `member_facing_reason` | Plain-English explanation                    |
| `records_to_compare`   | Relevant records only                        |
| `mool_signal`          | What constitutes meaningful first divergence |
| `verdict_condition`    | Rule deciding Fix / Fight / Forward          |
| `default_owner`        | Safe owner when rule cannot fully resolve    |
| `member_action`        | Smallest safe member step                    |
| `counterparty_action`  | What another actor must do                   |
| `correction_route`     | Existing EPFO / external route               |
| `evidence_required`    | Minimum evidence required                    |
| `falsifier`            | What would prove the diagnosis wrong         |
| `ui_modules`           | Which UX modules appear                      |
| `prototype_support`    | Golden / Supported / Unsupported             |
| `verification_status`  | Verified / Unverified / Blocking             |

The existing taxonomy already contains most of these fields. 

---

# 9. Journey Families

We use eight reusable journey types.

```text
MISMATCH
MISSING_DATA
VALIDATION_FAILURE
SERVICE_HISTORY
ELIGIBILITY
RECORD_CONSOLIDATION
PENDING_PROCESS
UNSUPPORTED
```

A ninth specialized family, `BENEFICIARY / SUCCESSION`, exists conceptually but is out of scope for the hackathon build. Death and nominee claims change the actor (nominee, spouse, child, dependant, legal heir), which changes identity, authentication, evidence, entitlement, consent and product language. It should not be forced into the generic Missing Data family.

The journey family represents the **member's underlying problem**, not the EPFO taxonomy itself. A journey family identifies the structure of the problem; Fix / Fight / Forward runs afterwards and identifies the resolution direction. The same journey family can therefore end differently for different members.

---

# 9.1 Journey Family A: Mismatch

## User question

> Which value is actually wrong?

Examples include:

* member name mismatch
* DOB mismatch
* relation name mismatch
* some bank-name validation issues

## Journey

```text
Mismatch detected
↓
Show exact conflicting field
↓
Compare relevant records
↓
Show first meaningful divergence if useful
↓
Determine which record should be acted on
↓
Fix / Fight / Forward
```

## Example user experience

### We found the problem

Your current records show:

**RAMESH BADIGER**

But one older PF record from 2019 shows:

**RAJESH BADIGER**

Then:

### Your current name is correct. Don’t change it.

Your Aadhaar, PAN and current PF record already match.

The older record is the one that needs attention.

CTA:

**Resolve this with EPFO**

---

# 9.2 Journey Family B: Missing Data

## User question

> What information is missing and who needs to add it?

Examples:

* exit date missing
* Aadhaar not linked
* approval pending
* supporting document missing
* joining date missing

## Journey

```text
Required field missing
↓
Explain what is missing
↓
Explain why the claim needs it
↓
Determine who can provide/update it
↓
Route
```

Example:

### Your previous employer needs to update your last working day.

Your Date of Exit is missing from your PF record.

You cannot correct this yourself right now.

CTA:

**Send this to my employer**

If the user is legally able to self-serve based on the applicable rule:

### You can update this yourself.

CTA:

**Update Date of Exit**

The exact conditions must be verified before being used as product truth.

---

# 9.3 Journey Family C: Validation Failure

## User question

> My detail looks correct, so why is it still failing?

Examples:

* bank validation failed
* IFSC obsolete
* bank account inactive
* unreadable document
* bank details invalid

## Journey

```text
Validation failed
↓
Identify exact failing component
↓
Compare value where possible
↓
Determine whether member input is wrong
↓
Fix OR Fight/Forward
```

Example:

### Your bank details match, but the verification failed.

The account number and IFSC you entered match the document available to us.

The problem appears to be happening during validation.

CTA:

**See what to do next**

The system should not automatically tell the member to change correct bank information.

The taxonomy already distinguishes simple bank-detail corrections from validation failures that may need Fight or Forward behaviour. 

---

# 9.4 Journey Family D: Service History

## User question

> What happened across my previous jobs that is blocking this claim?

Examples:

* exit date issue
* joining date issue
* service overlap
* contributions not deposited
* transfer pending
* Annexure K missing
* past Member IDs not merged

## Journey

```text
Build employment timeline
↓
Identify blocking event / missing transition
↓
Show where the timeline becomes inconsistent
↓
Determine owner
↓
Route / handoff
```

Example:

```text
ABC Industries
Joined: Jan 2018
Exit: Jun 2020

XYZ Ltd
Joined: May 2020

⚠ These employment dates overlap.
```

User-facing:

### Your employment dates overlap.

Your new employment begins before your previous PF record shows that you left.

### Your previous employer needs to correct this record.

CTA:

**Send correction request**

This category is particularly important because many service-record issues are owned by an employer or EPFO rather than the member. 

---

# 9.5 Journey Family E: Eligibility

## User question

> Are my records wrong, or is this type of claim not allowed right now?

Examples:

* service length requirement
* amount over cap
* waiting period
* wrong form
* advance usage exhausted
* supporting purpose document missing

## Journey

```text
Eligibility rule failed
↓
Explain the rule simply
↓
Show what in this claim conflicts with it
↓
Offer valid alternative if one exists
↓
Route
```

Example:

### Your details are okay.

This claim cannot be processed in its current form because the amount requested is higher than the allowed amount for this purpose.

CTA:

**Change claim amount**

Mool should generally not appear here unless chronology itself is relevant.

The existing taxonomy correctly separates policy and eligibility failures from identity or service-record mismatches. 

---

# 9.6 Journey Family F: Record Consolidation

## User question

> Why do I have multiple PF or member records, and how do they get connected?

Examples:

* multiple UANs
* Member IDs unmerged
* duplicate identity structures
* old PF account not connected to current account
* some transfer-related structural issues

This is not simply a mismatch. The problem is that multiple records representing the same person or employment history exist independently.

## Journey

```text
Multiple related records detected
↓
Show the records / accounts that exist
↓
Explain their relationship
↓
Determine which should remain active
↓
Determine whether merge / transfer / blocking / escalation is required
↓
Show one next action
```

## Example user experience

### We found two PF membership records linked to you.

Your older PF balance has not yet been connected to your current account.

CTA:

**Bring my old PF record into this account**

---

# 9.7 Journey Family G: Pending / Existing Process

## User question

> Is something actually wrong, or is another process already happening?

Examples:

* KYC pending approval
* transfer already pending
* duplicate claim already in process
* claim already settled
* employer approval pending
* existing correction already submitted

## Journey

```text
Existing operation detected
↓
Identify current process
↓
Explain current owner
↓
Should member act?
├── No → Prevent duplicate action
└── Yes → Show only required follow-up
↓
Track
↓
Escalate only if necessary
```

## Example user experience

### Your transfer is already being processed.

You do not need to submit another transfer request.

**Current owner:** EPFO
**Your next action:** Nothing right now

CTA:

**Check transfer status**

A valid resolution can be:

> **Do nothing right now.**

Preventing unnecessary action is part of claim rescue.

---

# 9.8 Journey Family H: Unsupported / Uncertain

This is a real product path, not a generic error state.

Example:

### We can’t safely diagnose this rejection yet.

We recognise that your claim was rejected, but the information available is not enough for us to tell you what should be changed.

Then either:

> We need one more document.

or:

> This rejection is not supported by Nidhi Rakshak yet.

CTA:

**Get help through EPFO**

The current taxonomy includes `UNMAPPED_REJECTION` specifically for this reason and treats explicit non-diagnosis as intentional product behaviour. 

---

# 9.9 Journey Family Mapping

Each rejection code maps to a primary journey family through its rejection contract. Adding a new rejection reason should usually mean defining its contract, assigning an existing journey family, selecting reusable UI modules, and defining its ownership / verdict condition and resolution route. It should not require a new product flow.

| Rejection Type | Primary Journey Family | Secondary Module / Note |
|---|---|---|
| KYC_NAME_MISMATCH | Mismatch | Mool + Diff |
| KYC_DOB_MISMATCH | Mismatch | Diff |
| KYC_GENDER_MISMATCH | Mismatch | Diff |
| RELATION_NAME_MISMATCH | Mismatch | Strong Mool case |
| AADHAAR_NOT_SEEDED | Missing Data | KYC route |
| KYC_PENDING_APPROVAL | Pending / Existing Process | Employer ownership |
| MULTIPLE_UANS | Record Consolidation | Service history |
| UAN_NOT_ACTIVATED | Missing Data | Activation action |
| MOBILE_NOT_LINKED_AADHAAR | Missing Data | External identity dependency |
| SIGNATURE_MISMATCH | Validation Failure | Evidence re-submission |
| BANK_DETAILS_INVALID | Validation Failure | Fix if evidence disagrees |
| BANK_IFSC_OBSOLETE | Validation Failure | Fix |
| BANK_ACCOUNT_JOINT | Validation Failure | Rule must be verified |
| BANK_ACCOUNT_DORMANT | Validation Failure | Bank ownership possible |
| BANK_VALIDATION_FAILED | Validation Failure | Fight / Forward possible |
| DOC_IMAGE_UNREADABLE | Validation Failure | Evidence Request |
| EXIT_DATE_MISSING | Missing Data | Service Timeline |
| EXIT_DATE_WRONG | Service History | Employer ownership |
| DOJ_MISSING_OR_WRONG | Service History | Employer ownership |
| SERVICE_OVERLAP | Service History | Timeline |
| NCP_DAYS_MISMATCH | Service History | Employer ownership |
| CONTRIBUTION_NOT_REMITTED | Service History | Employer / EPFO |
| ANNEXURE_K_MISSING | Service History | EPFO ownership |
| MEMBER_IDS_UNMERGED | Record Consolidation | Transfer |
| TRANSFER_IN_PENDING | Pending / Existing Process | Tracking |
| EXEMPTED_TRUST | Service History | External owner |
| EMPLOYER_DSC_INVALID | Pending / Existing Process | Employer ownership |
| FORM_10C_AFTER_10Y | Eligibility | Alternative form |
| SERVICE_LENGTH_SHORTFALL | Eligibility | Alternative / wait |
| CLAIM_EXCEEDS_CAP | Eligibility | Change claim |
| EPS_WAGE_DISCREPANCY | Service History | Specialized / unsupported |
| WAITING_PERIOD_NOT_MET | Eligibility | Wait state |
| ADVANCE_LIMIT_EXHAUSTED | Eligibility | Alternative |
| PURPOSE_DOCUMENT_MISSING | Missing Data / Eligibility | Evidence Request |
| DUPLICATE_OR_SETTLED | Pending / Existing Process | Prevent duplicate action |
| NOMINATION_MISSING | Beneficiary / Succession | Future |
| UNMAPPED_REJECTION | Unsupported / Uncertain | Refusal |

---

# 10. Dynamic UI Composition

The rejection code does not map to a completely separate screen flow.

It maps to reusable UI modules.

```text
Rejection
↓
Rejection Contract
↓
Journey Type
↓
Required UI Modules
```

## Core modules

### Decode

Explain what EPFO’s rejection means.

### Diff

Compare relevant record values.

### Mool

Show the first observable divergence.

### Service Timeline

Show chronology across employers.

### Missing Detail

Explain absent information.

### Rule Explanation

Explain eligibility failure.

### Do Not Touch

Warn user not to change a valid record.

### Try Before You Touch

Simulate a proposed correction.

### Ownership

Explain who needs to act.

### Falsifiability

Show how the user can check the diagnosis.

### Evidence Request

Ask only for missing information.

### Resolution CTA

Take the member to the actual next action.

### Handoff

Generate employer / bank / EPFO-ready artifact.

### Receipt

Create a portable case summary.

### Tracking

Show current owner, blocker and next step.

---

# 11. Example Module Configuration

## RELATION_NAME_MISMATCH

```text
Decode            ✓
Diff              ✓
Mool              ✓
Do Not Touch      Conditional
Sandbox           ✓
Falsifiability    ✓
Resolution        ✓
Receipt           ✓
```

---

## EXIT_DATE_MISSING

```text
Decode             ✓
Missing Detail     ✓
Service Timeline   ✓
Ownership          ✓
Employer Handoff   Conditional
Mool               Lightweight
Sandbox            Optional
Tracking           ✓
```

---

## CLAIM_EXCEEDS_CAP

```text
Decode             ✓
Diff               ✕
Mool               ✕
Rule Explanation   ✓
Alternative Action ✓
Resolution         ✓
```

---

## DOC_IMAGE_UNREADABLE

```text
Decode             ✓
Mool               ✕
Evidence Request   ✓
Fix                ✓
```

---

# 12. Mool

## What Mool is

Mool identifies:

> **the first observable point where relevant records begin to diverge.**

It does not automatically identify a culprit.

## Allowed language

> The first different value we can see appears in your 2019 PF record.

## Not allowed

> Your employer entered your name incorrectly in 2019.

Unless the actual write event or equivalent evidence is available.

---

# 12.1 Mool Evidence States

### Verified

The underlying record directly shows the value or event.

### Inferred

The chronology suggests a point of divergence, but the exact write event is unavailable.

### Unknown

There is not enough evidence.

---

# 12.2 Mool Is Not Universal

Mool should only appear where provenance or chronology is useful.

Strong use cases:

* historic identity mismatch
* relation-name mismatch
* exit / join history
* service overlap
* contribution timeline
* transfer problems

Weak or unnecessary use cases:

* unreadable image
* claim exceeds cap
* missing document
* Aadhaar not seeded

The product should never force Mool onto a rejection simply because it is a headline feature.

---

# 13. Fix / Fight / Forward

Fix/Fight/Forward is an **internal decision framework**.

The member should not have to understand those words.

## FIX

### Internal meaning

The member owns the field or claim configuration that needs changing.

### User sees

> **One detail needs to be corrected.**

CTA:

> **Fix this detail**

---

## FIGHT

### Internal meaning

The member's relevant record appears correct and should not be changed to satisfy the rejection.

### User sees

> **Your current details are correct. Don’t change them.**

Then:

> We’ll help you resolve this with EPFO using the records that already match.

CTA:

> **Resolve this with EPFO**

---

## FORWARD

### Internal meaning

Another party owns the required correction.

### User sees

> **Your previous employer needs to fix this.**

or:

> **Your bank needs to verify this.**

CTA:

> **Send this to my employer**

The member sees the action, not the taxonomy.

## Internal Verdict → User-Facing Language

| Internal Verdict | Internal Meaning | User-Facing Language |
|---|---|---|
| FIX | Member owns correction | **One detail needs to be corrected.** |
| FIGHT | Member's relevant record is already correct | **Your current details are correct. Don’t change them.** |
| FORWARD | Another actor owns correction | **Your employer / bank / EPFO needs to fix this.** |
| NONE | No safe verdict | **We can’t safely tell you what to change yet.** |

Never make the member interpret words like `FIGHT` or `FORWARD`.

---

# 14. Do Not Touch

This is a dedicated safety state, not a small warning.

It appears whenever:

* the member’s current record is supported by stronger evidence
* changing it could introduce more mismatches
* the recommended path is Fight rather than Fix

Example:

# Your current name is correct. Don’t change it.

Your Aadhaar, PAN and current PF record all show:

**RAMESH BADIGER**

Only one older PF record is different.

> Changing your current name could create more problems.

CTA:

**Resolve this with EPFO**

---

# 15. Try Before You Touch

When the product recommends or warns against a record change, the user should be able to see the simulated consequence first.

## Fight example

### Current state

```text
Aadhaar          RAMESH ✓
PAN              RAMESH ✓
Current PF       RAMESH ✓
2019 PF record   RAJESH ✕
```

1 mismatch.

### If current PF changes to RAJESH

```text
Aadhaar          RAMESH ✕
PAN              RAMESH ✕
Current PF       RAJESH ✓
2019 PF record   RAJESH ✓
```

2 mismatches.

User sees:

> **This change creates more mismatches.**

> Keep your current name as it is.

---

## Fix example

Current PF bank IFSC:

`ABCD0001234`

Verified evidence:

`ABCD0005678`

Before:

> 1 blocker found

After simulated correction:

> No blocker found in the checks we support.

User sees:

> **Correcting this field clears the blocker we found.**

Never:

> Your claim will definitely be approved.

---

# 16. Falsifiability

Every consequential diagnosis should tell the user how it could be wrong.

Example:

> **Want to double-check this?**

> Look at your 2019 payslip. If it also says RAMESH BADIGER, this diagnosis may be wrong.

This is intentionally different from generic:

> “AI may make mistakes.”

The user gets a concrete verification action.

---

# 17. Missing Evidence Flow

Evidence acquisition happens only when information already available is insufficient.

Example:

### We need one more record to be sure.

We can see that your current name and your older PF record are different.

But we cannot safely tell which one needs attention yet.

### What we need

A payslip or joining document from your 2019 employer.

CTA:

**Take a photo**

Secondary:

**Upload document**

---

## Evidence extraction

If confident:

> We found the name on this document: **RAMESH BADIGER**

Continue automatically.

If confidence is low:

> Is this name correct?

**Yes** / **No**

Typing is a fallback.

---

# 18. Refusal

If the evidence is still insufficient:

### We still can’t tell safely.

The records available do not give us enough information to recommend changing anything.

CTA:

**Get help with this claim**

The system must not guess simply because the user reached this point.

---

# 19. Resolution Routing

Nidhi Rakshak should connect into existing workflows rather than recreate them.

Possible destinations include:

* existing Basic Details flow
* KYC update
* Mark Exit
* Joint Declaration
* transfer request
* EPFiGMS grievance
* employer action
* bank action

Exact current routes and eligibility conditions must be verified before being shown as authoritative product guidance.

---

# 20. Forward Handoff

Forward is not complete when the product tells the user:

> “Contact your employer.”

It is complete when the receiving person knows exactly what to do.

Example:

## Action required for employee PF claim

**Member:** Rahul Kumar
**Problem:** Date of Exit missing
**Employment:** ABC Industries
**Last contribution:** May 2024
**Requested action:** Update Date of Exit in EPFO

Then:

**Share with employer**

---

# 21. Case Receipt

Every diagnosed case can produce a portable case summary.

Primary format:

> **Forwardable image**

The receipt contains:

* claim issue
* what was found
* relevant records
* first divergence where applicable
* what is still unknown
* what not to change
* who owns the blocker
* recommended action
* supporting evidence
* how to check the diagnosis
* current case state

Prototype output must clearly say:

> **SIMULATED PROTOTYPE**

---

# 22. Tracking

Do not show fake progress percentages.

Bad:

> 72% resolved

Better:

## Your PF claim

**Current blocker:** Date of Exit missing
**Waiting on:** Previous employer
**Last action:** Request shared
**Next step:** Employer updates Date of Exit

If a verified timeframe exists:

**Check again after:** [date]

---

# 23. Re-check After Action

Every meaningful action can trigger the supported checks again.

## Resolved

> **The issue we found is now resolved.**

> Your records now pass the checks that previously found this blocker.

CTA:

**Continue with my claim**

Never:

> Your claim will now definitely be approved.

---

## Another blocker appears

> **The previous issue is resolved, but we found another problem.**

Then create the next diagnosis.

The system should support multiple blockers over the lifetime of one claim rather than assuming one rejection equals one permanent root cause.

---

# 24. Repeat Rejection

If the user submits again and receives another rejection:

### Same blocker

> The same issue is still appearing.

Continue the existing case.

### Different blocker

> The previous issue appears resolved. EPFO has flagged a different problem this time.

Start a new diagnosis linked to the same claim history.

---

# 25. Pre-flight / Claim Compiler

Secondary entry point:

```text
File Claim
↓
Review
↓
Check for blockers
↓
Submit
```

## Entry

### Check for common blockers before you submit

We’ll check the information available for this claim.

CTA:

**Check my claim**

---

## No blocker

> **We didn’t find a blocker in the checks we support.**

> This does not guarantee the claim will be approved.

CTA:

**Continue to submit**

---

## Fixable blocker

> **One detail may block this claim.**

Route into Fix.

---

## External blocker

> **Your previous employer needs to update one detail before you submit.**

Route into Forward.

---

# 26. Helper Mode

P1/P2.

Member can say:

> **Someone is helping me**

Possible helper:

* family
* friend
* trusted person
* cyber-cafe operator

A helper may:

* understand the diagnosis
* help upload evidence
* share employer artifact
* navigate instructions

But member consent remains required for consequential actions.

---

# 27. Audio / Low-literacy Experience

Important member-facing content should be designed so it can eventually support:

> 🔊 Hear this

Priority content:

* what happened
* what not to do
* what to do next
* who needs to act
* what evidence is needed

For the hackathon prototype, pre-recorded audio for golden cases is preferable to relying on a live voice provider.

The broader interaction principle is:

> **A member should be able to complete the important flow without typing paragraphs or understanding technical terminology.**

---

# 28. User-Facing Information Hierarchy

Every diagnosis screen should follow roughly:

## 1. What happened?

> We found the problem.

## 2. What should I not do?

> Your current name is correct. Don’t change it.

## 3. What should I do now?

> Resolve this with EPFO.

## 4. Why?

Show the relevant comparison or rule.

## 5. How can I check this myself?

Show the falsifier.

Evidence should support the decision, not bury it.

---

# 29. AI vs Deterministic Logic

Product principle:

> **AI reads the mess. Deterministic code makes consequential decisions.**

## AI can be used for

* reading uploaded documents
* OCR
* extracting values
* transcribing voice
* translating / simplifying language
* generating constrained explanations
* normalising noisy unstructured rejection text

## Deterministic logic owns

* rejection code mapping where known
* comparison rules
* ownership logic
* Fix/Fight/Forward
* state transitions
* supported/unsupported boundaries
* sandbox consequences
* consent
* routing
* case status

## Mool

Mool may use AI-assisted explanation, but only within the evidence available.

It cannot invent provenance.

---

# 30. Hard Guardrails

1. AI never silently decides identity or entitlement.
2. LLM never independently selects Fix/Fight/Forward.
3. Unsupported rejection reasons are explicitly named as unsupported.
4. No consequential action submits without explicit consent.
5. Every prototype action is labelled as simulated.
6. Never promise claim approval.
7. Never promise grievance success.
8. Never invent an official rule.
9. Never assign blame without evidence.
10. Never ask the member to modify a valid record merely to satisfy a rejection.
11. Never ask the member for data EPFO already has.
12. Ask for additional evidence only when it can materially change the diagnosis.

---

# 31. Key Golden Cases

## Golden Case 1: Fight

### Case

Relation / name mismatch.

The taxonomy’s specified golden case has Aadhaar, PAN and current profile agreeing while an older employer record differs. That condition produces Fight. 

### Journey

```text
Rejected claim
↓
We found a mismatch
↓
Record comparison
↓
First divergent historical record
↓
Your current details are correct
↓
Do Not Touch
↓
Try Before You Touch
↓
Falsifiability
↓
Resolve with EPFO
↓
Receipt
```

---

# 32. Golden Case 2: Forward

### Case

Date of Exit missing.

The current taxonomy intentionally treats this as conditional: depending on the applicable self-service rule, the member may be able to Fix it or the employer may own it. That rule remains a blocking verification item. 

For the golden Forward demo, use the state where employer action is required.

### Journey

```text
Rejected claim
↓
Your last working day is missing
↓
Show service timeline
↓
You cannot update this yourself in this case
↓
Employer owns blocker
↓
Generate employer-ready request
↓
Share
↓
Track
```

---

# 33. Golden Case 3: Fix

### Case

Invalid bank detail.

The taxonomy specifies that if the member’s evidence disagrees with the UAN value, the member should correct the failing field; if the values already agree and validation still fails, the case should not blindly remain Fix. 

### Journey

```text
Rejected claim
↓
One bank detail is wrong
↓
Show exact failing field
↓
Try proposed correction
↓
1 blocker → 0 supported blockers
↓
Fix this detail
↓
Correct EPFO route
↓
Re-check
```

---

# 34. Golden Case 4: Refusal

### Case

Unmapped rejection.

### Journey

```text
Rejected claim
↓
Cannot safely map rejection
↓
We don't recognise this rejection yet
↓
Ask for evidence if useful
↓
Still unsupported
↓
No diagnosis
↓
Safe EPFO help route
```

This is deliberately a golden experience, not a crash or generic error.

---

# 35. Scope

## P0

### P0.1 Embedded Claim Entry

Open Nidhi Rakshak from a rejected claim using existing claim context.

### P0.2 Decode

Translate rejection into plain language.

### P0.3 Rejection Contract Engine

Map supported rejection to:

* code
* journey family
* required records
* verdict logic
* owner
* route
* modules

### P0.4 Journey Family Router

Support the reusable journey-family model.

### P0.5 Relevant Record Comparison

Compare only fields that matter for the current rejection.

### P0.6 Mool

For supported provenance-sensitive cases.

### P0.7 Ownership Engine

Determine who needs to act.

### P0.8 Do Not Touch

Dedicated safety state.

### P0.9 Fix / Fight / Forward

Internal deterministic decision model.

### P0.10 User-Friendly Action Translation

Never expose taxonomy as the main user instruction.

### P0.11 Falsifiability

Checkable trust line.

### P0.12 Try Before You Touch

Simulated consequence.

### P0.13 Missing Evidence Request

Ask only for evidence necessary to resolve uncertainty.

### P0.14 Refusal

Safe unsupported state.

### P0.15 Case Receipt

Portable image artifact.

### P0.16 Tracking

Current blocker, owner and next step.

---

# 36. P1

* pre-flight Claim Compiler
* pre-recorded audio for golden flows
* tap important text to hear it
* employer-oriented Forward artifact
* richer evidence upload
* action re-check
* helper mode
* multilingual / Hindi-first presentation
* persistent case history

---

# 37. P2

* real IVR / missed-call interface
* full audio-first navigation
* WhatsApp execution
* guardian mode
* proactive employment-record checks
* new-job readiness
* broader rejection coverage
* collective rejection intelligence
* identity alias / historical truth layer
* nominee / death-claim flows
* employer-side prevention
* proactive fraud / scam checking

---

# 38. Non-Goals

For the hackathon prototype, Nidhi Rakshak does not:

* replace EPFO
* access live UAN/member records
* submit real claims
* submit real grievances
* edit EPFO records
* guarantee claim approval
* guarantee grievance outcomes
* support every rejection
* identify who caused a historical mismatch unless explicitly evidenced
* make legal entitlement decisions using an LLM
* create an independent parallel bureaucracy
* require users to learn internal taxonomy

---

# 39. Success Criteria

## Product

| Metric                | Prototype success                                       |
| --------------------- | ------------------------------------------------------- |
| Claim Rescue Rate     | Golden cases resolve to correct blocker + owner + route |
| Diagnosis correctness | 100% on frozen golden cases                             |
| Verdict correctness   | 100% on frozen golden cases                             |
| Unsupported safety    | Unsupported case never receives fabricated diagnosis    |
| Harm prevention       | Fight case visibly prevents harmful edit                |
| Route clarity         | User is always shown one primary next action            |

---

## Usability

A target user should be able to answer after each flow:

1. What went wrong?
2. Is my current information wrong?
3. Who needs to do something?
4. What should I do next?
5. What should I avoid doing?

without requiring explanation from the team.

---

# 40. Analytics

## Core Events

```text
claim_rescue_opened
rejection_decoded
journey_type_selected
record_comparison_viewed
mool_viewed
do_not_touch_viewed
sandbox_started
sandbox_completed
verdict_generated
evidence_requested
evidence_added
diagnosis_refused
resolution_started
forward_artifact_created
receipt_created
case_rechecked
blocker_resolved
```

---

# 41. Key Product Funnel

```text
Rejected Claim
↓
Rescue Opened
↓
Diagnosis Available
↓
Ownership Understood
↓
Resolution Started
↓
Supported Blocker Cleared
```

---

# 42. Counter-Metrics

We should actively monitor:

* wrong verdict rate
* unsupported cases incorrectly diagnosed
* user attempts harmful correction after warning
* excessive evidence requests
* users abandoning before understanding next action
* repeated rejection due to same blocker
* resolution route mismatch

---

# 43. Main Risks

## Risk 1: False confidence

A confident but wrong diagnosis can be worse than the existing rejection.

### Mitigation

* deterministic verdict logic
* explicit evidence
* falsifiability
* refusal
* confidence boundaries

---

## Risk 2: Unverified EPFO rules

Several current taxonomy rows still require primary-source verification. The uploaded taxonomy explicitly warns that none of the rules in the working table should be treated as verified product truth yet, and identifies blocking items for the golden cases. 

### Mitigation

For demo:

* verify golden-case rules first
* cut unverified legal/financial claims
* label uncertainty rather than infer

---

## Risk 3: Mool overclaims causality

### Mitigation

Mool identifies first observable divergence, not a culprit.

---

## Risk 4: 36 rejection reasons create 36 products

### Mitigation

Use eight journey families and reusable modules.

---

## Risk 5: Product becomes another information page

### Mitigation

Every supported diagnosis ends in:

> one owner + one next action

---

# 44. Verification Queue

The current taxonomy identifies several claims requiring verification before they can safely appear in the product, with the highest-risk items affecting the golden cases directly. 

For build/demo priority:

### Must verify

1. self-service eligibility / waiting condition for Mark Exit
2. current Joint Declaration vs Basic Details correction rules
3. any exact bank account acceptance rule used in demo

### Cut if not verified

* delayed-claim interest rule
* exact statutory thresholds
* exact eligibility numbers
* exact waiting periods
* legal entitlement statements

The product should never ship an attractive but unverified number.

---

# 45. Execution Plan

## Milestone 1: Scope + logic freeze

* lock golden rejection codes
* lock rejection contracts
* verify blocking EPFO rules
* lock journey-family mapping
* lock copy

---

## Milestone 2: Build common shell

Build:

* rejected claim entry
* decode
* journey router
* record comparison
* ownership
* receipt
* refusal

---

## Milestone 3: Golden Fight

Build full:

* diff
* Mool
* Do Not Touch
* sandbox
* falsifiability
* EPFO resolution
* receipt

---

## Milestone 4: Golden Forward

Build:

* missing-data explanation
* service timeline
* ownership
* employer artifact
* tracking

---

## Milestone 5: Golden Fix

Build:

* failing-field explanation
* comparison
* sandbox
* correction CTA
* re-check

---

## Milestone 6: Refusal

Build explicit unsupported experience.

---

## Milestone 7: Polish + demo

* zero jargon pass
* mobile
* optional Hindi/audio
* simulated labels
* analytics
* demo data
* failure handling

---

# 46. Demo Story

The demo should prove four things.

## Beat 1: We diagnose

Open rejected claim.

No screenshot.

No form.

No typing.

> **We found the problem.**

---

## Beat 2: We stop harm

Show a Fight case.

> **Your current name is correct. Don’t change it.**

Run Try Before You Touch.

Show that changing it creates more mismatches.

---

## Beat 3: We assign ownership

Show a Forward case.

> **Your previous employer needs to update this.**

Generate an employer-ready artifact.

---

## Beat 4: We know when not to answer

Show unsupported rejection.

> **We can’t safely diagnose this rejection yet.**

This is a deliberate trust moment.

---

# 47. Final Product Definition

Nidhi Rakshak is not a rejection explainer.

It is not a form filler.

It is not a chatbot sitting next to EPFO.

It is a **claim rescue layer embedded inside EPFO**.

When a claim fails, it uses the context the system already has to answer:

> **What exactly is blocking this claim?**

> **Whose responsibility is it?**

> **What should the member not change?**

> **What is the safest next action?**

And then it takes the member there.

The internal system can be complex:

> rejection taxonomy → evidence → Mool → ownership → Fix/Fight/Forward → routing

But the member-facing experience should remain simple:

> **Here’s what happened.**
> **Here’s what you should not do.**
> **Here’s who needs to act.**
> **Here’s what happens next.**

That is the product.

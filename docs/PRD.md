# PRD: Nidhi Rakshak

**Status:** Draft for Build
**Product:** EPFO Claim Rescue Layer
**Platform:** Employees’ Provident Fund Organisation (EPFO)
**Primary surface:** EPFO Member e-Sewa / Claim Status
**Prototype:** Independent simulated prototype. No live EPFO, Aadhaar, PAN, bank or employer data is read or written.
**Last updated:** 27 August 2026

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

# 8. Rejection Taxonomy and Remedy Contract (v2)

This section supersedes the earlier v1 taxonomy. Three v1 rows were wrong or stale and must not be used: the Mark Exit waiting rule, the spouse-joint bank rule, and the Joint Declaration vs online correction rule. All three are corrected below.

## 8.1 Verification status

A verification run completed on 26 August 2026 against EPFO circulars. Sourcing caveat: epfindia.gov.in redirects to epfo.gov.in and the circular PDF paths returned 404 to direct fetch, so the findings below come from search-indexed content and mirrored verbatim quotes. Good enough to build on. Not good enough to put a specific number on screen without a second look.

| Circular | Date | What it changed |
|---|---|---|
| Joint Declaration SOP 3.0, WSU | 31 Jul / 1 Aug 2024 | 12 correctable parameters. Minor change needs 2 documents, major needs 3. Employer attestation mandatory. Employers have no rights over other establishments' records. |
| Member Profile Updation | 16 Jan 2025 | Aadhaar-validated UAN holders self-correct 9 profile fields with no documents, no employer verification, no EPFO approval. Exception: a UAN issued before 1 Oct 2017 still needs employer certification. |
| WSU/IssuesofBKG/E-49885/2024-25/16 | 3 Apr 2025 | Employer approval for bank seeding abolished. Bank / NPCI validation replaces it. Cheque leaf and passbook image upload no longer required for online claims. |

## 8.2 Two structural problems v2 fixes

Ownership is not a property of the rejection code. One code can take three verdicts. "Discrepancy in name" is a Fix when the member's own record is wrong, a Fight when it is right and EPFO rejected anyway, and a Forward when a past employer typed the wrong value. The taxonomy needs a verdict condition that picks the branch, and a counterparty action separate from the member action.

The correction route is not a property of the code either. It depends on four facts about the member's account, not on what went wrong. The same name mismatch is a thirty-second self-service edit for one member and an offline paper form with a magistrate's attestation for another. The Correction Route Ladder (Section 8.6) sets out that ladder. It is the single most important addition in v2.

## 8.3 The per-code contract

| Field | What it is for | Feeds |
|---|---|---|
| `code` | Stable identifier, never shown to the member | Everything |
| `category` | One of the groups in Section 8.4 | Grouping |
| `epfo_text_patterns` | The literal strings EPFO uses, so the decoder can match them | P0.2 decode |
| `member_facing_reason` | One sentence, no jargon | P0.2 decode |
| `records_to_compare` | Which sources hold the disputed field | P0.5 diff |
| `mool_signal` | What counts as the first divergence, and what does not | P0.6 Mool |
| `verdict_condition` | The test that picks Fix, Fight or Forward | P0.9 verdict |
| `default_owner` | Who owns it when the condition cannot be evaluated | P0.9 verdict |
| `route_eligibility` | New in v2. The four inputs that select the correction branch (Section 8.6) | Fix path, execution |
| `member_action` | The shortest safe step, or "none" | Verdict screen |
| `counterparty_action` | What the employer, bank or EPFO must do | Forward artifact |
| `evidence_required` | Documents for the selected branch, which may be none | Receipt |
| `falsifier` | One line: what would have to be true for this diagnosis to be wrong | Trust line |
| `prototype_support` | GOLDEN, SUPPORTED, or DECLARED-UNSUPPORTED | Scope control |
| `verification_status` | VERIFIED, UNVERIFIED, or BLOCKING | Demo safety |

DECLARED-UNSUPPORTED is not a gap. A code that is in the taxonomy but out of scope is the product being honest about its edges (P0.14).

## 8.4 The taxonomy

Verdict: FIX member owns it. FIGHT record is correct, rejection is wrong. FORWARD another party owns it. FORK depends on data. FORK is an internal taxonomy label only; the member still sees just Fix, Fight, Forward or None. Support: G golden, S supported, D declared unsupported. Source: Y yours, + added, Y* yours corrected during verification.

### A. Identity and profile

| Code | Reason | Verdict | Route | Sup | Src |
|---|---|---|---|---|---|
| KYC_NAME_MISMATCH | Member name differs across UAN, Aadhaar, PAN, bank | FORK | Branch ladder (8.6) | G | Y* |
| KYC_DOB_MISMATCH | Date of birth differs from Aadhaar | FORK | Branch ladder | S | Y* |
| KYC_GENDER_MISMATCH | Gender differs from Aadhaar | FIX | Branch ladder | S | Y* |
| RELATION_NAME_MISMATCH | Father's or spouse's name differs between a past employer record and identity records | FORK | Branch ladder | G | + |
| AADHAAR_NOT_SEEDED | UAN not linked or validated against Aadhaar | FIX | Manage > KYC, UIDAI OTP. Gates every other branch, fix this first | S | Y |
| KYC_PENDING_APPROVAL | Profile change uploaded but employer has not approved | FORWARD | Employer portal. Only pre-1 Oct 2017 UANs since Jan 2025 | S | Y* |
| MULTIPLE_UANS | More than one UAN exists for the same person | FORK | Transfer plus UAN blocking request | D | + |
| UAN_NOT_ACTIVATED | UAN generated but never activated | FIX | Member portal activation | S | + |
| MOBILE_NOT_LINKED_AADHAAR | OTP cannot be delivered because mobile is not linked to Aadhaar | FIX | UIDAI update, then portal | S | + |
| SIGNATURE_MISMATCH | Signature on a physical claim does not match the record | FIX | Re-submit with attested signature | D | + |

### B. Banking

This category was rewritten after the 3 April 2025 circular.

| Code | Reason | Verdict | Route | Sup | Src |
|---|---|---|---|---|---|
| BANK_DETAILS_INVALID | Wrong or closed account number | FIX | Manage > KYC with Aadhaar OTP, then bank / NPCI validation. No employer approval since 3 Apr 2025 | G | Y* |
| BANK_VALIDATION_FAILED | Account fails the bank or NPCI name-match check even though the member entered it correctly | FIGHT or FORWARD | Bank corrects its record, then re-validate | G | + |
| BANK_IFSC_OBSOLETE | IFSC changed after a merger or branch move | FIX | Re-submit bank KYC with new IFSC | S | Y |
| BANK_ACCOUNT_NON_SPOUSE_JOINT | Account is joint with someone other than the spouse, or third-party | FIX | Seed an individual account, or one joint with spouse | S | Y* |
| BANK_DEPOSIT_CAP | Account has a deposit cap lower than the withdrawal amount, so credit fails | FIX | Raise the cap with the bank, or seed a different account | S | + |
| BANK_ACCOUNT_DORMANT | Account exists but is inoperative | FORK | Reactivate, or switch account | S | + |
| DOC_IMAGE_UNREADABLE | Cheque or passbook image blurred or cropped | FIX | Largely obsolete. Upload no longer required for online claims when the account passes validation | D | Y* |

Correction to the v1 list: a v1 row said an account "shared with a spouse or parent" fails EPFO's sole-ownership rules. EPFO's UAN and KYC FAQ Q16 says verbatim: "You should seed active bank account to which you are either an individual or joint holder with your spouse." A spouse-joint account is permitted. Only the parent half was right. Telling a member to open an account they do not need is exactly the harm this product exists to prevent, so the row was rewritten and split.

### C. Service record

| Code | Reason | Verdict | Route | Sup | Src |
|---|---|---|---|---|---|
| EXIT_DATE_MISSING | Previous employer never logged the last working day | FORK | Mark Exit if eligible, otherwise employer. See the condition note below | G | Y* |
| EXIT_DATE_WRONG | Exit date logged but incorrect | FORWARD | Employer correction, or branch ladder if self-service covers it | S | + |
| DOJ_MISSING_OR_WRONG | Date of joining absent or inconsistent | FORWARD | Employer correction, or branch ladder | S | + |
| SERVICE_OVERLAP | New employer's joining date precedes the previous exit date | FORWARD | Physical correction letter to the regional office | S | Y |
| NCP_DAYS_MISMATCH | Non-contributory period days inconsistent with the wage record | FORWARD | Employer correction | D | + |
| CONTRIBUTION_NOT_REMITTED | Employer deducted but never deposited | FORWARD | EPFiGMS grievance against the establishment | S | + |
| ANNEXURE_K_MISSING | Service history and funds did not transfer between field offices | FIGHT | EPFiGMS grievance | S | Y |
| MEMBER_IDS_UNMERGED | Past member IDs still open at final withdrawal | FIX | One Member One EPF Account transfer | S | Y |
| TRANSFER_IN_PENDING | Transfer filed but not completed | FIGHT | Wait or escalate via EPFiGMS | S | + |
| EXEMPTED_TRUST | Establishment runs its own exempted PF trust, so EPFO is not the payer | FORWARD | Claim goes to the trust | D | + |
| EMPLOYER_DSC_INVALID | Employer's digital signature unregistered or expired | FORWARD | Employer re-registers DSC | D | + |

Correction to the v1 list: a v1 row said Mark Exit becomes available "if it has been more than 2 months since you left the job." The trigger is two months from the last PF contribution received, not from the last working day. Those differ, usually by a month or more, because the final contribution lands after the member leaves. An Aadhaar-verified UAN is also required, and the exit date must fall within the month of the last contribution. The engine must read the last contribution month, not a member-stated last working day. That is a code change, not a copy change.

### D. Policy and eligibility

| Code | Reason | Verdict | Route | Sup | Src |
|---|---|---|---|---|---|
| FORM_10C_AFTER_10Y | Form 10C filed after crossing 10 years of eligible service | FIX | File Form 10D instead | S | Y |
| SERVICE_LENGTH_SHORTFALL | Advance purpose requires more service than the member has | FIX | Choose a purpose that fits | S | Y |
| CLAIM_EXCEEDS_CAP | Amount requested exceeds the cap for that purpose | FIX | Re-file within the cap | S | Y |
| EPS_WAGE_DISCREPANCY | Pension contributions deposited on wages above the statutory limit | FORWARD | Joint declaration on entry wages | D | Y |
| WAITING_PERIOD_NOT_MET | Final settlement filed before the mandatory unemployment period | FIX | Wait, or file a permitted partial advance | S | + |
| ADVANCE_LIMIT_EXHAUSTED | Permitted number of advances for that purpose already used | FIX | Choose another purpose | D | + |
| PURPOSE_DOCUMENT_MISSING | Supporting document for the chosen purpose not attached | FIX | Re-file with the document | S | + |
| DUPLICATE_OR_SETTLED | A claim for the same period is already settled or in process | FIGHT | EPFiGMS if the member never received the money | S | + |

### E. Death and nominee

| Code | Reason | Verdict | Route | Sup | Src |
|---|---|---|---|---|---|
| NOMINATION_MISSING | No e-nomination on file, claim filed by a legal heir | FIX | Legal heir certificate route | D | + |

### F. The catch-all

| Code | Reason | Verdict | Route | Sup | Src |
|---|---|---|---|---|---|
| UNMAPPED_REJECTION | Rejection text matches no known pattern with sufficient confidence | none | Say so, offer the grievance route, do not guess | G | + |

UNMAPPED_REJECTION is a built golden case, not an error state. It is the cheapest way to demonstrate the honesty the judging criteria reward.

## 8.5 Coverage summary

| Bucket | Count |
|---|---|
| From the prior list (source Y or Y*) | 17 |
| Added (source +) | 21 |
| Total distinct codes | 38 |
| Golden | 6 |
| Supported | 23 |
| Declared unsupported | 9 |

Count reconciled 27 August 2026. The enumerated tables define 38 distinct codes (verified, no duplicates): 6 golden, 23 supported, 9 declared-unsupported; 21 added and 17 from the prior list, 8 of which were corrected during verification. The earlier v1 summary said 37 total and 5 golden. It dropped one golden-marked code, `BANK_VALIDATION_FAILED`, which undercounts total, golden and added by one each. The four demo golden flows (Fight, Forward, Fix, Refusal) are unchanged; the six golden-marked codes map onto them.

The most important addition is RELATION_NAME_MISMATCH. The hero example (Golden Case 1, Section 31) is a father's name introduced by a 2019 employer. The v1 list did not contain that case; it bundled "name" into the member's own name. The demo's single most important row was missing from the taxonomy.

## 8.6 Correction Route Ladder

This is the most useful addition in v2. It answers: if a past employer typed the wrong value, and the current employer has no authority over that record, how does anyone actually fix it?

From the Joint Declaration SOP, verbatim: "No employer will have any modification rights for member accounts belonging to other/previous establishments."

There is a route. Which route depends on four facts about the member's account, not on what went wrong.

### The four inputs

| Input | Values | Where it comes from |
|---|---|---|
| `aadhaar_validated` | yes / no | UAN profile |
| `uan_issued_before_2017_10_01` | yes / no | UAN issue date |
| `field_level` | UAN_PROFILE / MEMBER_ID_RECORD | Which record holds the divergent value |
| `prior_establishment_status` | active / closed / unresponsive | Service history |

### The four branches

| Branch | Condition | What the member does | Cost |
|---|---|---|---|
| 1. Self-service | Aadhaar-validated UAN issued on or after 1 Oct 2017, value sits at UAN profile level | Manage > Modify Basic Details, edit, self-approve. No documents, no employer, no EPFO approval | Minutes |
| 2. Employer certification | UAN issued before 1 Oct 2017 | One-time employer certification. Which employer is not specified in available sources | Days |
| 3. Previous employer files it | Value sits in a past establishment's member-ID record, and that establishment is active | The previous employer files the Joint Declaration. The current employer cannot | Weeks, if they answer |
| 4. Offline attested route | Previous establishment closed, defunct or unresponsive | Physical Joint Declaration on Annexure-II, signed by the member and attested by one authority from para 6.15 of the SOP: bank manager where the salary account is held, gazetted officer, or magistrate. Plus a letter explaining the closure. Submitted to the field office | No published SLA |

Branch 4 then runs Dealing Assistant, then Section Supervisor, then APFC or RPFC. Anything touching more than five parameters goes to the OIC.

### The unresolved question

Whether the January 2025 self-service reaches member-ID-level particulars in a past establishment's record, or only the UAN-level profile. Every source describes it as "profile" updation, which reads as UAN level. The hero case is a father's name in a 2019 employer's record, which reads as member-ID level. No source states which wins. This is item 4 in the verification queue (Section 44). It does not block the build: when this input is unknown the Correction Route shows the safe employer branch, never a guessed self-service path, so the golden Fight case stands either way. It only gates whether Branch 1 self-service may be offered for member-ID-level fields.

Do not settle this with more searching. Log into the portal with a real UAN and look at what Modify Basic Details actually offers, and whether it presents one profile or per-member-ID records. If self-service reaches it, branches 3 and 4 mostly evaporate and the Forward branch of golden case 1 weakens. If it does not, the hero case stands as written.

To settle it (about five minutes, needs a real UAN):

1. Log in at the EPFO member portal (Member e-Sewa).
2. Open Manage > Modify Basic Details.
3. Note whether it shows one consolidated profile, or a picker of per-Member-ID records.
4. If per-Member-ID, check whether a past employer's record is editable there. Editable means self-service reaches member-ID fields, so branches 3 and 4 shrink; not editable, or a single profile only, means the hero Forward case stands.
5. Record the answer against verification item 4 and set the `field_level` handling accordingly.

The routing reframes the hero moment. The claim is not "this is unfixable." It is: there are four ways to fix this, three do not apply to you, here is the one that does and here is why. That is a routing problem with mechanically checkable inputs, which is far more defensible to build in the time available than root-cause attribution. It also gives Try Before You Touch something concrete to simulate: show the member which branch they are on before they touch anything.

Note on the persona: pre-October-2017 UANs belong to people with longer tenure, more past employers and lower digital confidence. Closed and defunct establishments cluster in exactly the informal and semi-formal employment the primary ICP sits in. The January 2025 relaxation helped the digitally confident white-collar member most, and helped the primary ICP least.

## 8.7 Sources

* EPFO Simplifies Online Process for Member Profile Updation, press release, 19 January 2025
* Joint Declaration circular, WSU, 1 August 2024, and SOP for Processing of Joint Declaration of PF Member Profile Updating, Version 2
* EPFO FAQ on UAN and KYC, Q14 and Q16, on bank account seeding
* Seeding bank account details with UAN, EPFO Order WSU/IssuesofBKG/E-49885/2024-25/16, 3 April 2025
* EPFO Simplifies Claim Settlement Process, press release, April 2025
* Secondary reporting on the Mark Exit two-month rule, from CreditMantri and RTI Wiki

epfindia.gov.in redirects to epfo.gov.in and the circular PDF paths returned 404 to direct fetch. Content above was read through search indexes and verbatim mirrors. Re-verify anything before it becomes an on-screen number.

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

Each rejection code maps to a primary journey family through its rejection contract. Adding a new rejection reason should usually mean defining its contract, assigning an existing journey family, selecting reusable UI modules, and defining its ownership / verdict condition and resolution route. It should not require a new product flow. This table reflects Taxonomy v2 (Section 8): 37 codes, with verdicts and support status defined there. The journey family is the member's problem shape; the Fix / Fight / Forward / Fork verdict is separate and lives in the contract.

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
| BANK_DETAILS_INVALID | Validation Failure | Fix; no employer step or upload since Apr 2025 |
| BANK_IFSC_OBSOLETE | Validation Failure | Fix |
| BANK_ACCOUNT_NON_SPOUSE_JOINT | Validation Failure | Non-spouse / third-party only; spouse-joint permitted |
| BANK_DEPOSIT_CAP | Validation Failure | Raise cap or switch account |
| BANK_ACCOUNT_DORMANT | Validation Failure | Fork: reactivate or switch account |
| BANK_VALIDATION_FAILED | Validation Failure | Fight / Forward possible |
| DOC_IMAGE_UNREADABLE | Validation Failure | Largely obsolete; upload not required online |
| EXIT_DATE_MISSING | Missing Data | Fork: Mark Exit vs employer; Service Timeline |
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
| EPS_WAGE_DISCREPANCY | Service History | Declared unsupported; employer joint declaration |
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

Code: `RELATION_NAME_MISMATCH` (a father's or spouse's name introduced by a past employer, per Taxonomy v2, Section 8). The golden case has Aadhaar, PAN and the current profile agreeing while an older employer record differs. That condition produces Fight: the member's records are correct, so the member action is none, do not change any record.

If the member chooses to correct the past record anyway, run the Correction Route Ladder (Section 8.6) and show which of the four branches applies and why the other three do not. Falsifier: if the member's 2019 payslip or appointment letter shows the other spelling, this diagnosis is wrong. Whether the Jan-2025 self-service reaches past member-ID records is still open (Section 44, item 4), but design-safe: when the input is unknown the Correction Route defaults to the safe employer branch, so this Fight case stands. If self-service does reach it, the Forward branch of this case weakens. 

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

Code: `EXIT_DATE_MISSING`, verdict FORK (Taxonomy v2, Section 8). The verdict is conditioned on a verified rule: if two months have elapsed since the last PF contribution received, and the UAN is Aadhaar-verified, the member can self-serve via Mark Exit and the verdict is FIX; otherwise the employer owns it and the verdict is FORWARD. The exit date must fall within the month of the last contribution. The engine must read the last contribution month, not a member-stated last working day. That is a code change, not a copy change. The two-month-from-last-contribution rule is VERIFIED via secondary sources; whether the Jan-2025 self-service supersedes the Mark Exit gate for date of leaving is still open (Section 44); the golden Forward demo uses the employer-owned state, so it does not block the build. 

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

Code: `BANK_DETAILS_INVALID`, verdict FIX (Taxonomy v2, Section 8). If the member's own record disagrees with the UAN value, the member corrects the one failing field under Manage > KYC, authenticated by Aadhaar OTP. If the values already agree and validation still fails, hand to `BANK_VALIDATION_FAILED` (Fight or Forward), do not blindly stay Fix. Since the 3 April 2025 circular WSU/IssuesofBKG/E-49885/2024-25/16, there is no employer approval step and no cheque or passbook upload when the account passes bank / NPCI validation. VERIFIED against that circular. 

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

Updated after the 26 August 2026 verification run (Taxonomy v2, Section 8). Three v1 blocking items are resolved, one new blocking item is open, and the rest carry soft uncertainty labels.

| # | Item | Status |
|---|---|---|
| 1 | Mark Exit waiting period | RESOLVED, and the v1 row was wrong. Two months from last contribution received, not from the last working day. Aadhaar-verified UAN required; exit date within the month of last contribution |
| 2 | Joint account with spouse | RESOLVED, and the v1 row was wrong. Spouse-joint is permitted. Row rewritten and split (BANK_ACCOUNT_NON_SPOUSE_JOINT) |
| 3 | Joint Declaration vs online correction | RESOLVED, and the v1 row was a year out of date. Replaced by the Correction Route Ladder (Section 8.6) |
| 4 | Does Jan 2025 self-service reach past member-ID records | OPEN, design-safe. The build ships the safe employer branch when this input is unknown (Correction Route, Section 8.6), so it does not block the build; it only gates whether Branch 1 self-service may be offered for member-ID-level fields. Settle by portal login, not by searching. Touches Golden Case 1 |
| 5 | Delayed-claim interest rule | OPEN. Gates any interest counter. Cut if not verified |
| 6 | Service minimums per advance purpose | OPEN. Non-golden, soft label acceptable |
| 7 | Form 10C service threshold | OPEN. Non-golden |
| 8 | Mandatory unemployment period before final settlement | OPEN. Non-golden |
| 9 | Statutory EPS wage limit | OPEN. Non-golden |

Item 4 is the only one touching a golden case, and it is design-safe: the build ships the safe branch when the input is unknown, so nothing is blocked. Everything else can carry a soft uncertainty label if time runs out. The product should never ship an attractive but unverified number.

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

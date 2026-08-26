# Nidhi Rakshak

**EPF Claim Rescue**

A claim-support layer inside the EPFO member journey that helps a rejected claimant understand what went wrong, what not to change, who owns the blocker, and what the safest next action is.

| Field | Details |
|---|---|
| **Direct Responsible Individual (DRI)** | Harsh |
| **Status** | Scope freeze draft |
| **Pod / Team** | Build What Moves India Hackathon |
| **Created Date** | 26 August 2026 |
| **Last Updated** | 26 August 2026 |
| **Submission Deadline** | 28 August 2026, 8pm IST |
| **Figma** | TBD |
| **ERD / Engineering Docs** | TBD |
| **Mixpanel / Analytics** | TBD |
| **Prototype Status** | Independent hackathon prototype. Not an official EPFO product. All EPFO, Aadhaar, PAN, bank and employer data shown in the prototype will be simulated. |
| **Primary Surface** | EPFO Member e-Sewa → Claim Status → Rejected Claim |
| **Secondary Surface** | EPFO Member e-Sewa → Claim → Pre-submission Check |
| **Hero Feature** | Mool |
| **Core Verdicts** | Fix / Fight / Forward |

---

# 😇 Problem Alignment

## The Problem

When an EPFO member's withdrawal claim is rejected, the member gets a reason, but often not an answer they can safely act on.

A rejection can look like:

> **Rejected: discrepancy in name**

That tells the member almost nothing about what they should actually do next.

They still do not know:

- Which field is actually different?
- Which version of the field is correct?
- Which source has the conflicting value?
- Where did the disagreement first appear?
- Is this something they should fix themselves?
- Is the employer responsible?
- Is the rejection itself wrong?
- Should they change their Aadhaar, PAN, EPFO profile, bank details or nothing at all?
- Which EPFO flow should they use?
- What happens if they change the wrong record?

Today, the system effectively pushes diagnosis back onto the citizen.

The member has to compare documents, ask HR, search YouTube, ask a relative, visit a cyber-cafe, try to understand EPFO terminology, make a correction, file again and hope that the correction was the right one.

Sometimes the member gets rejected again because they fixed the wrong thing.

The source case file cites a **33.8% rejection rate for final-settlement claims in FY2022-23**, and the research notes identity, KYC, bank and exit-date mismatches among common causes.

The core problem is therefore not simply that claims get rejected.

The bigger problem is:

> **After a rejection, the member does not know what the rejection actually means, whether they should touch their own record at all, or who needs to act next.**

---

## The current experience

Today, the broad journey looks like this:

```text
Member leaves job
↓
Employer updates employment information
↓
Member logs into Member e-Sewa / UMANG
↓
Member files claim
↓
EPFO processes claim
↓
Settled OR Rejected
↓
If rejected:
Member reads a short rejection reason
↓
Member self-diagnoses
↓
Finds a separate correction / grievance flow
↓
Tries a fix
↓
Files again
```

The claim journey and the correction journey are disconnected.

The member is expected to understand how to move between them.

This is the exact gap Nidhi Rakshak is solving.

The source case file already frames the product as an overlay rather than a replacement and identifies both the pre-filing and post-rejection intervention points.

---

## Primary ICP

### Primary user

An EPFO member, blue-collar or white-collar, whose withdrawal claim has already been rejected and who cannot clearly understand or resolve the blocker on their own.

The product is not only for blue-collar workers.

It should work for any salaried EPFO member.

However, we should design for the harder context first:

- low-cost smartphone
- limited familiarity with EPFO
- no clean PDFs ready
- documents available as photos or screenshots
- preference for Hindi or code-mixed language
- reliance on a relative, cyber-cafe operator or helper
- low confidence in which record is actually correct

If the product works for this user, it should also work for a digitally confident white-collar employee.

---

## Secondary user

### Trusted helper

A relative, family member, cyber-cafe operator or trusted person who may actually be helping the claimant navigate the process.

The helper should not become the owner of the claim.

The member should still be able to understand:

- what is being done
- what is being sent
- what is being changed
- who currently owns the blocker

Guardian / helper behaviour is useful, but it is not part of the hero MVP.

---

## Future user

### Member who has not filed yet

The same diagnosis system can eventually run before claim submission.

This becomes the **Claim Compiler / Pre-flight Check**.

The job here is not to promise approval.

It is to catch supported blockers before they turn into a rejection.

---

# What the user is actually trying to do

The member is not trying to:

- manage KYC
- learn EPFO terminology
- understand correction forms
- figure out Mark Exit
- understand grievance categories
- compare identity systems
- debug their employment history

They are trying to get their own money.

The real questions they have are:

> Why was my claim rejected?

> Which record is different?

> Is my current record already correct?

> What should I not touch?

> Where does the disagreement first appear?

> Who needs to fix this?

> What should I do next?

> What happens if I make this correction?

Our product should answer those questions directly.

---

# Why the current shape is risky

The original product idea was directionally right, but there was one important risk.

Mool originally aimed to say:

> Your employer introduced this incorrect value.

That is too strong unless we actually have evidence of the write event.

We may know where two values first disagree.

We may not know:

- who typed the value
- whether the employer typed it manually
- whether the value came through a bulk upload
- whether another upstream system caused it
- whether the member themselves supplied it at some point

So the product should not reconstruct certainty where only chronology exists.

The inversion pass changes Mool from:

> **Find the culprit**

to:

> **Find the first observable divergence**

This is a much safer and, in my view, stronger trust story.

---

# High-level Approach

Nidhi Rakshak is a **claim advocate**, not another form-filler and not a free-text chatbot.

It sits inside the EPFO claim journey and does five things:

1. **Reads the rejection**
2. **Shows the disagreement**
3. **Finds the first observable divergence**
4. **Tells the member what not to touch**
5. **Routes the case to the right owner**

The final outcome is one of three verdicts:

### Fix

The member-controlled record is actually wrong.

### Fight

The member's verified record appears correct and the rejection should be contested.

### Forward

Another party, such as an employer or bank, owns the incorrect or missing field.

Before the member changes anything, they can also simulate the proposed correction.

That gives us an important product behaviour:

> **Try before you touch.**

Instead of changing a record and finding out 20 days later whether the change helped or made things worse, the member can first see what the supported checks would look like after the proposed correction.

---

# Where Nidhi Rakshak sits inside EPFO

Nidhi Rakshak should not be a separate destination.

The member should not need to leave EPFO, open another product, explain their problem again and then find their way back into the right government flow.

It should be embedded inside the claim journey.

There are two intervention points.

```text
EPFO
│
└── Member e-Sewa / Member Claim Journey
    │
    └── Claim
        │
        ├── Claim details / eligibility
        │
        ├── ◆ Nidhi Rakshak: Pre-flight Check
        │      Check supported blockers before filing
        │
        ├── Submit Claim
        │
        └── Claim Status
               │
               ├── Settled
               │
               └── Rejected
                      │
                      └── ◆ Nidhi Rakshak: Claim Rescue
                             │
                             ├── Decode rejection
                             ├── Compare records
                             ├── Mool
                             ├── Do Not Touch
                             ├── Fix / Fight / Forward
                             ├── Try proposed action in sandbox
                             └── Route into existing EPFO resolution flow
```

---

## Primary placement: rejected claim

The main Nidhi Rakshak entry point should appear directly against a rejected claim.

Today:

> **Rejected: discrepancy in name**

Proposed:

> **Rejected: discrepancy in name**

> **Understand and resolve this rejection**

Clicking this opens the claim already in context.

The member should not need to explain again:

- which claim failed
- what the rejection reason was
- which employer it relates to
- which claim type they filed

The product starts from the rejected claim itself.

This is the hero placement.

---

## Secondary placement: before submission

Inside the claim journey, before final submission, the member can choose:

> **Check my claim before submitting**

The product runs only the supported checks.

Example:

> We found one issue that could block this claim.

or:

> We found no blocker in the checks we currently support.

It must not say:

> Your claim will definitely be approved.

The system cannot know that.

---

## What happens after the verdict

Nidhi Rakshak should not invent a new bureaucratic process when an existing EPFO route already exists.

Its job is to identify which route is correct.

| Verdict | Meaning | Next destination |
|---|---|---|
| **Fix** | The member-controlled record is actually wrong. | Existing relevant EPFO self-service correction flow |
| **Fight** | The member's record appears correct and the rejection should be contested. | Existing grievance / EPFiGMS route |
| **Forward** | Another party owns the missing or incorrect field. | Employer / bank / responsible party |

The original case file already maps Fix, Fight and Forward to existing correction, grievance and employer/bank routes.

---

# Goals & Success

## What we are trying to achieve

A member should be able to come in with the artifact they already have, usually a screenshot or photograph of the rejection, and leave knowing:

1. what the rejection means
2. which records disagree
3. where the disagreement first appears
4. what we know versus what we are inferring
5. what they should not change
6. who owns the blocker
7. whether the right route is Fix, Fight or Forward
8. what evidence would prove our diagnosis wrong
9. what would happen if they tried the proposed correction
10. what action comes next

The member should not need to understand EPFO's internal structure before they can resolve the problem.

---

# North Star

## Claim Rescue Rate

**% of supported rejected claims where Nidhi Rakshak correctly identifies the blocker, assigns the correct owner and gets the member onto the correct resolution path without trial and error.**

I do not think claim settlement itself is the right immediate North Star.

Settlement is ultimately what the user wants, but settlement still depends on EPFO, banks, employers and processing timelines outside the product.

The part of the problem we directly control is:

> **Did we correctly understand the blocker and get the user onto the right path without making them guess?**

For the prototype:

**Claim Rescue = correct blocker + correct ownership + correct verdict + correct next route**

---

# Aha Moments

## Primary aha

> **This is the first place your records stop agreeing.**

Mool shows the earliest observable divergence.

The member goes from:

> “My claim says name mismatch.”

to:

> “My Aadhaar, PAN and current EPFO profile agree. The first different value appears in my 2019 employment record.”

That is the hero moment.

---

## Safety aha

> **Do not touch your current record.**

This is particularly important for Fight cases.

The user may come in assuming:

> Two things do not match, so I should change something.

The product may instead tell them:

> Your current record is already correct. Changing it will create more mismatches.

That is unusual and valuable.

---

## Resolution aha

> **I know what happens next.**

The member gets:

- Fix / Fight / Forward
- one owner
- one next action
- a receipt
- one line telling them how to check whether the diagnosis is wrong

---

# Success Criteria

The numbers below are **hackathon acceptance targets**, not production benchmarks.

There is no measured baseline yet.

| Metric | Baseline | Target | Metric Type | Result | Comments |
|---|---:|---:|---|---|---|
| **Claim Rescue Rate proxy** | No measured baseline | 100% on frozen golden cases | Primary | TBD | Correct blocker + owner + verdict + next route |
| **Rejection decode accuracy** | No measured baseline | 100% on supported demo rejection reasons | Secondary | TBD | Unsupported reasons should fail safely |
| **Mismatch localization accuracy** | No measured baseline | 100% on supported demo records | Secondary | TBD | Exact conflicting field must be surfaced |
| **Verdict accuracy** | No measured baseline | 100% on deterministic golden cases | Guardrail | TBD | Wrong verdict can worsen the member's record |
| **Unfounded culprit claims** | N/A | 0 | Guardrail | TBD | Mool cannot claim who caused the error without evidence |
| **Falsifiability line present** | N/A | 100% of supported verdicts | Guardrail | TBD | Every diagnosis must be checkable |
| **Silent submissions** | N/A | 0 | Guardrail | TBD | Nothing is sent without explicit consent |
| **Typing required in golden flow** | N/A | 0 free-text fields | Experience | TBD | Camera, tap and audio should be enough |
| **Simulation labels** | N/A | 100% of simulated data / outcomes | Guardrail | TBD | Prototype must never look like live EPFO access |

---

# Non-Goals

For the hackathon prototype, we are explicitly not trying to:

- replace EPFO
- replace Member e-Sewa
- replace UMANG
- replace EPFiGMS
- move PF money
- log into live EPFO
- write to live EPFO records
- read live Aadhaar or PAN records
- integrate with live bank systems
- contact real employers
- solve every rejection reason
- solve duplicate UAN cases
- build a generic EPFO chatbot
- build production WhatsApp integration
- build production SMS
- build production IVR / missed-call flows
- predict the probability that a grievance will succeed
- let an LLM make legal or entitlement decisions
- claim that a simulated action was actually filed
- build an interest counter unless the underlying member-facing rule is verified from a suitable primary source

---

# 🤝 Solution

# Key Features

The previous scope had too many P0 and P1 features for the time available.

The revised scope is intentionally smaller.

The question now is not:

> What else can we add?

The question is:

> What needs to work for the central product claim to be believable?

---

# P0: must work

## P0.1 Camera-first rejection capture

The product starts from the artifact the user already has.

Primary CTA:

> **Take a photo of your rejection**

Secondary CTA:

> Upload screenshot

We should not start with:

> Enter rejection reason

or:

> Enter your name

The member should not need to manually retype information already visible in the rejection or documents.

### Requirements

- camera capture
- screenshot upload
- image preview
- extracted rejection text
- user can confirm extracted text if required
- persistent simulation label
- no free-text required in golden flow

---

# P0.2 Rejection Decode

Convert the rejection into one plain-language explanation.

Example:

### EPFO

> Rejected: discrepancy in name

### Nidhi Rakshak

> One of the names in your employment records does not match your current identity records.

Internally, the rejection maps to a structured damage code.

Example:

```text
IDENTITY_NAME_MISMATCH
```

### Requirements

- supported rejection strings map to deterministic codes
- unsupported rejection reason does not get guessed
- if decode fails, product says it cannot safely classify the rejection
- original rejection text remains visible
- plain-language explanation shown in English / Hindi where supported

---

# P0.3 Side-by-side Record Diff

The product should make the disagreement visually obvious.

Example:

| Source | Father's Name | State |
|---|---|---|
| Aadhaar | RAMESH BADIGER | Verified |
| PAN | RAMESH BADIGER | Verified |
| Current EPFO Profile | RAMESH BADIGER | Simulated EPFO |
| 2019 Employment Record | RAJESH BADIGER | Simulated historical record |

The incorrect / conflicting characters should be highlighted.

### Requirements

Every field should retain:

- source
- raw value
- normalized value
- verification state
- confidence where relevant
- simulated / live state

The user should be able to see why the system thinks the records disagree.

---

# P0.4 Mool: First Divergence Timeline

Mool is the hero feature.

The original version aimed to reconstruct where the error came from and who caused it.

The revised product should be more careful.

Mool answers:

> **Where is the first point where the records we can see stop agreeing?**

Example:

> Your Aadhaar, PAN and current EPFO profile show RAMESH.

> The first record we can see with RAJESH is your 2019 employment record.

Then:

> We cannot see who entered this value.

This is intentionally different from:

> Your 2019 employer typed this incorrectly.

Unless we have direct evidence of that action, we should not say it.

---

## Mool evidence states

Every timeline event should be one of:

| State | Meaning |
|---|---|
| **Verified** | The underlying record directly shows the value / event |
| **Inferred** | The sequence suggests something but the exact write event is not visible |
| **Unknown** | Available evidence is insufficient |

Mool should never turn an inferred event into a verified claim because the generated explanation sounds plausible.

---

## Example timeline

```text
2017
Aadhaar
RAMESH BADIGER
Verified

2018
PAN
RAMESH BADIGER
Verified

2019
Employment Record
RAJESH BADIGER
First observable divergence

2024
Current EPFO Profile
RAMESH BADIGER
Simulated
```

Output:

> **This is the first place your records stop agreeing.**

Not:

> This is definitely who caused the problem.

---

# P0.5 Do Not Touch

For Fight cases, the most important output may not be a recommendation.

It may be a prohibition.

Example:

# DO NOT CHANGE YOUR CURRENT NAME

Your current identity records agree.

Changing your current record may create additional mismatches.

This should be visually louder than the rest of the diagnosis.

The user should understand this within seconds.

### Why this matters

A rejected claimant may assume:

> Something does not match. I should change my Aadhaar or EPFO name.

That can make the problem worse.

The product should sometimes act like a safety layer first.

---

# P0.6 Fix / Fight / Forward

Every supported case ends with one clear verdict.

## Fix

The member-controlled record is genuinely wrong.

Example:

Wrong bank IFSC.

Output:

> **FIX**

> This value should be corrected before you file again.

---

## Fight

The member's verified record appears correct.

Output:

> **FIGHT**

> Do not change your current record. Contest the rejection using this evidence.

---

## Forward

Another party owns the field.

Example:

Date of Exit is missing and the employer owns that field.

Output:

> **FORWARD**

> This is not yours to fix. Your previous employer needs to update this field.

The original case material already defines Fix / Fight / Forward as the core advocate behaviour.

---

# P0.7 Falsifiability Line

Every diagnosis should tell the user what evidence would prove us wrong.

Example:

> **Check us:** If your 2019 payslip also shows RAMESH, this diagnosis may be wrong.

This shifts trust from:

> Believe the AI.

to:

> Here is exactly how you can check our conclusion.

### Requirements

- one falsifiability line for every supported golden case
- clearly separated from the recommendation
- must reference evidence the user can realistically inspect
- cannot be generic filler

---

# P0.8 Try Before You Touch

Before the member changes anything, they can simulate the correction.

This turns the prototype's biggest limitation, simulated data, into a product feature.

### Fight example

Current state:

| Source | Value |
|---|---|
| Aadhaar | RAMESH |
| PAN | RAMESH |
| EPFO Profile | RAMESH |
| 2019 Employment Record | RAJESH |

User tries:

> Change current EPFO profile to RAJESH

Simulation:

| Check | Before | After |
|---|---|---|
| Aadhaar match | ✓ | ✕ |
| PAN match | ✓ | ✕ |
| 2019 record match | ✕ | ✓ |
| Total supported mismatches | 1 | 2 |

Recommendation:

> **Do not make this change. It creates more mismatches.**

---

### Fix example

Current bank IFSC:

> ABCD0001234

Verified bank IFSC:

> ABCD0005678

Simulation:

| State | Blockers |
|---|---:|
| Before | 1 |
| After | 0 |

Recommendation:

> This correction clears the supported bank mismatch.

---

## Sandbox rules

The sandbox must never say:

> Your claim will now definitely succeed.

It may say:

> This change clears the blocker detected by the checks we currently support.

---

# P0.9 Forwardable Case Receipt

The previous PRD left the receipt format open.

We should lock it.

## Primary format

**Forwardable image**

The receipt exists to travel.

The member may need to send it to:

- employer
- HR
- family helper
- cyber-cafe operator
- grievance support
- another person helping with the claim

An in-app card alone is not enough.

A PDF can be a later extension.

---

## Receipt content

### Nidhi Rakshak Case Summary

**Claim issue**  
Name discrepancy

**What we found**  
Aadhaar, PAN and current EPFO profile agree.

**First divergence**  
The first conflicting value we can see appears in the 2019 employment record.

**What we do not know**  
We cannot see who entered this value.

**Verdict**  
FIGHT

**Do not do this**  
Do not change your current name.

**Why**  
Changing it would create mismatches with Aadhaar and PAN.

**Check us**  
If your 2019 payslip also shows RAMESH, this diagnosis may be wrong.

**Next action**  
Contest the rejection using the evidence above.

**SIMULATED PROTOTYPE**

---

# P0.10 Simulation / Confidence / Provenance Labels

This product deals with identity and money.

We should not hide uncertainty.

Every relevant record should show whether it is:

- verified
- simulated
- inferred
- unknown

Every outcome should be clear that the hackathon prototype did not actually:

- change a government record
- submit a grievance
- contact an employer
- settle PF money

---

# P0.11 Refusal State

The product should be allowed to stop.

If the evidence is insufficient:

> **We cannot diagnose this safely yet.**

Then:

> We need one older employment record to determine whether this mismatch existed before 2019.

This is not an error state.

It is a trust behaviour.

A product working with identity and money should prove that it knows when not to answer.

---

# P1: build only after P0 is stable

## P1.1 Tap any field to hear it

The user can tap any important field and hear the value.

Example:

Tap:

> Father's Name: RAJESH

Audio:

> Your father's name in this record is Rajesh.

The voice layer and diff become one interaction.

---

# P1.2 Pre-recorded audio for golden cases

Instead of depending on live Sarvam or another production voice API for the demo, we can use pre-recorded audio for the frozen cases.

This reduces demo risk.

The goal is to demonstrate the interaction, not production infrastructure.

---

# P1.3 Claim Compiler / Pre-flight Check

Run supported checks before claim submission.

Example:

> One issue may block this claim.

> Your bank IFSC does not match the verified bank record.

The user can then run Fix before submitting.

---

# P1.4 Consent + Simulated Execution

Once the diagnosis is complete, the product can show exactly what would be sent.

Example:

> We will prepare a grievance containing:

- claim number
- rejection reason
- evidence
- Mool timeline
- verdict
- requested action

The member then approves.

Nothing leaves the system silently.

---

# P1.5 Employer-oriented Forward Package

A Forward case has a second user.

The employer.

So the output should not be designed only for the claimant.

Example package:

**Employee**  
Rahul Kumar

**Blocking field**  
Date of Exit

**Current state**  
Missing

**Requested action**  
Update Date of Exit

**Why this matters**  
Claim cannot proceed until this field is updated.

**Supporting evidence**  
Attached

**Requested by**  
27 August

This makes the next actor's job easier.

A Forward verdict without designing for the receiving party is incomplete.

---

# P2: future considerations

- Guardian / Helper Mode
- real WhatsApp integration
- missed-call / IVR
- full audio-first experience
- Prove-It-Back scam checker
- persistent settlement-readiness checks
- new-job record checks
- collective case intelligence
- identity alias / truth layer
- nominee / death claim support through Virasat
- employer-side prevention
- cohort-level pattern detection
- broader rejection-code support

---

# Future Considerations

## Persistent readiness

Eventually, the system should not wait for a rejection.

It can detect problems when they enter the record.

For example:

> A new employer record has been added and one identity field no longer matches your current records.

This makes withdrawal readiness a standing state rather than something checked only when money is needed.

---

## Audio-first experience

The longer-term accessibility bar should be:

> Can a member complete the core journey without needing to read long screens?

This can eventually include:

- Hindi audio
- code-mixed voice
- tap-to-hear
- voice confirmations
- missed calls
- callbacks
- IVR

For the hackathon, we should not let this expand the core scope.

---

# Key Flows

# Flow 1: Fight

## Situation

The claim has been rejected with:

> Rejected: discrepancy in name

### Step 1: Entry

The rejected claim shows:

> **Understand and resolve this rejection**

The user opens Nidhi Rakshak.

Or in the standalone prototype, the user takes a photo of the rejection.

### Step 2: Decode

System identifies:

```text
damage_code = IDENTITY_NAME_MISMATCH
```

User sees:

> One of the names in your employment records does not match your current identity records.

### Step 3: Compare

| Source | Value |
|---|---|
| Aadhaar | RAMESH BADIGER |
| PAN | RAMESH BADIGER |
| Current EPFO Profile | RAMESH BADIGER |
| 2019 Employment Record | RAJESH BADIGER |

The difference is highlighted.

### Step 4: Mool

Timeline:

> Aadhaar: RAMESH  
> PAN: RAMESH  
> 2019 employment record: RAJESH  
> Current EPFO profile: RAMESH

Output:

> **This is the first place your records stop agreeing.**

> The first conflicting value we can see appears in your 2019 employment record.

> We cannot see who entered it.

### Step 5: Do Not Touch

# DO NOT CHANGE YOUR CURRENT NAME

> Your current identity records already agree.

> Changing your current name may create more mismatches.

### Step 6: Falsifiability

> **Check us:** If your 2019 payslip also shows RAMESH, this diagnosis may be wrong.

### Step 7: Sandbox

CTA:

> What if I change my current EPFO name?

System simulates the change.

Result:

> You would reduce one mismatch but create two new ones.

### Step 8: Verdict

# FIGHT

> Do not change your current record.

> Contest the rejection.

### Step 9: Receipt

Generate shareable case summary.

### Step 10: Action

Preview grievance payload.

Ask for explicit consent.

Prototype simulates submission.

### Step 11: Tracking

Show:

> Current owner: EPFO grievance

> Next date to check: 2 September

No fake percentage.

---

# Flow 2: Forward

## Situation

The claim is blocked because Date of Exit is missing.

### Step 1: Diagnose

> Your Date of Exit is missing.

### Step 2: Ownership

> This field is controlled by your previous employer.

### Step 3: Verdict

# FORWARD

> This is not yours to fix.

### Step 4: Employer package

Generate a forwardable employer-ready artifact.

### Step 5: Handoff

Member forwards it to employer / HR.

### Step 6: Tracking

> Waiting on previous employer.

> Next escalation date: X.

If we cannot support a real escalation rule, the prototype should use a simulated date and label it clearly.

---

# Flow 3: Fix

## Situation

Bank IFSC is incorrect.

### Step 1: Diff

Show:

| Source | IFSC |
|---|---|
| Current EPFO bank record | ABCD0001234 |
| Verified bank record | ABCD0005678 |

### Step 2: Ownership

> This is a member-correctable field.

### Step 3: Sandbox

Simulate correction.

Before:

> 1 supported blocker

After:

> 0 supported blockers

### Step 4: Verdict

# FIX

> Update this bank record before filing again.

### Step 5: Route

Send user into the existing relevant correction path.

---

# Flow 4: Pre-flight

## Situation

The member has not filed yet.

### Step 1

User taps:

> Check my claim before submitting

### Step 2

Supported checks run.

### Step 3A: issue found

> We found one issue that could block this claim.

Show Fix / Forward where applicable.

### Step 3B: no issue found

> We found no blocker in the checks we currently support.

Do not promise approval.

---

# Flow 5: Refusal

## Situation

The evidence is incomplete.

Example:

We can see:

- current Aadhaar
- current EPFO
- 2019 employment record

but not an older record required to establish chronology.

### Output

# We cannot diagnose this safely yet.

> We need one older employment record to determine whether this mismatch existed before 2019.

No verdict.

No fake Mool story.

No simulated action.

---

# Key Logic

## Product principle

> **AI reads the mess. Deterministic code makes consequential decisions.**

The original case file already separates AI interpretation from deterministic decision logic.

| Stage | Type | What it does | What it must not do |
|---|---|---|---|
| **Camera / OCR** | AI | Read screenshot and document photos | Decide identity or fault |
| **Voice / Audio** | AI / pre-recorded | Read or speak information | Make verdict decisions |
| **Decode** | Deterministic | Map supported rejection to damage code | Guess unsupported reason |
| **Match** | Deterministic | Normalize and compare values | Silently merge identities |
| **Mool** | AI-assisted with evidence boundaries | Explain first observable divergence | Invent culprit or intent |
| **Verdict Engine** | Deterministic | Fix / Fight / Forward | Let model decide |
| **Sandbox** | Deterministic | Apply simulated change and rerun checks | Promise claim approval |
| **Falsifiability** | Case rules | State what would prove diagnosis wrong | Give generic disclaimer |
| **Receipt** | Structured generation | Summarize evidence + verdict | Add unsupported claims |
| **Consent Gate** | Deterministic | Require approval before outbound action | Submit silently |

---

# Record Normalization Logic

Before comparison, values may need deterministic normalization.

Possible steps:

- trim whitespace
- uppercase / lowercase normalization
- punctuation removal where appropriate
- transliteration
- phonetic normalization where explicitly supported
- exact string comparison
- controlled similarity fallback

Similarity should help surface a potential match.

It should not silently decide that two identities are the same.

---

# Mool Rules

Mool may say:

> The records agree until 2019.

Mool may say:

> The first different value we can see appears in the 2019 employment record.

Mool may say:

> We cannot determine who entered it.

Mool may not say:

> Your employer caused this.

unless we have evidence that directly supports that statement.

Mool may not infer:

- intent
- person responsible
- exact write mechanism
- legal liability

from chronology alone.

---

# Verdict Logic

## Fix

Return Fix when:

- the blocking field is genuinely wrong
- the field is controlled by the member or has a member-accessible correction route
- the evidence supports the corrected value
- confidence meets threshold

---

## Fight

Return Fight when:

- the member's verified current records agree
- changing them would create or worsen inconsistencies
- the rejection appears inconsistent with the available evidence
- the case is supported by the rule set

Fight must trigger Do Not Touch.

---

## Forward

Return Forward when:

- another party owns the field
- the member cannot directly correct it
- a known handoff route exists

The flow should produce a receiving-party artifact.

---

# Confidence Logic

Possible states:

### High confidence

Enough evidence exists for a supported verdict.

### Medium confidence

We have a likely interpretation but require member confirmation of one field.

### Low confidence

Evidence is insufficient.

Return refusal.

Do not force a verdict just because the UI expects one.

---

# Proposed Prototype Data Contract

```text
case_id

claim {
  claim_type
  rejection_text
  rejection_date
}

damage_code

records[] {
  source
  field
  raw_value
  normalized_value
  verification_state
  simulation_state
  confidence
}

mismatches[] {
  field
  source_a
  source_b
  values
  confidence
}

mool_events[] {
  date
  source
  field
  value
  evidence_state
}

first_divergence {
  field
  date
  source
  evidence_state
}

verdict {
  type: FIX | FIGHT | FORWARD
  owner
  rule_id
}

falsifiability {
  statement
  required_evidence
}

sandbox {
  proposed_change
  before_blockers
  after_blockers
}

next_action {
  route
  owner
  payload_preview
  consent_required
}

receipt {
  summary
  evidence
  simulation_label
}
```

---

# Screen Requirements

# Screen 1: Rejection Entry

## Goal

Start with what the user already has.

### Main CTA

> Take a photo of your rejection

### Secondary CTA

> Upload screenshot

### Requirements

- camera-first
- no required typing
- show uploaded artifact
- extract rejection text
- confirm only when extraction confidence is low
- simulation label always visible
- Hindi / English copy where feasible
- audio can be layered later

---

# Screen 2: What is wrong

## Goal

Make the disagreement obvious.

### Requirements

- plain-language rejection explanation
- side-by-side values
- source labels
- exact differing character highlighted
- verified / simulated / inferred states
- no wall of text
- CTA:

> Find where this starts

---

# Screen 3: Mool

## Goal

Show the first divergence.

### Requirements

- chronological timeline
- first divergence visually dominant
- verified versus inferred clearly shown
- sentence:

> This is the first place your records stop agreeing.

- sentence where relevant:

> We cannot see who entered this value.

- no unsupported blame

---

# Screen 4: Do Not Touch / Verdict

## Goal

Prevent harmful action and give one next route.

### Fight state

# DO NOT CHANGE YOUR CURRENT NAME

Then:

**FIGHT**

### Fix state

**FIX**

### Forward state

**FORWARD**

### Requirements

- one clear owner
- one clear next action
- one thing the user should not do
- one falsifiability line
- sandbox CTA
- receipt CTA

---

# Screen 5: Sandbox

## Goal

Show the consequence before the member acts.

### Requirements

- proposed change
- before state
- after state
- blocker count / supported-check result
- no approval guarantee
- clear recommendation

---

# Screen 6: Receipt / Handoff

## Goal

Carry the diagnosis to the next actor.

### Requirements

- forwardable image
- minimal text
- evidence summary
- first divergence
- what we know
- what we do not know
- verdict
- owner
- falsifiability
- next action
- simulation label

---

# Screen 7: Status

## Goal

Answer two questions:

> Who owns the blocker?

> When should I check again?

### Requirements

Do not use:

> 74% complete

Use:

> Waiting on previous employer

> Check again by 2 September

Only use dates that we can support or label as simulated.

---

# 🚀 Execution Plan

We have very limited time.

The core risk now is scope, not lack of ideas.

The build should start with frozen golden cases.

No second ideation round after scope freeze.

---

# Golden Cases

## Case 1: Fight

**Rejection**  
Identity / name mismatch

**Evidence**  
Current identity records agree. Historical employment record diverges.

**Must demonstrate**

- camera
- decode
- diff
- Mool
- Do Not Touch
- falsifiability
- sandbox
- Fight
- receipt

---

## Case 2: Forward

**Rejection / blocker**  
Missing Date of Exit

**Evidence**  
Employer owns the field.

**Must demonstrate**

- diagnosis
- ownership
- Forward
- employer-oriented artifact
- tracker

---

## Case 3: Fix

**Blocker**  
Wrong bank / IFSC

**Evidence**  
Verified bank value exists.

**Must demonstrate**

- diff
- sandbox
- blocker clears
- Fix

---

## Case 4: Refusal

**Problem**  
Evidence insufficient.

**Must demonstrate**

> We cannot diagnose this safely yet.

and specify the missing record.

This should appear in the demo because it proves the system is allowed to refuse.

---

# Key Milestones

| Milestone | Owner | Planned Delivery Date | Actual Delivery Date | Comments |
|---|---|---|---|---|
| Product direction finalized | Team | 26 Aug | TBD | Advocate + inversion direction |
| ICP / North Star / aha locked | Team | 26 Aug | TBD | Completed |
| EPFO placement finalized | Team | 26 Aug | TBD | Rejected claim primary, pre-flight secondary |
| Golden cases frozen | Team | 26 Aug | TBD | Must freeze before build |
| Legal / domain verification sprint | TBD | 26-27 Aug | TBD | SLA, interest, Mark Exit, Joint Declaration |
| PRD finalized | Harsh | 27 Aug AM | TBD | No new ideation after |
| Tech design finalized | TBD | 27 Aug AM | TBD | Data contracts + rules |
| Design finalized | TBD | 27 Aug | TBD | Hero flow first |
| Development starts | TBD | 27 Aug noon | TBD | Hard gate |
| Decode + diff engine | TBD | 27 Aug | TBD | P0 |
| Mool | TBD | 27 Aug | TBD | First divergence only |
| Verdict engine | TBD | 27 Aug | TBD | Deterministic |
| Sandbox | TBD | 27 Aug | TBD | P0 |
| Receipt | TBD | 28 Aug AM | TBD | Forwardable image |
| Refusal state | TBD | 28 Aug AM | TBD | Must be included |
| QA | Team | 28 Aug | TBD | Product + logic + copy |
| Demo recording | Team | 28 Aug | TBD | 2-minute video |
| Submission summary | Team | 28 Aug | TBD | 250 words |
| Final submission | Team | 28 Aug | TBD | Submit before deadline |

---

# Operational Checklist

| Team | Prompt | Y/N | Action | Done? |
|---|---|---|---|---|
| **Analytics** | Do we need additional tracking? | Yes | Track full rescue funnel | TBD |
| **Localisation** | Does this need localisation? | Yes | English + Hindi core copy; audio if time permits | TBD |
| **Internal Ops** | Do we need internal workflows? | Limited | Maintain golden cases and expected outputs | TBD |
| **Partners** | Does this impact external partners? | Simulated | Employer / bank handoffs are prototype-only | TBD |
| **Legal / Policy** | Are there potential legal ramifications? | Yes | Verify legal / financial claims before demo | TBD |
| **Security / Privacy** | Does this expose risk vectors? | Yes | Use only simulated personal data | TBD |
| **Accessibility** | Does the experience need low-literacy support? | Yes | Camera-first, zero typing, tap-to-hear if time | TBD |

---

# Analytics

The important thing is not whether someone uploaded a screenshot.

We need to understand whether they reached a correct diagnosis and resolution route.

| Event | Properties | Why |
|---|---|---|
| **case_started** | entry_point, input_type | How does the member enter? |
| **rejection_decoded** | damage_code, confidence | Was the rejection understood? |
| **diff_viewed** | field, sources | Did the user see the disagreement? |
| **mool_viewed** | first_divergence, evidence_state | Did the hero moment happen? |
| **do_not_touch_shown** | field, reason | Are we preventing harmful fixes? |
| **sandbox_started** | proposed_change | Does the user test before acting? |
| **sandbox_completed** | before_blockers, after_blockers | Did the simulated outcome change? |
| **verdict_shown** | fix/fight/forward | Which route did we choose? |
| **diagnosis_refused** | missing_evidence | Where did the system correctly stop? |
| **receipt_generated** | verdict | Was the evidence packaged? |
| **receipt_shared** | destination_type | Does the diagnosis travel to the next actor? |
| **consent_confirmed** | action_type | Did the user approve the next action? |
| **case_completed** | verdict | Did the rescue flow finish? |
| **case_abandoned** | last_step | Where did the user stop? |

---

# Guardrails

## Product guardrails

- Mool finds divergence, not guilt.
- Every important value retains provenance.
- Inferred facts are labelled as inferred.
- Simulated records are labelled simulated.
- Unsupported rejection reasons return refusal.
- Every supported verdict contains a falsifiability line.
- No action happens without consent.
- No LLM silently decides identity.
- No LLM chooses Fix / Fight / Forward.
- No generated explanation can override deterministic rules.
- Do not say “you will win.”
- Do not promise claim approval.
- Do not claim a grievance was filed if the prototype only simulated it.
- Do not claim money was settled.
- Do not show the 12% delay-penalty / interest counter unless verified before build.
- Use only simulated personal data in the hackathon.

---

# Risks & Mitigation

| Risk | Why it matters | Mitigation |
|---|---|---|
| **Mool invents a culprit** | Most differentiated feature becomes the biggest trust failure | Mool only names first observable divergence unless direct evidence exists |
| **Wrong verdict** | User may change a correct record | Deterministic verdict rules + frozen test cases |
| **OCR reads one character incorrectly** | Could create fake mismatch | Show extracted value + confidence + confirmation gate |
| **Prototype looks official** | Could imply live government access | Persistent “Simulated prototype, not EPFO” labelling |
| **Too much scope** | Core flow breaks before submission | Freeze P0, no late additions |
| **Voice dependency fails in demo** | Live audio APIs create risk | Use pre-recorded audio if audio is built |
| **Fake status precision** | Makes the product look dishonest | Show owner + meaningful date, not fake percentage |
| **Unsupported legal claim** | Trust / judging risk | Verify before build or cut |
| **Forward flow stops at the claimant** | The real owner still cannot act | Design employer-facing artifact |
| **Refusal is missing** | Product appears overconfident | Include one refusal golden case |

---

# Marketing / GTM

For the hackathon, this is not a traditional GTM problem.

The product is designed as an embedded EPFO capability.

The natural distribution is therefore inside the member claim journey.

## Primary discovery

After a rejected claim:

> **Understand and resolve this rejection**

## Secondary discovery

Before filing:

> **Check my claim before submitting**

The value proposition should remain simple:

> **Don't guess which record to change.**

or:

> **See what is actually blocking your PF before you touch anything.**

The product should not lead with:

- AI
- OCR
- agents
- automation
- grievance generation

Those are implementation details.

The user cares about getting unstuck safely.

---

# Demo Story

The demo should prove:

1. we understand the actual blocker
2. we do not over-claim
3. we can stop the user from making the situation worse
4. we can route the issue to the right person

---

## Two-minute demo

### Beat 1: Start from the artifact

Take a photo of:

> Rejected: discrepancy in name

No form.

No typing.

### Beat 2: Decode

> One of the names in your employment records does not match your current identity records.

### Beat 3: Diff

Show:

- Aadhaar: RAMESH
- PAN: RAMESH
- Current EPFO: RAMESH
- 2019 record: RAJESH

One letter glows.

### Beat 4: Mool

> **This is the first place your records stop agreeing.**

Then:

> We cannot see who entered this value.

### Beat 5: Do Not Touch

# DO NOT CHANGE YOUR CURRENT NAME

### Beat 6: Try before you touch

User simulates changing current EPFO record to RAJESH.

Mismatches increase.

> This change makes your records worse.

### Beat 7: Fight

> **FIGHT**

> Contest the rejection instead.

Show forwardable receipt.

### Beat 8: Forward

Quick second case.

Missing Date of Exit.

> This is not yours to fix.

Employer-ready package appears.

### Beat 9: Fix

Wrong IFSC.

Sandbox goes:

> 1 blocker → 0 blockers

### Beat 10: Refusal

For ten seconds:

> We cannot diagnose this safely yet.

> We need one more record.

This proves the product is allowed not to know.

---

# 30-second Demo

1. Photo of rejection
2. Decode
3. Record diff
4. Mool shows first divergence
5. Do Not Touch
6. Simulate the wrong correction
7. Show it creates more mismatches
8. Fight
9. Show receipt

---

# Frame to Remember

The original line was:

> This is where your error entered. It was not your mistake.

That overstates what we may know.

The revised frame should be:

> **This is the first place your records stop agreeing.**

and directly below it:

> **Your current record is already correct. Do not change it.**

That is more defensible and, I think, more memorable.

---

# Closing Line

> **You should never have to guess which record to change just to get your own money.**

Nidhi Rakshak tells you what is blocking the claim, what not to touch, who needs to act, and what happens next.

---

# 🛠️ Working Section

# Meeting Notes

## 26 August 2026 - Scope Freeze Discussion

### Decisions already aligned

- Primary ICP is a rejected EPFO claimant.
- Includes both blue-collar and white-collar EPFO members.
- Claim Rescue Rate is the North Star.
- Mool remains the hero feature.
- Fix / Fight / Forward remains the core decision system.
- Product sits inside the EPFO member claim journey.
- Primary placement is against a rejected claim.
- Secondary placement is pre-submission.
- Camera-first moves to P0.
- Zero typing becomes the core interaction bar.
- Receipt becomes a forwardable image.
- Mool changes from culprit attribution to first observable divergence.
- Fight cases get a first-class Do Not Touch state.
- Every verdict gets a falsifiability line.
- Simulation becomes Try Before You Touch.
- One refusal case must be shown.
- Interest counter is cut unless verified before build.

---

# Changelog

| Change | Date | People | Comments |
|---|---|---|---|
| Initial advocate direction selected | 26 Aug | Team | Mool + Fix / Fight / Forward |
| ICP clarified to include blue + white-collar members | 26 Aug | Team | Design priority still assumes harder digital context |
| Claim Rescue Rate locked | 26 Aug | Team | Settlement not used as direct North Star |
| EPFO placement locked | 26 Aug | Team | Rejected claim primary, pre-flight secondary |
| Inversion pass incorporated | 26 Aug | Team | Product moves from asserting to bounding |
| Mool redefined | 26 Aug | Team | First divergence, not culprit |
| Camera-first promoted to P0 | 26 Aug | Team | Zero-typing hero flow |
| Receipt format closed | 26 Aug | Team | Forwardable image |
| Sandbox added | 26 Aug | Team | Try before you touch |
| Do Not Touch elevated | 26 Aug | Team | First-class Fight state |
| Refusal state added | 26 Aug | Team | Low-confidence cases stop safely |
| P0 scope tightened | 26 Aug | Team | No further ideation after freeze |

---

# Open Questions

Most product-direction questions should be considered closed now.

The remaining questions are execution questions.

## 1. What exact rejection reasons are supported?

We need a frozen list before engineering starts.

Suggested golden scope:

- identity / name mismatch
- missing Date of Exit
- bank / IFSC mismatch
- insufficient evidence refusal case

Anything outside this should fail safely.

---

## 2. What evidence exists for each golden case?

For every case, we need to define:

- records available
- values
- timestamps
- verification state
- first divergence
- expected verdict
- falsifiability line
- expected sandbox behaviour

---

## 3. What counts as verified?

We need a clear internal definition for:

- verified identity record
- simulated EPFO record
- employer record
- inferred event
- unknown

Otherwise the UI labels will mean nothing.

---

## 4. What confidence threshold triggers refusal?

The product should have a concrete rule for:

- high confidence
- confirmation required
- refusal

This should not be left to prompt wording.

---

## 5. How much of execution is actually built?

The hero value is diagnosis and routing.

If real execution threatens P0, we should simulate the handoff rather than weakening the core.

---

## 6. Who owns what in the build?

Need to lock:

- frontend
- camera / OCR
- case data
- matching
- Mool
- verdict engine
- sandbox
- receipt
- analytics
- demo video

---

## 7. Which legal / policy facts still need verification?

The source material already flags the member-facing interpretation of the 12% delayed-claim point as needing further primary-source verification.

If not verified before build freeze, cut it.

---

# Final Product Definition

> **Nidhi Rakshak is a claim-support layer embedded inside the EPFO member claim journey. Its primary surface appears against a rejected claim. It reads the rejection, shows the conflicting records, uses Mool to identify the first observable divergence, tells the member what not to change, and routes the case through Fix, Fight or Forward. Before the member changes a record, they can simulate the proposed correction and see whether it improves or worsens the checks we support. Every diagnosis is sourced, falsifiable and allowed to end in “we don't know.” A secondary pre-flight surface uses the same system before claim submission to catch supported blockers early. It does not replace EPFO's claim, correction or grievance systems. It connects them around the member's actual blocker.**
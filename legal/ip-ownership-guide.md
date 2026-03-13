# HEBBS — IP Ownership & Contributor Guide

**Status:** Pre-incorporation. All IP currently owned by Parag Arora personally.

---

## Current IP Structure

| Asset | Owner | Basis |
|---|---|---|
| All HEBBS source code | Parag Arora | Original author |
| HEBBS name / brand | Parag Arora | First use |
| hebbs.ai domain | Parag Arora | Domain registration |
| Documentation | Parag Arora | Original author |

## License

HEBBS is licensed under the Business Source License 1.1 (see `hebbs/LICENSE`).

---

## Rules for Contributors

**Every person who writes code for HEBBS must sign two documents before their first contribution.**

No exceptions. No "we'll sort it out later." No verbal agreements.

### Document 1: IP Assignment Agreement

Every contributor signs this. It assigns all HEBBS-related IP to Parag Arora (or any entity he designates as successor). See `legal/templates/ip-assignment-agreement.md` for the template.

### Document 2: Consulting Company IP Waiver

Because contributors may be employees of Parag Arora's consulting company, a letter from the consulting company explicitly waiving any claim to HEBBS IP is required. See `legal/templates/consulting-company-ip-waiver.md` for the template.

### Why Both Documents Are Needed

Under Indian copyright law (Copyright Act, 1957, Section 17), if an employee creates a work during the course of employment, the employer owns the copyright. Even if the employee does the work "on the side," a broad IP assignment clause in their employment contract could give the employer a claim.

The IP Assignment covers the individual's rights. The IP Waiver covers the consulting company's potential claim. Together, they create an unambiguous chain of ownership.

---

## Contributor Log

Track every contributor here. Do not accept code from anyone not listed.

| Name | Role | IP Assignment Signed | IP Waiver Signed | Date of First Contribution | Notes |
|---|---|---|---|---|---|
| Parag Arora | Founder / Original Author | N/A (is the owner) | N/A (owns the company) | Project inception | All code to date |
| | | | | | |

---

## Post-Incorporation Sequence

When the HEBBS company is incorporated:

| Step | Action | Document |
|---|---|---|
| 1 | Parag Arora assigns all HEBBS IP to the new company | Founder IP Assignment Agreement |
| 2 | Existing contributors sign new assignments to the company (or existing agreements flow via "designee" clause) | Updated IP Assignment |
| 3 | Consulting company signs updated waiver to the new company | Updated IP Waiver |
| 4 | Update `hebbs/LICENSE` — change Licensor to company name | One-line commit |
| 5 | Set up CLA (Contributor License Agreement) for future open-source contributors | CLA (Apache-style or custom) |

---

## Key Legal References (India)

- **Copyright Act, 1957, Section 17**: Employer owns copyright of works created during employment, unless otherwise agreed in writing.
- **Copyright Act, 1957, Section 19**: Assignment of copyright must be in writing and signed by the assignor.
- **Copyright Act, 1957, Section 18**: Assignment can cover future works if sufficiently described.

---

## What NOT to Do

1. **Do not accept code without signed documents.** Period.
2. **Do not use the consulting company as the HEBBS entity.** Keep IP chains separate.
3. **Do not rely on verbal agreements.** Indian law requires written assignment for copyright transfer.
4. **Do not let contributors use consulting company equipment/time without the waiver in place.** It strengthens the company's potential claim.
5. **Do not let anyone commit to the repo before both documents are signed and logged above.**

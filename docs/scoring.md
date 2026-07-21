# Fintra Simulation Scoring Model

This document outlines the scoring algorithms and rules applied during the **Churn Spike (Newcomer Edition)** simulation.

---

## 1. Competency Breakdown

The user is evaluated across 5 core data science competencies, each graded out of 100.

### A. Investigation
Measures systematic data exploration and cross-filtering behavior in Stage 1.
* **Full Signal Combo (`ahaCombo`)**: **100 points**
  * Triggered by layering: Segment (SMB) + Region (SEA) + Ticket Overlays.
* **Partial Exploration / Sub-signals**:
  * Found SMB segment: **+50 points**
  * Opened $\ge 3$ panels: **+20 points**
  * Found SEA region: **+15 points**
  * Overlaid support tickets: **+15 points**
  * *Note: Clamped to a maximum of 100 points.*

### B. Interpretation
Evaluates written quantitative interpretation and option matching in Stage 2.
* **Base Score**: Graded based on matching driver keywords and causal trends selected during interpretation.
* **Hint Deduction**: If a mentoring hint is requested, **-15 points** are deducted from the final Stage score (clamped to a minimum of 0).

### C. Decision Quality
Evaluates quantitative response actions and budget allocation alignment in Stage 3.
* **Base Score**: Calculated based on the budget allocation model relative to the gateway outage.
* **Hint Deduction**: If a mentoring hint is requested, **-15 points** are deducted from the final Stage score (clamped to a minimum of 0).

### D. Business Awareness
Evaluates cross-functional awareness and team response strategy.
* Based on budget allocation branch:
  * **Balanced Response**: **100 points** (Surge support $\ge 20\%$ and Retention discounts $\le 40\%$).
  * **Imbalanced Response** (under-support or excessive discounting): **55 points**.

### E. Communication
Evaluates clarity, structured writing, and stakeholder update content in Stage 5.
* **Base Score**: Graded based on coverage of the structural board update rubric (Metric impact, Outage cause, Next steps/mitigation).
* **Hint Deduction**: If a mentoring hint is requested, **-15 points** are deducted from the final Stage score (clamped to a minimum of 0).

---

## 2. Quotient Match Score

The overall matching score is calculated as the simple average of all 5 competency scores:
$$\text{Quotient Match Score} = \text{round}\left( \frac{\text{Investigation} + \text{Interpretation} + \text{Decision Quality} + \text{Business Awareness} + \text{Communication}}{5} \right)$$

---

## 3. Readiness Band Classification

| Score Range | readiness Band | Description |
| :--- | :--- | :--- |
| **0 – 40** | **Novice Practitioner** | Beginning journey; needs to focus on diagnostic cross-filtering and causation patterns. |
| **41 – 70** | **Foundation Builder** | Strong understanding of concepts; developing practical application capabilities. |
| **71 – 100** | **Advanced Practitioner** | Excellent diagnostic rigor and proportional, business-aligned decision capabilities. |

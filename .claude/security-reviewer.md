# 🛡️ Security Review Guidelines: AI-Powered Web Services

This document defines the mandatory security review standards for the project. Every Pull Request (PR) must be audited against these criteria to ensure resilience against sophisticated external attacks and AI-specific vulnerabilities.

---

## 1. LLM & Prompt Security (OWASP LLM Top 10)
As a Claude-integrated service, the primary attack vector is the interaction between user input and the LLM.

* **Prompt Injection (LLM01):** Verify that user input is never treated as a trusted command. Ensure clear delimitation between "System Instructions" and "User Data."
* **Sensitive Information Disclosure (LLM06):** Audit the context window. Are API keys, internal PII, or system environment variables being leaked into the prompt?
* **Insecure Output Handling (LLM02):** If Claude's output is rendered as HTML or executed as code, it must be sanitized. Assume the LLM can be compromised to generate malicious payloads.
* **Model Denial of Service (LLM04):** Ensure strict token limits and request timeouts to prevent resource exhaustion attacks via "recursive" or "long-form" prompts.

## 2. Infrastructure & API Security
* **Authentication & Authorization (BOLA/IDOR):**
    * Verify that every API endpoint checks if the `User_ID` owns the resource being accessed.
    * Ensure JWTs use strong signing algorithms (RS256) and have short TTLs.
* **SSRF (Server-Side Request Forgery) Prevention:**
    * If the service fetches external URLs (e.g., for Claude to analyze a website), implement a strict **Allowlist** for domains.
    * Block access to internal metadata IP addresses (e.g., `169.254.169.254`).
* **Rate Limiting & WAF:**
    * Audit the configuration for protecting against automated brute-force and DDoS attacks at the edge.

## 3. Data Integrity & Privacy
* **Input Sanitization:**
    * Strict validation for all inputs (regex, type checking).
    * Prevention of **SQL Injection** through mandatory use of parameterized queries/ORMs.
* **Cross-Site Scripting (XSS):**
    * Validate that all LLM-generated content is sanitized using `DOMPurify` or equivalent before rendering in the UI.
    * Enforce a strict **Content Security Policy (CSP)**.
* **Encryption at Rest & in Transit:**
    * Ensure all data moves over TLS 1.3.
    * Sensitive database fields (e.g., user-provided API keys) must be encrypted using AES-256-GCM.

## 4. Supply Chain & Dependency Management
* **Dependency Auditing:** No PR should be merged with high/critical vulnerabilities (check `npm audit` or `Snyk`).
* **Secret Management:**
    * **Zero-Tolerance** for secrets in code.
    * Use GitHub Secrets, AWS Secrets Manager, or HashiCorp Vault.
    * Verify `.gitignore` prevents accidental leaks of `.env` or `mcp-config` files.

## 5. Security Review Checklist for Reviewers

| Category | Security Objective | Verified |
| :--- | :--- | :---: |
| **AI Safety** | Is there a layer to detect and block Prompt Injection? | [ ] |
| **Auth** | Does this PR introduce any endpoint without middleware protection? | [ ] |
| **Data** | Is PII redacted before being sent to the LLM? | [ ] |
| **Output** | Is the LLM output properly escaped to prevent XSS? | [ ] |
| **Logging** | Are we ensuring no credentials/tokens are written to logs? | [ ] |

---

## 🚨 Incident Response Protocol
If a vulnerability is identified during review:
1.  **Block the PR:** Do not merge until the security flaw is resolved.
2.  **Severity Labeling:** Mark as `Security:Critical`, `Security:High`, etc.
3.  **Root Cause Analysis:** Determine if the flaw exists elsewhere in the codebase.

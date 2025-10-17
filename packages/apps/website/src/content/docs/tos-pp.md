---
title: Superego Demo — Terms of Service and Privacy Policy
tableOfContents: false
---

This page outlines the **Terms of Service** and **Privacy Policy** that apply to
your use of the **Superego Demo**, available at
[https://demo.superego.dev](https://demo.superego.dev).

**By using the Superego Demo, you acknowledge and agree to these terms.**

Superego is an **open-source project licensed under the GNU Affero General
Public License v3 (AGPLv3)**. The source code is available at
[https://github.com/superegodev/superego](https://github.com/superegodev/superego).

---

## 0. Who We Are

The Superego Demo is maintained and operated by the **Superego project
maintainers** — the individuals who develop and administer the Superego open
source project and its demo website at **demo.superego.dev**.

Throughout this document, “**we**”, “**our**”, or “**us**” refers to these
project maintainers and administrators.

---

## 1. Terms of Service

### 1.1. Overview

The **Superego Demo** is provided **for demonstration and testing purposes
only**. By using the demo, you agree to these Terms. If you do not agree, please
do not use the demo site.

### 1.2. No Warranty

Superego and the Superego Demo are provided **“as is”**, without warranty of any
kind. The demo may be unstable, incomplete, or unavailable at times. You use it
**at your own risk**.

### 1.3. Intended Use

The demo is intended to help users **explore the capabilities of Superego**
without installing it locally. **Do not use the demo with highly sensitive or
confidential information.**

### 1.4. External Services

The demo allows you to connect to third-party services, e.g., Google Calendar.
These connections happen entirely between your browser and the third-party
services, **through client-side OAuth** (PKCE). We **do not** receive your
tokens or personal data.

### 1.5. Demo Inference API

The demo uses a lightweight proxy API to access an inference service operated by
us. This API is **for demo use only** and **must not** be used for other
purposes.

**Important:** When you use AI features, your browser sends requests to this
proxy, and those requests **may include personal data** contained in your
prompts or context. The proxy **forwards** the request to the inference service
and returns the response. **Neither we nor the upstream inference service store
or collect the content of your requests or the model’s responses.**

The API collects **error logs** to monitor and diagnose issues. These logs **may
include portions of request data**, such as prompts or context, if they caused
an error. We do not intentionally log or retain user content beyond what is
needed to fix issues.

### 1.6. Limitation of Liability

To the maximum extent permitted by law, Superego’s contributors are **not
liable** for any damages or losses resulting from the use of the demo or its
associated services.

---

## 2. Privacy Policy

### 2.1. Data Handling

- Most data processing occurs **entirely in your browser**. Imports from
  external sources and local data handling remain on your device.
- When you use AI features, your browser sends a request to the
  Superego-operated **inference proxy**. That request **likely contains personal
  data**. The proxy **does not store** request or response content and uses it
  only to fulfill your request.
- We do, however, collect **error logs**, which may include portions of your
  data. We **do not** log prompts, outputs, or tokens as part of normal
  operation.

### 2.2. Third-Party Integrations

When you connect external services (e.g., Google Calendar), all communication
occurs directly between your browser and those services. Superego does not see,
intercept, or store any of that data.

### 2.3. Browser Storage

The demo uses browser storage (`localStorage`, `sessionStorage`, and
`IndexedDB`) to save your data. This data remains **on your device only** and
can be cleared at any time from your browser settings.

### 2.4. Analytics

The Superego Demo **does not use tracking or analytics services** (e.g., Google
Analytics, third-party cookies, or beacons).

### 2.5. Security & Retention

We aim to minimize data exposure:

- Model inputs and outputs sent to the inference proxy are **processed
  transiently** and **not persisted** on the server.
- Operational logs (usage/error telemetry) are kept **only as long as needed**
  to maintain service reliability and diagnose issues.

### 2.6. Sensitive Information

Although content is not stored by the server, inference requests may include
personal data. **Do not use the demo to process highly sensitive information**
(e.g., health, financial, or government identifiers).

---

## 3. Contact

For questions or concerns about these Terms or this Policy, you can reach the
project maintainers at: **info@superego.dev**.

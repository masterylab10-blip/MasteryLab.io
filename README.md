# MasteryLab (masterylab.ch)

Welcome to **MasteryLab** - Where Movement Meets Passion.

This is the official website for MasteryLab, a premier dancing studio and community based in Switzerland.

## Tech Stack
- HTML5
- CSS3 (Custom Design)
- JavaScript

## Setup
Simply open `index.html` in your web browser to view the site.

For a local preview, run `python3 -m http.server 8081` and open `http://127.0.0.1:8081/`.

## Clean website URLs

Edit the root HTML source pages, then run `python3 scripts/build-clean-urls.py` before committing. This regenerates the directory entrypoints served by GitHub Pages, such as `/memories/` and `/feedback-7c9e2b/`. Keep the generated entrypoints in the same commit as source changes. Old `.html` addresses forward to their clean route while preserving query parameters and fragments.

## Checks and registration transport

Run `python3 scripts/check-site.py` and `node --test tests/submission.test.cjs` before publishing. Calendar facts come from `data/events.json`; the clean-URL build also refreshes page metadata and the sitemap. The unlisted feedback page stays outside public navigation and the sitemap.

The M&M, Dancers and shoe-order forms use one Google Apps Script receiver (`server/mm-vol3-receiver.gs`) with fixed private Sheet destinations. Forms wait for a positive save acknowledgement before checkout or success. References prevent duplicate submissions. Couple registrations require separate participant details and one Leader plus one Follower. Prices are checked in the receiver; saving a registration does not claim a completed payment.

The optional private payment reconciliation script (`server/stripe-payment-sync.gs`) uses a restricted Stripe key stored only in Apps Script properties as `STRIPE_READ_KEY`. It needs read access to Events and Payment Links. After authorizing Google external requests and timer triggers, run `setupStripeSync` once. It verifies all five configured links, then schedules reconciliation every five minutes. Never commit an API key or put it in browser code. Paid status requires a Stripe-confirmed paid session matching the saved reference, ticket, currency and amount.

Other legacy forms have an acknowledged email fallback when their original Sheet receiver is unavailable. That fallback explicitly identifies the archive failure and never claims the Sheet was updated.

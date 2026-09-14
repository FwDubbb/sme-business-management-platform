# App improvements

Updated September 14, 2026.

## Completed: workspace redesign

All seven pages now share a green and warm-white design system with a persistent desktop sidebar, accessible mobile navigation, compact metric strips, searchable tables, contextual actions, and side-panel forms. Login and registration use a matching split layout. Empty, loading, error, and success states use actual application data.

- **Overview:** date-filtered performance, daily sales chart with zero-sales days included, current stock and balance alerts, recent sales, links into relevant workflows, and summary export.
- **Sales:** customer/reference search, payment-status filters, calendar periods, pagination, filtered CSV export, sale details, multiple item entry, automatic catalog prices, and totals.
- **Inventory:** product search, category and stock filters that work together, sorting, product editing, opening stock, atomic stock receipt, reorder levels, zero-price margin handling, and CSV export.
- **Customers:** searchable directory, balance filters, editable contact details, customer profiles, outstanding debts, payment recording, payment history, and CSV export.
- **Expenses:** searchable ledger, status/category/date filters, calendar-based periods, actual expense dates, editable entries, payment-status updates, category creation, and CSV export.
- **Account screens:** matching login and registration, password visibility controls, form labels, loading feedback, safe saved-session parsing, and automatic sign-in redirection after an expired session.
- **Shared foundation:** same-origin API client (optional `VITE_API_URL` override), route-level lazy loading, browser-native dialogs with keyboard focus containment, responsive tables, and a custom favicon.

The previous sale/payment protections remain: transactions roll back related writes on failure, concurrent requests cannot oversell stock or overpay debt, and final payments synchronize sale status and customer balances. The new product/customer/expense writes validate their inputs. Product editing preserves stock; receiving stock adds to the current quantity instead of replacing it.

## Verification

- `npm test`: 16 integration tests pass against a temporary SQLite database. Includes transaction rollback, concurrent sales/payments/deliveries, ownership of payments, product editing, expense dates and updates, and invalid inputs.
- `npm run build`: production build passes without a large-chunk warning after splitting page bundles.
- `node scripts/ui-smoke.mjs`: desktop (1440 px) and mobile (390 px) checks in headless Chrome, using a separate temporary database and browser profile. Verifies product creation/editing/restocking, customer creation, sale entry and price autofill, full payment, expense creation/editing, mobile navigation, panel sizing, pagination, status filters, and a filtered CSV download.
- Review screenshots are in `artifacts/ui/` and contain temporary sample records. That folder is ignored by Git. The browser script uses installed Chrome on Windows; set `CHROME_PATH` to use another compatible executable. Temporary test databases and browser profiles are logged by the script and are separate from business data.

## Remaining priorities

1. **Account permissions:** all registered accounts currently share the same business records. Choose single-business staff membership or separate businesses, then implement access rules and migrate ownership deliberately.
2. **Authentication hardening:** remove the fallback signing secret, validate registration on the server, and add login throttling.
3. **Payments and sales:** add paid-at-checkout sales, a credit-limit policy, receipts, due dates, returns, and server-side idempotency for uncertain network retries. Current nonzero sales are recorded on credit; credit limits are reference values.
4. **Data lifecycle:** add versioned schema migrations, backup/restore, stock adjustment history, and an audit trail. Existing historical inconsistencies have not been reconciled.
5. **Scale:** the interface paginates records locally; add indexed server-side pagination when data volume requires it. Overview metrics currently load the underlying records.
6. **Setup:** supply the missing `server/db/seed.js` referenced by `npm run db:seed` and review older README feature claims and setup requirements.

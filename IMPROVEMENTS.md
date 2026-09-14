# App review and improvement queue

Reviewed the React pages, Express routes, SQLite schema, configuration, and setup documentation on September 13, 2026. Items below come from the repository review; this is not a production security audit.

## Completed in this pass

1. **Make sales and payments consistent.** Sales validate customer/product references, whole positive quantities, two-decimal prices and available stock. Sales and payments use separate SQLite transaction connections, enable foreign keys, and roll back all related writes on failure. Payments must belong to the selected customer, must be positive, and cannot exceed the remaining balance. Final payments update the sale status and refresh customer balances. Calculations use integer cents while preserving the existing database schema. Zero-value sales are paid without a pending debt.
2. **Make the sales workflow usable.** Add/remove item rows, fill prices from the product catalog, show stock and a running total, display request errors, and disable forms while saving. Payments only offer outstanding debts and reset when the selected customer changes. Sales continue to be recorded on credit; immediate-payment checkout remains a separate enhancement.
3. **Restore mobile navigation.** Add an expandable menu, active-page indicators, keyboard-accessible controls, Escape dismissal, and router links that avoid full-page reloads.
4. **Add regression coverage.** `npm test` exercises real HTTP routes against a temporary SQLite database, including rollback, concurrent requests, overselling, invalid input, cross-customer payments, decimal amounts, and final payment status. Database initialization now uses the shared environment configuration and creates its parent directory on first use.

## Recommended next changes, in order

| Priority | Finding and evidence | Improvement |
| --- | --- | --- |
| High | All accounts share every customer, product, sale and expense. `server/db/init.js` has no business ownership fields; routes authenticate but do not enforce roles. Registration is public and defaults to admin. | Decide whether this is one business with invited staff or multiple businesses. Add the matching membership model and permissions, then migrate existing records with explicit ownership. |
| High | `server/middleware/auth.js` and `server/routes/auth.js` accept the fallback JWT secret `secret`. Server registration does not enforce the frontend's password rules. | Require a configured signing secret, validate registration/login input, normalize email addresses, and add login throttling. |
| High | `src/App.jsx` parses saved user JSON without recovery and has no handling for expired sessions. Every page hardcodes `http://localhost:5000/api`. | Add a shared API client with a configurable or relative base URL, session expiry handling, and safe session restoration. The hardcoded hostname prevents normal use from another device. |
| High | Inventory, customer, and expense write routes still accept largely unchecked input. The inventory PATCH route can store negative quantities and reports success for nonexistent products. | Add shared server validation and useful 400/404/409 responses across the remaining routes. |
| Medium | There is no UI for restocking or editing products/customers/expenses. Inventory search stops applying when Low Stock Only is checked; zero-price products produce an invalid margin. | Add restock and edit workflows, combine filters, and handle zero selling prices. Prefer recorded stock adjustments over silently overwriting stock. |
| Medium | Every nonzero sale creates debt. Credit limits are stored but never enforced; no due dates, receipts, returns, or payment history view exist. | Add paid/credit checkout, an explicit credit-limit policy, due dates, receipts and payment history. Add request idempotency before automatically retrying writes. |
| Medium | `src/pages/Expenses.jsx` treats Today as the past 24 hours and This Month as a rolling month. The expense form cannot set the expense date. | Use calendar boundaries, add an expense date input, and define consistent timezone handling in API filters and displays. |
| Medium | Dashboard requests fail silently; empty charts have no explanation; headline totals cover all time while charts cover 30 days. Sales trends omit dates with no sales. | Add visible errors/retry controls and empty states, consistent date filters, zero-filled trends, and clearly separated recorded sales, collected payments and outstanding debts. |
| Medium | Most lists fetch every record and all pages/charts load in one frontend bundle. | Add API pagination and indexed queries as data grows, plus route-level lazy loading to reduce initial download size. |
| Medium | Labels are often not associated with inputs; several screens have no loading/empty states or save confirmation. | Apply accessible labels and consistent feedback to all screens, and check layouts with keyboard navigation and small viewports. |
| Medium | No backup/restore, schema migration history, or audit trail is present. | Add a documented, tested backup/restore flow, versioned schema migrations, and an audit trail for stock and payment changes. |
| Low | `npm run db:seed` points to missing `server/db/seed.js`. README promises bulk management and payment history that the UI does not provide. | Supply an opt-in demo seed command, update setup requirements, and align feature claims with implemented behavior. |

## Verification and limits

- `npm test`: 11 integration tests pass, using only a temporary database. Simulated database failures intentionally log errors during rollback tests.
- Production build: passes; Vite reports an existing large JavaScript bundle warning.
- Browser interaction testing is still needed for the updated forms and responsive menu.
- Existing business records were not migrated or reconciled. Earlier inconsistent balances or stock records may still need repair.
- Button disabling prevents repeated clicks while saving; it does not provide server-side idempotency after a lost network response.
- This pass preserves the shared-business data model and existing credit-limit behavior.

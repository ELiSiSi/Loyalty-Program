# ADR 002: Double-Entry Immutable Points Ledger Architecture

## Status
Accepted

## Context
In loyalty systems, points represent real monetary and commercial liabilities. Direct mutable updates (e.g., `user.points += 50; await user.save()`) suffer from race conditions, lost updates during concurrent requests, and complete lack of an auditable trail for financial reconciliation.

## Decision
We implemented an **Immutable Double-Entry Ledger Pattern** backed by atomic database operations:
1. Every point credit, debit, refund, or expiration is recorded in an immutable `PointsLedger` document with `{ tenantId, userId, type, amount, balanceAfter, referenceType, referenceId, idempotencyKey }`.
2. Redemptions use conditional atomic queries:
   ```typescript
   UserModel.findOneAndUpdate(
     { _id: userId, availablePoints: { $gte: amount } },
     { $inc: { availablePoints: -amount, totalPoints: -amount } },
     { new: true }
   );
   ```
   If the user has insufficient points, the query matches 0 documents and fails atomically, mathematically preventing negative balances.
3. Every mutating transaction supports the `x-idempotency-key` header to prevent duplicate charges or rewards on retries.

## Consequences
- Zero race condition exploits.
- Full mathematical reconciliation between member balances and historical ledger logs.
- Strict prevention of negative point balances.

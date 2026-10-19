# ADR 003: Multi-Tenant Data Isolation Strategy

## Status
Accepted

## Context
As a B2B SaaS platform, the engine serves hundreds or thousands of independent companies (tenants) simultaneously. Data leakage between tenants is unacceptable and violates privacy laws (GDPR, Saudi PDPL).

## Decision
We adopted a **Shared-Database / Logical-Isolation Multi-Tenancy Architecture**:
1. Every domain collection (`users`, `points_ledger`, `offers`, `coupons`, `gifts`, `bookings`, `webhooks`) enforces a mandatory `tenantId` field.
2. Compound indexes (`[tenantId, email]`, `[tenantId, code]`, `[tenantId, createdAt]`) guarantee data separation and query speed.
3. A pre-handler hook (`resolveTenantContext`) extracts tenant context from headers (`x-tenant-id`, `x-tenant-slug`) or subdomain, verifies tenant active status and quota limits, and validates that non-superAdmin users cannot access resources belonging to another tenant (`Cross-tenant violation: 403 Forbidden`).

## Consequences
- Cost-effective resource utilization with scalable operational overhead.
- Total data isolation enforced by middleware security barriers.
- Instant tenant onboarding without provisioning individual database clusters.

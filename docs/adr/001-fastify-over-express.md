# ADR 001: Adoption of Fastify over Express.js

## Status
Accepted

## Context
The legacy application was originally built using Express 5. While Express is widespread, high-scale loyalty platforms (e.g., Noon, Amazon, Starbucks) process high volumes of transaction requests per second at POS checkout counters and during mega-sale promotion campaigns. Express has higher overhead, lacks first-class TypeScript integration, and requires ad-hoc plugins for async pipeline management.

## Decision
We adopted **Fastify 5.x** with TypeScript as the core web framework.

## Consequences
- **Throughput**: Fastify provides up to 4x higher requests per second with lower memory footprint.
- **Type Safety**: Native integration with TypeScript and `@fastify/type-provider-zod`.
- **Plugin Architecture**: Clean encapsulation of routes, middleware hooks (`onRequest`, `preHandler`, `onResponse`), and error boundaries.
- **Built-in Schema Validation & Docs**: Integrated `@fastify/swagger` and `@fastify/swagger-ui` yielding automatic OpenAPI 3.0 documentation.

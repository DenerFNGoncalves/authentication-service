# Auth Service – Plugin Play Architecture

Authentication microservice built with **Node.js, TypeScript and PostgreSQL**, designed as a reusable authentication core for future projects.

This project explores **clean architecture, microservice boundaries, secure authentication flows and scalable infrastructure patterns**, while remaining lightweight enough to serve as a portfolio base.

Instead of embedding authentication logic directly inside applications, this service acts as a **plug-and-play authentication provider** that can be reused across multiple systems.

---

# Architecture Philosophy

This project follows **Hexagonal Architecture (Ports and Adapters)** to isolate business rules from infrastructure concerns.

Goals:

- Business logic must not depend on frameworks
- Infrastructure must be replaceable
- The system must remain testable and modular

src
├─ application
│ ├─ services
│ └─ use-cases
|
├─ bootstrap
│
├─ domain
│ ├─ entities
│ └─ repositories (interfaces)
│
├─ infra
│ ├─ database
| ├─ observability
| ├─ http
│ └─ security
│
└─ index.ts

## Domain

Contains the **core business concepts** and repository contracts.

- No dependency on frameworks
- Pure business logic

---

## Application

Contains **use cases and orchestration logic**.

Examples:

- user authentication
- token refresh
- session validation

---

## Bootstrap

Responsible for **starting the application and wiring dependencies**.

---

## Infrastructure

Implements adapters that interact with external systems:

- PostgreSQL
- HTTP layer
- repository implementations
- security
  - password hashing
  - JWT generation
  - token validation

---

# Authentication Model

The service implements **JWT-based authentication with refresh token rotation**.

---

## Access Token

Short-lived token used for authentication.

Typical lifetime:
15 minutes

Sent in requests using:
Authorization: Bearer <token>

---

## Refresh Token

Long-lived token stored in the database.

Used to generate new access tokens without requiring login again.

Features supported:

- refresh token rotation
- sliding sessions
- absolute session expiration

---

## Token Rotation

When a refresh token is used:

1. The previous token becomes invalid
2. A new refresh token is issued
3. The database record is updated

This mitigates **token replay attacks**.

---

## Sliding Sessions

If enabled, each refresh operation extends the session lifetime.

Example:
Initial expiration: 7 days
User refreshes token on day 5
Expiration extends another 7 days

---

## Absolute Expiration

Defines a **maximum lifetime for a session**, regardless of refresh activity.

Example:
Max session lifetime: 30 days

Even with sliding refresh, the session cannot exceed this limit.

---

# Database

The project uses:

- **PostgreSQL**
- **Drizzle ORM (Object Relational Mapper)**

Drizzle was chosen for:

- type safety
- lightweight design
- SQL-like schema definitions

Example structure:
src/infra/database
├─ schemas
│ ├─ users
│ └─ refreshTokens
│
├─ migrations
└─ connection.ts

---

# Testing Strategy

Testing is a **first-class concern** in this project.
tests
└─ integration
├─ unit
│ ├─ services
│ └─ use-cases

---

## Unit Tests

Focus on **isolated business logic**.

Dependencies are mocked.

Examples:

- authentication services
- password hashing
- token generation

---

## Integration Tests

Validate interactions with real infrastructure.

Tools used:

- **Testcontainers**
- **Docker**

This allows running **real PostgreSQL instances during tests**, ensuring:

- realistic database behavior
- migration validation
- schema integrity testing

---

# Security Considerations

Several authentication security patterns are implemented.

---

## Password Hashing

Passwords are securely hashed before persistence.

Plain text passwords are **never stored**.

---

## Refresh Token Storage

Refresh tokens are stored with metadata:

- userId
- expiration
- rotation tracking
- revocation status

---

## Token Revocation

Sessions can be revoked by:

- invalidating refresh tokens
- marking tokens as revoked

---

# Future Improvements

Planned evolutions include:

## Redis Integration

Using **Redis as a distributed cache** for:

- token validation
- session lookup
- revocation lists

Benefits:

- faster token verification
- improved scalability

---

## Rate Limiting

Protect authentication endpoints against brute-force attacks.

Possible approaches:

- Redis-based rate limiter
- API Gateway policies

---

## External Identity Providers

Integration with identity providers such as:

- OAuth providers
- enterprise identity systems

---

# Running the Project

## Requirements

- Node.js
- Docker
- PostgreSQL

---

## Install dependencies

```bash
npm install
```

## Environment variables

Use the example file as the starting point for local configuration:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then adjust the values in `.env`, especially `DATABASE_URL` and `JWT_ACCESS_SECRET`, before starting the service.

## Scripts folder

The `scripts/` folder contains small automation utilities used to keep operational tasks consistent across environments. Instead of relying on manual commands, these scripts centralize repetitive project actions and reduce naming mistakes.

At the moment, `scripts/generate-migration.cjs` is used by `npm run db:generate` to create Drizzle migrations with a UTC timestamp in the file name, which helps keep migration history ordered and easier to identify.

Main database commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

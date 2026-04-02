# Auth Service

Authentication microservice built with **Node.js**, **TypeScript**, **Express**, **PostgreSQL** and **Drizzle ORM**, designed around **Hexagonal Architecture**.

The goal of this project is to keep authentication rules isolated from frameworks and infrastructure details, so the service can evolve with clear boundaries between domain, application, and adapters.

## Architecture

The codebase is organized around ports and adapters:

```bash
src
├─ application
│  ├─ dtos
│  ├─ ports
│  ├─ services
│  └─ use-cases
├─ bootstrap
├─ domain
│  ├─ entities
│  ├─ repositories
│  └─ value-objects
├─ infra
│  ├─ config
│  ├─ db
│  ├─ http
│  ├─ observability
│  ├─ security
│  └─ validation
└─ index.ts
```

### Layers

- `domain`: core concepts, repository contracts and value objects
- `application`: use cases, services, DTOs and ports
- `infra`: HTTP controllers, database adapters, config, validation and security integrations
- `bootstrap`: dependency wiring and application composition

### DTO Boundaries

DTOs are intentionally different across `application` and `infra`.

- `infra` DTOs represent external input and output formats such as HTTP payloads, route params, headers, environment variables, or persistence shapes
- `application` DTOs represent internal contracts used by use cases and services

This separation keeps transport and framework details out of the application layer and makes normalization, validation, and mapping explicit at the system boundary.

## Authentication Model

The service uses:

- short-lived JWT access tokens
- refresh token rotation
- sliding sessions
- optional absolute session expiration

This allows login flows to remain stateless on the access-token side while keeping session control and revocation in the database.

## Audit Trail

User actions can be recorded in a dedicated audit database.

- each event stores actor, subject, occurrence time and optional metadata
- request context data such as `requestId`, `ipAddress` and `userAgent` can be attached when available
- audit persistence is treated as non-blocking

This keeps observability and compliance data available without turning the audit subsystem into a single point of failure for authentication.

## Value Objects

The domain uses explicit **value objects** to improve invariants and type safety.

### Email

`Email` is a branded string that:

- trims input
- normalizes to lowercase
- validates format before creation

This keeps email normalization out of random parts of the code and guarantees that application services and repositories work with a validated domain value instead of a raw string.

### Time

`Time` provides branded units such as:

- `Minutes`
- `Days`
- `Milliseconds`

It also exposes conversion helpers, making session and token expiration rules more explicit and less error-prone.

## Validation with Zod

The project uses **Zod** for environment configuration validation.

### Environment validation

Environment configuration is validated through schemas in:

- [`src/infra/config/env.validation.ts`](src/infra/config/env.validation.ts)
- [`src/infra/config/env.ts`](src/infra/config/env.ts)

This improves startup safety by parsing and validating server and security configuration before the application finishes booting.

## HTTP Layer Improvements

The HTTP layer follows a controller-based boundary.

- routes remain responsible for endpoint registration
- controllers adapt HTTP requests to application DTOs
- middlewares keep cross-cutting concerns such as auth and request context

That makes request normalization and validation easier to test and easier to keep per-route.

## Database

The project uses:

- **PostgreSQL**
- **Drizzle ORM**

Database access is implemented through repository adapters under `src/infra/db/drizzle`, while repository contracts stay in the domain layer.

The project currently maintains separate Drizzle adapters for:

- the authentication database
- the audit database

## Testing

Testing is split into:

- **unit tests** for services, use cases and security helpers
- **integration tests** for database adapters and authentication flows

The project uses **Jest** and **Testcontainers** to run integration tests against a real PostgreSQL instance.

Audit-related coverage also verifies that authentication remains available even if audit event recording fails.

## Tooling and Code Quality

The project uses standardized formatting and linting rules.

- **ESLint** for lint rules
- **Prettier** for formatting
- shared formatting settings in [`formatting.config.mjs`](formatting.config.mjs)
- convenience scripts for linting and formatting

Available scripts:

```bash
npm run build
npm run build:tests
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run fix
```

## Running the Project

### Requirements

- Node.js
- Docker
- PostgreSQL

### Install dependencies

```bash
npm install
```

### Environment variables

Use the example file as a starting point:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Then adjust the variables in `.env` before starting the service.

### Database commands

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

### Development

```bash
npm run dev
```

`npm run build` emits the application to `/build`.

`npm run build:tests` emits test artifacts to `/build-tests`.

### Tests

```bash
npm test
npm run test:u
npm run test:i
```

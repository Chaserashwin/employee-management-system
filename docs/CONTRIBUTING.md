# Contributing Guide

Thank you for improving the Employee Management System. This repository is structured as a full-stack TypeScript npm workspace with separate frontend and backend applications.

## Development Principles

- Keep changes scoped to the feature or bug being addressed.
- Preserve the existing route, controller, service, repository, and model boundaries.
- Validate user input on both frontend and backend when possible.
- Enforce permissions on the backend even if the frontend hides UI controls.
- Prefer existing components, hooks, services, and utilities before adding new abstractions.
- Update documentation when behavior changes.

## Getting Started

Install dependencies:

```bash
npm install
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Run both applications:

```bash
npm run dev
```

Run backend only:

```bash
npm run backend
```

Run frontend only:

```bash
npm run frontend
```

## Branch Naming

Suggested branch names:

```text
feature/<short-description>
fix/<short-description>
docs/<short-description>
chore/<short-description>
```

Examples:

```text
feature/audit-log
fix/manager-cycle-check
docs/api-examples
```

## Code Style

The project uses:

- TypeScript
- ESLint
- Prettier
- Tailwind CSS
- Feature-oriented frontend modules
- Layered backend modules

Run lint:

```bash
npm run lint
```

Run build:

```bash
npm run build
```

Run tests:

```bash
npm run test
```

## Backend Guidelines

Backend folders:

```text
backend/src/routes
backend/src/controllers
backend/src/services
backend/src/repositories
backend/src/models
backend/src/validators
backend/src/middlewares
backend/src/types
backend/src/utils
```

Guidelines:

- Define endpoint middleware in route files.
- Keep request/response orchestration in controllers.
- Put business rules in services.
- Put Mongoose query construction in repositories.
- Put request validation in validators.
- Put schema changes in models.
- Use `AppError` for operational errors.
- Return responses through `createSuccessResponse`.
- Do not rely on frontend checks for security.

## Frontend Guidelines

Frontend folders:

```text
frontend/src/app
frontend/src/features
frontend/src/services
frontend/src/providers
frontend/src/components
frontend/src/hooks
frontend/src/types
frontend/src/utils
```

Guidelines:

- Keep route files thin and delegate UI to feature components.
- Use existing UI primitives from `frontend/src/components/ui`.
- Use service files for API calls.
- Use React Query hooks for server state.
- Keep role checks in `RoleGate` and the app shell where possible.
- Maintain responsive layouts for mobile and desktop.
- Keep dark mode compatible with CSS variables.

## Documentation Guidelines

Update documentation when:

- API routes change.
- Request or response contracts change.
- Models or indexes change.
- RBAC changes.
- Environment variables change.
- Deployment steps change.
- Features are added, removed, or renamed.

Documentation files:

```text
README.md
docs/API.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/FEATURES.md
docs/DEPLOYMENT.md
docs/SECURITY.md
docs/TESTING.md
docs/ASSIGNMENT-CHECKLIST.md
docs/SCREENSHOTS.md
docs/CHANGELOG.md
```

## Pull Request Checklist

- [ ] Change is scoped and understandable.
- [ ] Existing behavior is preserved unless intentionally changed.
- [ ] Backend validation is updated for new request fields.
- [ ] Backend permissions are updated for new protected behavior.
- [ ] Frontend role visibility matches backend authorization.
- [ ] Tests were added or updated for meaningful behavior changes.
- [ ] `npm run lint` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] Documentation is updated.
- [ ] Screenshots are updated if UI changed.

## Reporting Issues

When reporting an issue, include:

- Environment: local, Vercel, Render, or other.
- Role used: `SUPER_ADMIN`, `HR`, or `EMPLOYEE`.
- Steps to reproduce.
- Expected behavior.
- Actual behavior.
- Browser and viewport if UI-related.
- API endpoint and payload if backend-related.
- Relevant console or server logs with secrets removed.

## Security Reports

Do not publish secrets, JWTs, MongoDB URIs, passwords, or user data in public issues. Report security-sensitive findings privately to the repository owner.

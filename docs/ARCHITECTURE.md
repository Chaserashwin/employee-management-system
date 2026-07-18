# Architecture

This document describes the implemented system architecture based on the current codebase.

## System Architecture

The project is an npm workspace with two deployable applications:

- `frontend`: Next.js 15 App Router application running on port `4000`.
- `backend`: Express TypeScript API running on port `5001`.

MongoDB stores users, employee records, hierarchy relationships, soft-delete metadata, and counters.

```mermaid
flowchart LR
  User["Browser User"] --> Frontend["Next.js Frontend"]
  Frontend --> ApiClient["Axios API Client"]
  ApiClient --> Backend["Express API"]
  Backend --> AuthMiddleware["Auth and RBAC Middleware"]
  AuthMiddleware --> Controllers["Controllers"]
  Controllers --> Services["Services"]
  Services --> Repositories["Repositories"]
  Repositories --> MongoDB["MongoDB"]
  Backend --> Uploads["Local Uploads Directory"]
```

## Frontend Architecture

The frontend uses a feature-oriented App Router structure:

- `frontend/src/app`: route groups, layouts, loading and error boundaries.
- `frontend/src/features`: dashboard, employees, organization, profile, search, settings.
- `frontend/src/services`: API service wrappers around Axios.
- `frontend/src/providers`: auth, React Query, theme, navigation progress.
- `frontend/src/components`: layout, common components, and UI primitives.
- `frontend/src/types`: shared frontend TypeScript contracts.

```mermaid
flowchart TD
  AppRouter["Next.js App Router"] --> ProtectedLayout["Protected Layout"]
  ProtectedLayout --> ProtectedRoute["Protected Route"]
  ProtectedRoute --> AppShell["Role-aware App Shell"]
  AppShell --> FeaturePages["Feature Pages"]
  FeaturePages --> ReactQuery["TanStack React Query Hooks"]
  ReactQuery --> Services["Frontend Services"]
  Services --> AxiosClient["Axios Client with JWT Interceptor"]
  AxiosClient --> BackendApi["Express REST API"]
```

Frontend route coverage:

| Route                    | Component                  | Role Access             |
| ------------------------ | -------------------------- | ----------------------- |
| `/login`                 | Login page                 | public                  |
| `/`                      | Dashboard redirect surface | `SUPER_ADMIN`, `HR`     |
| `/dashboard`             | Dashboard page             | `SUPER_ADMIN`, `HR`     |
| `/employees`             | Employee list              | `SUPER_ADMIN`, `HR`     |
| `/employees/new`         | Create employee            | `SUPER_ADMIN`, `HR`     |
| `/employees/:id`         | Employee details           | `SUPER_ADMIN`, `HR`     |
| `/employees/:id/edit`    | Edit employee              | `SUPER_ADMIN`, `HR`     |
| `/employees/recycle-bin` | Recycle bin                | `SUPER_ADMIN`           |
| `/organization`          | Organization tree          | `SUPER_ADMIN`, `HR`     |
| `/profile`               | Current profile            | all authenticated roles |
| `/settings`              | Account and theme settings | all authenticated roles |

## Backend Architecture

The backend follows route, controller, service, repository, model, validator, and middleware boundaries.

```mermaid
flowchart TD
  ExpressApp["app.ts"] --> Routes["Route Modules"]
  Routes --> Auth["authenticate and authorize"]
  Routes --> Validators["Zod Validators"]
  Routes --> Uploads["Multer Upload Middleware"]
  Routes --> Controllers["Controllers"]
  Controllers --> Services["Domain Services"]
  Services --> Repositories["Repository Functions"]
  Repositories --> Models["Mongoose Models"]
  Models --> MongoDB["MongoDB"]
  Controllers --> ResponseUtils["Response Helpers"]
  ExpressApp --> ErrorHandler["Central Error Handler"]
```

Backend modules:

| Layer        | Responsibility                                                                         |
| ------------ | -------------------------------------------------------------------------------------- |
| Routes       | Express route registration, middleware ordering, and endpoint-level permissions        |
| Controllers  | Request extraction, response status, success message selection                         |
| Services     | Business rules, RBAC refinements, hierarchy logic, import validation, response mapping |
| Repositories | Mongoose query construction, filtering, sorting, pagination, mutations                 |
| Models       | MongoDB collection schemas, indexes, transforms, password hashing hooks                |
| Validators   | Zod request validation for body, query, and params                                     |
| Middlewares  | JWT auth, permission checks, validation bridge, uploads, not found, errors             |

## Database Architecture

MongoDB collections:

- `users`: login identities and roles.
- `employees`: employee profile records, hierarchy links, soft-delete state.
- `counters`: sequential employee ID generation support.

```mermaid
erDiagram
  USER {
    ObjectId id
    string name
    string email
    string password
    string role
    string status
    date createdAt
    date updatedAt
  }

  EMPLOYEE {
    ObjectId id
    string employeeId
    string name
    string email
    string phone
    string department
    string designation
    number salary
    date joiningDate
    string status
    string role
    ObjectId manager
    string profileImage
    boolean deleted
    boolean isDeleted
    date deletedAt
    ObjectId deletedBy
    date createdAt
    date updatedAt
  }

  COUNTER {
    string id
    number seq
  }

  EMPLOYEE ||--o{ EMPLOYEE : manages
  USER ||--o{ EMPLOYEE : deletedBy
```

## Authentication Flow

```mermaid
sequenceDiagram
  participant Browser
  participant Frontend
  participant Backend
  participant MongoDB

  Browser->>Frontend: Submit email and password
  Frontend->>Backend: POST /api/auth/login
  Backend->>MongoDB: Find user by email with password selected
  MongoDB-->>Backend: User document
  Backend->>Backend: Compare bcrypt password and sign JWT
  Backend-->>Frontend: Token and safe user
  Frontend->>Frontend: Store token in localStorage
  Frontend-->>Browser: Navigate by role
```

Role-based post-login navigation:

- `EMPLOYEE` goes to `/profile`.
- `SUPER_ADMIN` and `HR` go to `/dashboard`.

## RBAC Flow

```mermaid
flowchart TD
  Request["Incoming Request"] --> HasBearer{"Bearer Token Present?"}
  HasBearer -- No --> Unauthorized["401 Unauthorized"]
  HasBearer -- Yes --> VerifyJwt["Verify JWT"]
  VerifyJwt --> LoadUser["Load User by Token ID"]
  LoadUser --> ActiveUser{"User Active?"}
  ActiveUser -- No --> Forbidden["403 Forbidden"]
  ActiveUser -- Yes --> PermissionCheck["Check Permission Map"]
  PermissionCheck --> Allowed{"Allowed?"}
  Allowed -- No --> Forbidden
  Allowed -- Yes --> Controller["Controller Executes"]
```

Backend permissions are centralized in `backend/src/constants/permissions.ts`. Frontend visibility is enforced with `RoleGate` and role-filtered navigation, but backend middleware is the final source of authorization.

## Employee CRUD Flow

```mermaid
sequenceDiagram
  participant UI as Employee UI
  participant API as Express API
  participant Service as Employee Service
  participant Repo as Employee Repository
  participant DB as MongoDB

  UI->>API: Create, read, update, status, role, or manager request
  API->>API: Authenticate and authorize
  API->>API: Validate body, params, query, and files
  API->>Service: Execute business operation
  Service->>Service: Apply role-specific rules
  Service->>Repo: Query or mutate employees
  Repo->>DB: Mongoose operation
  DB-->>Repo: Employee document
  Repo-->>Service: Document
  Service-->>API: Employee DTO
  API-->>UI: Standard API response
```

Key CRUD rules:

- `SUPER_ADMIN` can create, update, soft delete, restore, permanently delete, change status, change roles, and assign managers.
- `HR` can create and update employees but cannot modify `SUPER_ADMIN` accounts, change roles, or assign managers through the standard update payload.
- `EMPLOYEE` cannot access the employee list and can only access their own profile and chain.

## CSV Import Flow

```mermaid
flowchart TD
  Upload["Upload CSV"] --> Multer["Multer Memory Upload"]
  Multer --> Parse["Parse CSV Rows"]
  Parse --> Headers{"Required Headers Present?"}
  Headers -- No --> Error["400 Validation Error"]
  Headers -- Yes --> ValidateRows["Validate Required Fields and Types"]
  ValidateRows --> DuplicateChecks["Check CSV and Database Duplicates"]
  DuplicateChecks --> ManagerChecks["Validate Manager References"]
  ManagerChecks --> CycleChecks["Detect Circular Reporting"]
  CycleChecks --> PreviewOrImport{"Preview or Import?"}
  PreviewOrImport -- Preview --> ReturnPreview["Return Row Summary"]
  PreviewOrImport -- Import --> CreateValid["Create Valid Rows Only"]
  CreateValid --> AssignManagers["Connect Manager Relationships"]
  AssignManagers --> ReturnImport["Return Summary and Imported Employees"]
```

CSV import implementation:

- Template headers are defined in `backend/src/constants/employee-csv.ts`.
- CSV parser and import logic are implemented in `backend/src/services/employee-import.service.ts`.
- Header contract and date parser coverage exists in `backend/tests/employee-csv-contract.test.cjs`.

## Soft Delete Flow

```mermaid
flowchart TD
  DeleteAction["Delete Employee"] --> SoftDelete["Set deleted and isDeleted true"]
  SoftDelete --> Metadata["Set deletedAt and deletedBy"]
  Metadata --> Hidden["Hide from Active Lists and Hierarchy"]
  Hidden --> RecycleBin["Show in Recycle Bin"]
  RecycleBin --> RestoreOrHardDelete{"Restore or Permanent Delete?"}
  RestoreOrHardDelete -- Restore --> ClearFlags["Clear deleted flags and metadata"]
  RestoreOrHardDelete -- Permanent Delete --> RemoveDoc["Delete MongoDB Document"]
```

The implementation uses both `deleted` and `isDeleted` flags for compatibility. Active queries exclude records where either flag is true. Deleted queries match either flag.

## Organization Hierarchy Flow

```mermaid
flowchart TD
  FetchAll["Fetch Active Employees"] --> BuildMap["Build Employee Map"]
  BuildMap --> ChildrenMap["Group Employees by Manager ID"]
  ChildrenMap --> Roots["Find ROOT Employees"]
  Roots --> RecursiveNodes["Build Recursive Tree Nodes"]
  RecursiveNodes --> UI["Render Expandable Organization Tree"]
```

Hierarchy-related backend capabilities:

- Full tree: `GET /api/organization/tree`
- Reportees: `GET /api/employees/:id/reportees`
- Direct reports: `GET /api/employees/:id/direct-reports`
- Chain: `GET /api/employees/:id/chain`
- Manager candidates: `GET /api/employees/:id/manager-candidates`

Manager assignment prevents:

- Self assignment
- Duplicate assignment
- Inactive or deleted managers
- Circular reporting
- Descendant assignment as manager

## Deployment Flow

```mermaid
flowchart LR
  Repo["Repository"] --> Vercel["Vercel Frontend Build"]
  Repo --> Render["Render Backend Build"]
  Vercel --> Browser["User Browser"]
  Browser --> Render
  Render --> Atlas["MongoDB Atlas"]
  Render --> UploadDir["Render Local Upload Directory"]
```

Deployment files:

- `vercel.json`: Next.js frontend build and dev commands.
- `render.yaml`: Render web service, build command, start command, and backend env vars.
- `frontend/.env.example`: `NEXT_PUBLIC_API_URL`.
- `backend/.env.example`: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, `CORS_ORIGIN`.

## Cross-Cutting Concerns

| Concern              | Implementation                                                           |
| -------------------- | ------------------------------------------------------------------------ |
| Security headers     | `helmet()` in `backend/src/app.ts`                                       |
| CORS                 | `cors()` with `CORS_ORIGIN` parsing                                      |
| Compression          | `compression()`                                                          |
| Request logging      | `morgan()`                                                               |
| JSON limit           | `express.json({ limit: "1mb" })`                                         |
| Static uploads       | `/uploads` with immutable cache headers and cross-origin resource policy |
| Error handling       | Central `errorHandler` with production-safe error output                 |
| Client caching       | TanStack React Query with stale time and limited retries                 |
| Client auth recovery | Axios `401` interceptor clears token and redirects to login              |

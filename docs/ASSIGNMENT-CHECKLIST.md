# Assignment Checklist

This checklist maps the hiring assignment requirements to the verified implementation.

## Core Requirements

| Requirement               | Status   | Implementation                                                                                   |
| ------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| Authentication            | Complete | JWT login through `/api/auth/login`, current user through `/api/auth/me`, frontend auth provider |
| Role Based Access Control | Complete | Permission map, `authenticate`, `authorize`, `RoleGate`, role-aware navigation                   |
| Dashboard                 | Complete | Dashboard API and Recharts dashboard page                                                        |
| Employee CRUD             | Complete | Create, list, detail, edit, status update, role update, manager update, soft delete              |
| Organization Hierarchy    | Complete | Recursive organization tree, reporting chain, reportees, direct reports                          |
| Validation                | Complete | Zod backend validators, frontend form validation, CSV row validation                             |
| Pagination                | Complete | Active employee and recycle-bin list pagination                                                  |
| Search                    | Complete | Employee list search and global search                                                           |
| Filtering                 | Complete | Department, role, and status filters                                                             |
| Sorting                   | Complete | Joining date and name sorting with ascending/descending order                                    |
| CSV Import                | Complete | Template download, preview, validation, valid-row import                                         |
| Soft Delete               | Complete | Soft delete flags, deleted metadata, active/deleted filters                                      |
| Restore                   | Complete | Single and bulk restore                                                                          |
| Permanent Delete          | Complete | Single and bulk hard delete from recycle bin                                                     |
| Deployment                | Complete | Vercel config, Render config, MongoDB env support                                                |

## Feature Mapping

### Authentication

- Implemented in `backend/src/routes/auth.routes.ts`.
- Login validates email and password.
- Passwords are compared with bcrypt.
- JWT tokens are signed with `JWT_SECRET`.
- Frontend persists JWT in localStorage.
- Axios attaches the token to protected requests.
- Invalid sessions redirect to `/login`.

### RBAC

- `SUPER_ADMIN` has all permissions.
- `HR` has dashboard, employee create/update/list, manager assignment, hierarchy, search, and own update permissions.
- `EMPLOYEE` has own profile and own hierarchy permissions.
- Backend permissions are enforced by middleware.
- Frontend pages are protected by role gates.

### Dashboard

- Dashboard cards are aggregated from MongoDB.
- Charts are built from backend aggregation results.
- Recent employees are sorted by joining date and creation date.
- Quick actions link to major workflows.

### Employee CRUD

- Create and update support profile image upload.
- List supports search, filters, sorting, and pagination.
- Detail page shows profile, reporting chain, direct reports, role/status controls, and manager assignment.
- Delete is soft delete for `SUPER_ADMIN`.
- HR cannot modify `SUPER_ADMIN` accounts.

### Organization Hierarchy

- Employees reference managers through a self-referencing ObjectId.
- Tree is built recursively from active employees.
- Manager assignment excludes invalid and cyclic candidates.
- Profile and detail pages show reporting chains.

### CSV Import

- CSV template uses canonical headers.
- Preview returns row-level validation.
- Import creates only valid rows.
- Manager relationships can reference existing employees or rows in the same CSV.
- CSV date parser supports deterministic date formats and Excel serial dates.
- CSV contract has backend tests.

### Soft Delete and Recycle Bin

- Soft delete sets `deleted`, `isDeleted`, `deletedAt`, and `deletedBy`.
- Active lists exclude deleted employees.
- Recycle Bin lists deleted employees.
- Restore clears deletion flags and metadata.
- Permanent delete removes deleted employee documents.

### Deployment

- Frontend deployment is configured in `vercel.json`.
- Backend deployment is configured in `render.yaml`.
- Backend requires MongoDB URI and JWT secret in production.
- Frontend uses `NEXT_PUBLIC_API_URL` to reach the backend.
- Backend CORS uses `CORS_ORIGIN`.

## Bonus Features

| Bonus Feature            | Status   | Notes                                                   |
| ------------------------ | -------- | ------------------------------------------------------- |
| Dark mode                | Complete | Header toggle and settings selector                     |
| Responsive UI            | Complete | Mobile sidebar, mobile employee cards, responsive grids |
| Charts                   | Complete | Recharts bar, pie, and line charts                      |
| CSV validation preview   | Complete | Preview before import                                   |
| Bulk recycle-bin actions | Complete | Bulk restore and permanent delete                       |
| Manager cycle prevention | Complete | Runtime assignment and CSV import validation            |
| Global search            | Complete | Header search for privileged roles                      |
| Seed data                | Complete | Default users plus 120 employees                        |
| Deployment configs       | Complete | Vercel and Render files                                 |

## Verification Notes

- The current repository does not include a committed production frontend URL.
- The provided screenshots are stored in `/screenshots`.
- No mobile or CSV import dialog screenshot was provided in the attachment set, but responsive and CSV import behavior is implemented in code.
- Password-change UI is disabled and is not documented as an implemented password-change feature.

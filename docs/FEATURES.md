# Feature Documentation

This document explains the implemented features verified from the backend and frontend source code.

## Authentication

Users sign in with email and password through `/login`.

Implementation:

- Frontend login form: `frontend/src/app/(public)/login/page.tsx`
- Auth provider and session state: `frontend/src/providers/auth-provider.tsx`
- Backend auth routes: `backend/src/routes/auth.routes.ts`
- Auth service: `backend/src/services/auth.service.ts`
- JWT utility: `backend/src/utils/jwt.ts`
- User model password hashing: `backend/src/models/user.model.ts`

Behavior:

- Email is validated and normalized to lowercase.
- Password is required.
- Backend loads the user with password selected.
- Password is compared with bcrypt.
- Inactive users are rejected.
- Successful login returns a JWT and a safe user object.
- Frontend stores the JWT in `localStorage` under `ems.auth.token`.
- Axios attaches the JWT to API requests.
- A `401` response clears the token and redirects to `/login`.
- Logout clears local state and calls `/api/auth/logout`.

Post-login routing:

- `EMPLOYEE` users go to `/profile`.
- `SUPER_ADMIN` and `HR` users go to `/dashboard`.

## Authorization

The project implements backend permissions and frontend role gates.

Backend implementation:

- `backend/src/constants/permissions.ts`
- `backend/src/middlewares/auth.middleware.ts`

Frontend implementation:

- `frontend/src/components/layout/role-gate.tsx`
- `frontend/src/components/layout/protected-route.tsx`
- `frontend/src/components/layout/app-shell.tsx`

Role access:

| Feature             | `SUPER_ADMIN` | `HR`                                                        | `EMPLOYEE` |
| ------------------- | ------------- | ----------------------------------------------------------- | ---------- |
| Dashboard           | Yes           | Yes                                                         | No         |
| Employee list       | Yes           | Yes                                                         | No         |
| Create employee     | Yes           | Yes, employee role only                                     | No         |
| Edit employee       | Yes           | Yes, except `SUPER_ADMIN` accounts and role/manager changes | No         |
| Delete employee     | Yes           | No                                                          | No         |
| Recycle bin         | Yes           | No                                                          | No         |
| Restore employee    | Yes           | No                                                          | No         |
| Permanent delete    | Yes           | No                                                          | No         |
| Change role         | Yes           | No                                                          | No         |
| Assign manager      | Yes           | Yes, except `SUPER_ADMIN` accounts                          | No         |
| Organization tree   | Yes           | Yes                                                         | No         |
| Own profile         | Yes           | Yes                                                         | Yes        |
| Settings            | Yes           | Yes                                                         | Yes        |
| Own reporting chain | Yes           | Yes                                                         | Yes        |

## Dashboard

Route: `/dashboard`

Backend endpoint: `GET /api/dashboard`

Implementation:

- `backend/src/services/dashboard.service.ts`
- `backend/src/repositories/dashboard.repository.ts`
- `frontend/src/features/dashboard/components/dashboard-page.tsx`
- `frontend/src/features/dashboard/components/dashboard-chart.tsx`

Dashboard cards:

- Total employees
- Active employees
- Inactive employees
- Departments
- Managers
- Recent hires

Charts:

- Department distribution
- Employees by role
- Monthly joining trend
- Employee status

Additional dashboard features:

- Recent employee list
- Quick actions to add employee, open employee list, open organization tree, and open profile
- Responsive dashboard grid
- Recharts bar, pie, and line charts

## Employee CRUD

Routes:

- `/employees`
- `/employees/new`
- `/employees/:id`
- `/employees/:id/edit`

Backend endpoints:

- `GET /api/employees`
- `GET /api/employees/:id`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `PATCH /api/employees/:id/status`
- `PATCH /api/employees/:id/role`
- `PATCH /api/employees/:id/manager`
- `DELETE /api/employees/:id`

Implementation:

- Employee routes: `backend/src/routes/employee.routes.ts`
- Employee service: `backend/src/services/employee.service.ts`
- Employee repository: `backend/src/repositories/employee.repository.ts`
- Employee form: `frontend/src/features/employees/components/employee-form.tsx`
- Employee table: `frontend/src/features/employees/components/employee-table.tsx`
- Employee details: `frontend/src/features/employees/components/employee-detail.tsx`

Supported fields:

- Name
- Email
- Phone
- Department
- Designation
- Salary
- Joining date
- Status
- Role
- Manager
- Profile image

Profile images:

- Uploaded with `profileImage`.
- Stored under `uploads/employees`.
- Accepts JPG, PNG, and WebP.
- Max size is 2 MB.
- Existing profile image can be removed through `removeProfileImage`.

Important rules:

- `SUPER_ADMIN` can manage all employee operations.
- `HR` can create employees only with role `EMPLOYEE`.
- `HR` cannot modify `SUPER_ADMIN` accounts.
- `HR` cannot change roles.
- `HR` cannot assign managers through the general update payload.
- `SUPER_ADMIN` cannot downgrade their own role.

## Search

Search is implemented in two places.

Employee list search:

- Uses `GET /api/employees?search=<value>`.
- Searches name, email, employee ID, and department.
- Applies along with filters, sorting, and pagination.

Global search:

- Uses `GET /api/search?q=<value>`.
- Available to `SUPER_ADMIN` and `HR`.
- Searches active employees by name, email, employee ID, and department.
- Limits results to 8 employees.
- Displayed in the app shell global search box.

Implementation:

- `backend/src/repositories/employee.repository.ts`
- `backend/src/routes/search.routes.ts`
- `frontend/src/features/search`

## Filters

Employee list and recycle-bin filters:

- Department
- Role
- Status

Backend validation:

- Department is optional and matched case-insensitively.
- Role must be `SUPER_ADMIN`, `HR`, or `EMPLOYEE`.
- Status must be `ACTIVE` or `INACTIVE`.

Frontend implementation:

- `frontend/src/features/employees/components/employee-list-page.tsx`
- `frontend/src/features/employees/components/employee-recycle-bin-page.tsx`

## Sorting

Supported sort fields:

- `joiningDate`
- `name`

Supported sort order:

- `asc`
- `desc`

Repository sorting includes `_id` as a secondary sort key for stable ordering.

Implementation:

- `EMPLOYEE_SORT_FIELDS` and `EMPLOYEE_SORT_ORDERS`
- `findEmployeesByListFilter`

## Pagination

Employee list and recycle bin support:

- `page`
- `limit`
- `hasNext`
- `hasPrevious`
- `totalItems`
- `totalPages`
- Legacy-compatible `pagination` object

Frontend controls:

- Page size selector: `10`, `25`, `50`, `100`
- Previous and Next buttons
- Total record and current page display

Backend validation limits `limit` to a maximum of `100`.

## Recycle Bin

Route: `/employees/recycle-bin`

Backend endpoints:

- `GET /api/employees/recycle-bin`
- `PATCH /api/employees/:id/restore`
- `PATCH /api/employees/recycle-bin/restore`
- `DELETE /api/employees/recycle-bin/:id`
- `DELETE /api/employees/recycle-bin`

Implementation:

- `frontend/src/features/employees/components/employee-recycle-bin-page.tsx`
- `backend/src/repositories/employee.repository.ts`

Capabilities:

- View deleted employees.
- Search, filter, sort, and paginate deleted records.
- Select multiple rows.
- Restore one employee.
- Restore selected employees.
- Permanently delete one employee.
- Permanently delete selected employees.

Access:

- Only `SUPER_ADMIN`.

## Soft Delete

Soft delete keeps the employee document but removes it from active workflows.

Soft-delete fields:

- `deleted`
- `isDeleted`
- `deletedAt`
- `deletedBy`

Active employee queries exclude records where `deleted` or `isDeleted` is true.

Deleted employee queries match records where either flag is true.

## CSV Import

CSV import is available from the Employee List page.

Backend endpoints:

- `GET /api/employees/import/template`
- `POST /api/employees/import/preview`
- `POST /api/employees/import`

Frontend implementation:

- `frontend/src/features/employees/components/employee-import-dialog.tsx`

Workflow:

1. Download template.
2. Upload CSV.
3. Preview validation results.
4. Review row-level errors.
5. Import valid rows.

CSV template headers:

```csv
Employee ID,Name,Email,Phone,Department,Designation,Salary,Joining Date,Status,Role,Manager,Profile Image
```

Validation includes:

- Required headers
- Required values
- Duplicate employee ID and email inside the CSV
- Duplicate employee ID and email already in MongoDB
- Email format
- Phone format
- Department enum
- Designation enum
- Status enum
- Role enum
- HR role restrictions
- Non-negative salary
- Supported date parsing
- Manager reference validation
- Active and non-deleted manager checks
- Circular reporting detection inside CSV rows

Import behavior:

- Preview does not write to MongoDB.
- Import revalidates the file.
- Only valid rows are created.
- Manager relationships are connected after valid rows are inserted.
- Invalid and duplicate rows are skipped.

## Organization Tree

Route: `/organization`

Backend endpoint:

- `GET /api/organization/tree`

Implementation:

- `backend/src/services/employee.service.ts`
- `frontend/src/features/organization/components/organization-page.tsx`
- `frontend/src/features/organization/components/organization-tree-node.tsx`

Features:

- Recursive reporting tree.
- Expandable node UI.
- Selected employee details panel.
- Manager status badge.
- Direct reportee count.
- Active employees only.

The backend builds the tree by loading active employees, grouping them by manager ID, and recursively constructing `OrganizationTreeNode` objects.

## Manager Assignment

Manager assignment is available from the employee detail page.

Backend endpoints:

- `GET /api/employees/:id/manager-candidates`
- `PATCH /api/employees/:id/manager`

Frontend component:

- `frontend/src/features/employees/components/manager-assignment-dialog.tsx`

Validation and protections:

- Manager must be active.
- Manager must not be deleted.
- Employee cannot be assigned as their own manager.
- Existing current manager is excluded from candidates.
- Descendants are excluded from candidates.
- Circular reporting is rejected.
- Manager can be cleared when one is already assigned.

## Reporting Chain and Direct Reports

Backend endpoints:

- `GET /api/employees/:id/chain`
- `GET /api/employees/:id/direct-reports`
- `GET /api/employees/:id/reportees`

Frontend usage:

- Profile page shows the authenticated user's reporting chain.
- Employee detail page shows reporting chain and direct report count/list.

Access:

- `SUPER_ADMIN` and `HR` can view hierarchy data for employees.
- `EMPLOYEE` can view only their own chain.

## Profile

Route: `/profile`

Backend endpoints:

- `GET /api/employees/me`
- `PATCH /api/employees/me`
- `GET /api/employees/:id/chain`

Frontend implementation:

- `frontend/src/features/profile/components/profile-page.tsx`

Displayed profile details:

- Employee ID
- Email
- Phone
- Department
- Designation
- Manager
- Joining date
- Salary
- Role badge
- Status badge
- Reporting chain

Profile update support:

- Backend own-profile update service permits `phone` and `profileImage`.
- The current profile page displays details and a disabled password panel; no password-change API is implemented.

## Settings

Route: `/settings`

Frontend implementation:

- `frontend/src/features/settings/components/settings-page.tsx`

Settings include:

- Theme selector: `system`, `light`, `dark`
- Account summary: name, email, role
- Profile note
- About panel

## Dark Mode

Implementation:

- `next-themes`
- `frontend/src/providers/theme-provider.tsx`
- `frontend/src/components/common/theme-toggle.tsx`
- `frontend/src/features/settings/components/settings-page.tsx`
- Tailwind dark variables in `frontend/src/app/globals.css`

Theme controls:

- Header toggle button switches between light and dark.
- Settings page select allows system, light, and dark.

## Responsive UI

Responsive behavior verified in frontend components:

- Desktop sidebar with mobile drawer fallback.
- Mobile navigation menu with escape-key close and swipe-close support.
- Responsive dashboard card and chart grids.
- Mobile employee cards below large breakpoint.
- Desktop employee tables with horizontal scroll.
- Mobile recycle-bin cards.
- Forms use responsive one-column and two-column layouts.
- Dialogs use viewport height constraints and internal scrolling.

## Deployment

Deployment-ready files:

- `vercel.json` for the Next.js frontend.
- `render.yaml` for the Express backend.
- `frontend/.env.example` for frontend API URL.
- `backend/.env.example` for backend runtime, database, JWT, and CORS config.

Deployment targets:

- Frontend: Vercel.
- Backend: Render.
- Database: MongoDB Atlas.

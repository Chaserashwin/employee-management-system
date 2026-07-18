# Security Documentation

This document describes the implemented security controls and recommended hardening steps.

## JWT Authentication

Implementation files:

- `backend/src/utils/jwt.ts`
- `backend/src/middlewares/auth.middleware.ts`
- `frontend/src/services/auth-token.ts`
- `frontend/src/services/api/client.ts`

JWT behavior:

- Tokens are signed with `JWT_SECRET`.
- Token expiration is `7d`.
- Token payload includes user `id`, `email`, and `role`.
- Backend verifies every protected route using `authenticate`.
- Expired tokens return `401`.
- Invalid tokens return `401`.
- Inactive users return `403`.

Frontend token handling:

- Token is stored in `localStorage` under `ems.auth.token`.
- Axios attaches the token as `Authorization: Bearer <token>`.
- Axios response interceptor clears the token on `401` responses and redirects to `/login`.

Production recommendation:

- Use a long, random `JWT_SECRET`.
- Rotate secrets if exposed.
- For a higher-security production system, consider HTTP-only secure cookies instead of localStorage.

## Password Hashing

Implementation file:

- `backend/src/models/user.model.ts`

Behavior:

- Passwords are hashed with bcrypt before save.
- Salt rounds: `12`.
- Password field uses `select: false`.
- API responses remove `password`, `_id`, and `__v` through schema transforms.
- Login explicitly selects password only for credential verification.

Password change:

- The profile UI shows a disabled password panel.
- No password-change API is currently implemented.

## RBAC

Implementation files:

- `backend/src/constants/permissions.ts`
- `backend/src/middlewares/auth.middleware.ts`
- `frontend/src/components/layout/role-gate.tsx`
- `frontend/src/components/layout/app-shell.tsx`

Backend permissions:

| Permission                | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `dashboard:view`          | Dashboard data                             |
| `employee:view`           | Employee list and privileged employee read |
| `employee:view-own`       | Own employee profile access                |
| `employee:create`         | Employee create and CSV import             |
| `employee:update`         | Employee update and status update          |
| `employee:update-own`     | Own profile update                         |
| `employee:delete`         | Soft delete and permanent delete           |
| `employee:restore`        | Recycle-bin restore                        |
| `employee:change-role`    | Role mutation                              |
| `employee:assign-manager` | Manager assignment                         |
| `hierarchy:view`          | Organization tree and reportees            |
| `hierarchy:view-own`      | Own hierarchy chain                        |
| `search:employees`        | Global employee search                     |

Role mapping:

- `SUPER_ADMIN`: all permissions.
- `HR`: dashboard, employee list/create/update, own update, hierarchy, manager assignment, search.
- `EMPLOYEE`: own profile update, own view, own hierarchy chain.

Additional service-level rules:

- Employees can view only their own employee record and chain.
- HR cannot modify `SUPER_ADMIN` employee accounts.
- HR can create only `EMPLOYEE` role records.
- HR cannot change roles.
- HR cannot assign managers through the general update payload.
- `SUPER_ADMIN` cannot downgrade their own role.
- Manager assignment rejects circular reporting.

## Protected Routes

Backend route protection:

- `employeeRouter.use(authenticate)` protects all employee routes.
- `dashboardRouter.use(authenticate)` protects dashboard routes.
- `organizationRouter.use(authenticate)` protects organization routes.
- `searchRouter.use(authenticate)` protects search routes.
- `/api/auth/me` uses `authenticate`.
- `/health`, `/api/auth/login`, and `/api/auth/logout` are public in the current implementation.

Frontend route protection:

- Protected route group uses `ProtectedRoute`.
- Role-limited pages use `RoleGate`.
- The app shell hides navigation items based on role.
- The global search box appears only for `SUPER_ADMIN` and `HR`.

Security note:

Frontend role gates improve UX but are not the security boundary. Backend middleware and service rules enforce access.

## Input Validation

Backend validation uses Zod through:

- `validateBody`
- `validateQuery`
- `validateParams`
- `validateBodyOrUploadedFile`

Auth validation:

- Email must be valid.
- Password is required.

Employee validation:

- Name, department, designation are required text.
- Email must be valid and is lowercased.
- Phone must match the accepted phone regex.
- Salary must be non-negative.
- Joining date must be valid.
- Status must be `ACTIVE` or `INACTIVE`.
- Role must be `SUPER_ADMIN`, `HR`, or `EMPLOYEE`.
- Manager must be a valid MongoDB ObjectId when supplied.
- Bulk employee IDs must be a non-empty ObjectId array.
- List queries enforce safe pagination and sort enums.

Frontend validation:

- Login form uses Zod and React Hook Form.
- Employee form uses Zod and React Hook Form.

## CSV Validation

Implementation files:

- `backend/src/constants/employee-csv.ts`
- `backend/src/services/employee-import.service.ts`
- `backend/tests/employee-csv-contract.test.cjs`

CSV controls:

- Upload must be a CSV MIME type or `.csv` extension.
- Max CSV upload size is 5 MB.
- Required headers are enforced.
- Header aliases are normalized for supported variants.
- Required fields are validated.
- Email, phone, salary, role, status, department, designation, and joining date are validated.
- CSV duplicate email and employee ID values are detected.
- Existing database duplicate email and employee ID values are detected.
- HR imports are restricted to `EMPLOYEE` rows.
- Manager references must point to an active non-deleted employee or a valid row in the same CSV.
- Circular manager relationships in CSV rows are rejected.

## Upload Security

Profile image uploads:

- Upload field: `profileImage`.
- Storage: `uploads/employees`.
- File name: timestamp plus random UUID.
- Allowed MIME types: JPG, PNG, WebP.
- Max size: 2 MB.
- Public URL: `/uploads/employees/<filename>`.

CSV uploads:

- Upload field: `file`.
- Memory storage only.
- Allowed MIME types include CSV and plain text.
- Max size: 5 MB.

Production recommendation:

- Use cloud object storage for durable profile images.
- Add malware scanning before accepting uploads in a real production HR environment.

## HTTP Security

Backend middleware in `backend/src/app.ts`:

- `helmet()` disables or hardens common HTTP headers.
- `app.disable("x-powered-by")` hides Express fingerprinting.
- `cors()` restricts frontend access through `CORS_ORIGIN`.
- `compression()` compresses responses.
- `morgan()` logs requests.
- JSON body size is limited to 1 MB.

Static upload headers:

- `/uploads` is served with immutable cache headers.
- `Cross-Origin-Resource-Policy` is set to `cross-origin`.

## Environment Variables

Backend:

```env
PORT=5001
MONGODB_URI=<mongodb-uri>
JWT_SECRET=<secure-secret>
NODE_ENV=production
CORS_ORIGIN=<frontend-url>
```

Frontend:

```env
NEXT_PUBLIC_API_URL=<backend-url>
```

Best practices:

- Do not commit real `.env` files.
- Use hosting provider secret stores.
- Rotate `JWT_SECRET` if exposed.
- Restrict `CORS_ORIGIN` in production.
- Use least-privilege MongoDB users.
- Avoid placing sensitive values in `NEXT_PUBLIC_*` variables because they are exposed to the browser.

## Error Handling

Implementation file:

- `backend/src/middlewares/error.middleware.ts`

Behavior:

- Operational `AppError` messages are returned with explicit status codes.
- Zod validation errors become `400`.
- Multer upload errors become `400`.
- Database connection errors become `503`.
- Unexpected errors become `500`.
- Production hides serialized error details.

## Security Best Practices for Future Work

- Add rate limiting for login and CSV import.
- Add account lockout or progressive delays after repeated failed login attempts.
- Add password reset and password change APIs.
- Add audit logs for privileged actions.
- Add refresh-token rotation or cookie-based sessions.
- Add CSRF protection if cookies are introduced.
- Add centralized request ID logging.
- Add dependency scanning in CI.
- Add automated security tests for RBAC boundaries.
- Move uploaded profile images to durable object storage.

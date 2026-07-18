# API Documentation

Base URL:

- Local: `http://localhost:5001`
- Production: Render backend URL, configured as `NEXT_PUBLIC_API_URL` in the frontend.

All protected endpoints require:

```http
Authorization: Bearer <jwt>
```

## Common Contracts

### Success Response

```json
{
  "success": true,
  "message": "Operation completed.",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

In non-production environments, the error middleware may include an `error` object for debugging.

### Authentication

Authentication is handled by `authenticate` middleware in `backend/src/middlewares/auth.middleware.ts`.

- Parses `Authorization: Bearer <token>`.
- Verifies the JWT with `JWT_SECRET`.
- Loads the user from MongoDB.
- Rejects missing, invalid, expired, deleted, or inactive users.
- Adds `{ id, email, role }` to `request.user`.

### Authorization

Authorization is handled by `authorize` middleware and the permission map in `backend/src/constants/permissions.ts`.

| Role          | Effective Access                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------- |
| `SUPER_ADMIN` | All permissions                                                                                   |
| `HR`          | Dashboard, employee list/create/update, own profile update, hierarchy, manager assignment, search |
| `EMPLOYEE`    | Own profile update, own profile view, own hierarchy chain                                         |

### Employee List Query

Used by `GET /api/employees` and `GET /api/employees/recycle-bin`.

| Query        | Type   | Default       | Validation                             |
| ------------ | ------ | ------------- | -------------------------------------- |
| `page`       | number | `1`           | integer, min `1`                       |
| `limit`      | number | `10`          | integer, min `1`, max `100`            |
| `search`     | string | none          | optional, trims empty values           |
| `department` | string | none          | optional, case-insensitive exact match |
| `role`       | enum   | none          | `SUPER_ADMIN`, `HR`, `EMPLOYEE`        |
| `status`     | enum   | none          | `ACTIVE`, `INACTIVE`                   |
| `sortBy`     | enum   | `joiningDate` | `joiningDate`, `name`                  |
| `sortOrder`  | enum   | `desc`        | `asc`, `desc`                          |

### Employee Object

```json
{
  "id": "66a000000000000000000001",
  "employeeId": "EMS-0001",
  "name": "Super Admin",
  "email": "admin@ems.com",
  "phone": "+1 555 0100",
  "department": "Executive",
  "designation": "System Administrator",
  "salary": 150000,
  "joiningDate": "2024-01-01T00:00:00.000Z",
  "status": "ACTIVE",
  "role": "SUPER_ADMIN",
  "manager": null,
  "profileImage": "/uploads/employees/example.png",
  "deleted": false,
  "isDeleted": false,
  "deletedAt": null,
  "deletedBy": null,
  "createdAt": "2026-07-18T00:00:00.000Z",
  "updatedAt": "2026-07-18T00:00:00.000Z"
}
```

## Endpoint Index

| Method   | Route                                   | Module       | Auth | Authorization                                       |
| -------- | --------------------------------------- | ------------ | ---- | --------------------------------------------------- |
| `GET`    | `/health`                               | Health       | No   | Public                                              |
| `POST`   | `/api/auth/login`                       | Auth         | No   | Public                                              |
| `POST`   | `/api/auth/logout`                      | Auth         | No   | Public client logout acknowledgement                |
| `GET`    | `/api/auth/me`                          | Auth         | Yes  | Any active user                                     |
| `GET`    | `/api/dashboard`                        | Dashboard    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `GET`    | `/api/employees`                        | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `GET`    | `/api/employees/recycle-bin`            | Employees    | Yes  | `SUPER_ADMIN`                                       |
| `PATCH`  | `/api/employees/recycle-bin/restore`    | Employees    | Yes  | `SUPER_ADMIN`                                       |
| `DELETE` | `/api/employees/recycle-bin`            | Employees    | Yes  | `SUPER_ADMIN`                                       |
| `DELETE` | `/api/employees/recycle-bin/:id`        | Employees    | Yes  | `SUPER_ADMIN`                                       |
| `GET`    | `/api/employees/import/template`        | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `POST`   | `/api/employees/import/preview`         | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `POST`   | `/api/employees/import`                 | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `GET`    | `/api/employees/me`                     | Employees    | Yes  | Any active user with matching employee profile      |
| `PATCH`  | `/api/employees/me`                     | Employees    | Yes  | Any active user                                     |
| `GET`    | `/api/employees/:id/reportees`          | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `GET`    | `/api/employees/:id/direct-reports`     | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `GET`    | `/api/employees/:id/chain`              | Employees    | Yes  | `SUPER_ADMIN`, `HR`, or employee viewing own chain  |
| `GET`    | `/api/employees/:id/manager-candidates` | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `GET`    | `/api/employees/:id`                    | Employees    | Yes  | `SUPER_ADMIN`, `HR`, or employee viewing own record |
| `POST`   | `/api/employees`                        | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `PUT`    | `/api/employees/:id`                    | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `DELETE` | `/api/employees/:id`                    | Employees    | Yes  | `SUPER_ADMIN`                                       |
| `PATCH`  | `/api/employees/:id/restore`            | Employees    | Yes  | `SUPER_ADMIN`                                       |
| `PATCH`  | `/api/employees/:id/status`             | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `PATCH`  | `/api/employees/:id/role`               | Employees    | Yes  | `SUPER_ADMIN`                                       |
| `PATCH`  | `/api/employees/:id/manager`            | Employees    | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `GET`    | `/api/organization/tree`                | Organization | Yes  | `SUPER_ADMIN`, `HR`                                 |
| `GET`    | `/api/search`                           | Search       | Yes  | `SUPER_ADMIN`, `HR`                                 |

## Health

### GET `/health`

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Purpose        | Verify backend availability and current runtime environment. |
| Authentication | None                                                         |
| Authorization  | Public                                                       |
| Validation     | None                                                         |
| Request Body   | None                                                         |
| Status Codes   | `200`                                                        |

Example request:

```bash
curl http://localhost:5001/health
```

Example response:

```json
{
  "success": true,
  "message": "Backend is healthy.",
  "data": {
    "environment": "development",
    "port": 5001,
    "status": "ok"
  }
}
```

## Auth

### POST `/api/auth/login`

| Field          | Value                                                                    |
| -------------- | ------------------------------------------------------------------------ |
| Purpose        | Authenticate a user and return a JWT token plus safe user object.        |
| Authentication | None                                                                     |
| Authorization  | Public                                                                   |
| Validation     | `email` must be a valid email and is lowercased; `password` is required. |
| Request Body   | JSON                                                                     |
| Status Codes   | `200`, `400`, `401`, `403`, `503`, `500`                                 |

Example request:

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@ems.com\",\"password\":\"Password123\"}"
```

Example body:

```json
{
  "email": "admin@ems.com",
  "password": "Password123"
}
```

Example response:

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "jwt.token.value",
    "user": {
      "id": "66a000000000000000000001",
      "name": "Super Admin",
      "email": "admin@ems.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

### POST `/api/auth/logout`

| Field          | Value                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| Purpose        | Return a logout acknowledgement. The frontend clears local token state. |
| Authentication | None in route implementation                                            |
| Authorization  | Public                                                                  |
| Validation     | None                                                                    |
| Request Body   | None                                                                    |
| Status Codes   | `200`                                                                   |

Example request:

```bash
curl -X POST http://localhost:5001/api/auth/logout
```

Example response:

```json
{
  "success": true,
  "message": "Logout successful.",
  "data": null
}
```

### GET `/api/auth/me`

| Field          | Value                                                            |
| -------------- | ---------------------------------------------------------------- |
| Purpose        | Return the currently authenticated user without password fields. |
| Authentication | Bearer token                                                     |
| Authorization  | Any active user                                                  |
| Validation     | JWT payload and active user lookup                               |
| Request Body   | None                                                             |
| Status Codes   | `200`, `401`, `403`                                              |

Example request:

```bash
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer <jwt>"
```

Example response:

```json
{
  "success": true,
  "message": "Current user retrieved.",
  "data": {
    "id": "66a000000000000000000001",
    "name": "Super Admin",
    "email": "admin@ems.com",
    "role": "SUPER_ADMIN",
    "status": "ACTIVE"
  }
}
```

## Dashboard

### GET `/api/dashboard`

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Purpose        | Return dashboard cards, chart buckets, and recent employees. |
| Authentication | Bearer token                                                 |
| Authorization  | `dashboard:view`, available to `SUPER_ADMIN` and `HR`        |
| Validation     | Active JWT user                                              |
| Request Body   | None                                                         |
| Status Codes   | `200`, `401`, `403`, `503`, `500`                            |

Example request:

```bash
curl http://localhost:5001/api/dashboard \
  -H "Authorization: Bearer <jwt>"
```

Example response:

```json
{
  "success": true,
  "message": "Dashboard retrieved.",
  "data": {
    "cards": {
      "totalEmployees": 120,
      "activeEmployees": 113,
      "inactiveEmployees": 7,
      "departments": 14,
      "managers": 19,
      "recentHires": 6
    },
    "charts": {
      "departmentDistribution": [{ "label": "Engineering", "value": 13 }],
      "employeesByRole": [{ "label": "EMPLOYEE", "value": 117 }],
      "employeeStatus": [{ "label": "ACTIVE", "value": 113 }],
      "monthlyJoiningTrend": [{ "label": "Jul 26", "value": 2 }]
    },
    "recentEmployees": []
  }
}
```

## Employees

### GET `/api/employees`

| Field          | Value                                                                             |
| -------------- | --------------------------------------------------------------------------------- |
| Purpose        | List active, non-deleted employees with pagination, search, filters, and sorting. |
| Authentication | Bearer token                                                                      |
| Authorization  | `employee:view`, available to `SUPER_ADMIN` and `HR`                              |
| Validation     | Employee list query schema                                                        |
| Request Body   | None                                                                              |
| Status Codes   | `200`, `400`, `401`, `403`, `503`, `500`                                          |

Example request:

```bash
curl "http://localhost:5001/api/employees?page=1&limit=10&search=priya&status=ACTIVE&sortBy=joiningDate&sortOrder=desc" \
  -H "Authorization: Bearer <jwt>"
```

Example response:

```json
{
  "success": true,
  "message": "Employees retrieved.",
  "data": {
    "items": [],
    "totalItems": 0,
    "totalPages": 1,
    "page": 1,
    "limit": 10,
    "hasNext": false,
    "hasPrevious": false,
    "data": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRecords": 0,
      "limit": 10,
      "hasNext": false,
      "hasPrevious": false
    }
  }
}
```

### GET `/api/employees/recycle-bin`

| Field          | Value                                                                               |
| -------------- | ----------------------------------------------------------------------------------- |
| Purpose        | List soft-deleted employees using the same query contract as active employee lists. |
| Authentication | Bearer token                                                                        |
| Authorization  | `employee:restore`, available to `SUPER_ADMIN`                                      |
| Validation     | Employee list query schema                                                          |
| Request Body   | None                                                                                |
| Status Codes   | `200`, `400`, `401`, `403`                                                          |

Example request:

```bash
curl "http://localhost:5001/api/employees/recycle-bin?page=1&limit=10" \
  -H "Authorization: Bearer <jwt>"
```

Example response: same list shape as `GET /api/employees`.

### PATCH `/api/employees/recycle-bin/restore`

| Field          | Value                                                               |
| -------------- | ------------------------------------------------------------------- |
| Purpose        | Bulk restore soft-deleted employees.                                |
| Authentication | Bearer token                                                        |
| Authorization  | `employee:restore`, available to `SUPER_ADMIN`                      |
| Validation     | `employeeIds` must be a non-empty array of valid MongoDB ObjectIds. |
| Request Body   | JSON                                                                |
| Status Codes   | `200`, `400`, `401`, `403`                                          |

Example request:

```bash
curl -X PATCH http://localhost:5001/api/employees/recycle-bin/restore \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d "{\"employeeIds\":[\"66a000000000000000000001\"]}"
```

Example response:

```json
{
  "success": true,
  "message": "Employees restored.",
  "data": {
    "matchedCount": 1,
    "modifiedCount": 1
  }
}
```

### DELETE `/api/employees/recycle-bin`

| Field          | Value                                                               |
| -------------- | ------------------------------------------------------------------- |
| Purpose        | Permanently delete selected soft-deleted employees.                 |
| Authentication | Bearer token                                                        |
| Authorization  | `employee:delete`, available to `SUPER_ADMIN`                       |
| Validation     | `employeeIds` must be a non-empty array of valid MongoDB ObjectIds. |
| Request Body   | JSON                                                                |
| Status Codes   | `200`, `400`, `401`, `403`                                          |

Example request:

```bash
curl -X DELETE http://localhost:5001/api/employees/recycle-bin \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d "{\"employeeIds\":[\"66a000000000000000000001\"]}"
```

Example response:

```json
{
  "success": true,
  "message": "Employees permanently deleted.",
  "data": {
    "deletedCount": 1
  }
}
```

### DELETE `/api/employees/recycle-bin/:id`

| Field          | Value                                         |
| -------------- | --------------------------------------------- |
| Purpose        | Permanently delete one soft-deleted employee. |
| Authentication | Bearer token                                  |
| Authorization  | `employee:delete`, available to `SUPER_ADMIN` |
| Validation     | `id` must be a valid MongoDB ObjectId.        |
| Request Body   | None                                          |
| Status Codes   | `200`, `400`, `401`, `403`, `404`             |

Example request:

```bash
curl -X DELETE http://localhost:5001/api/employees/recycle-bin/66a000000000000000000001 \
  -H "Authorization: Bearer <jwt>"
```

Example response:

```json
{
  "success": true,
  "message": "Employee permanently deleted.",
  "data": {}
}
```

### GET `/api/employees/import/template`

| Field          | Value                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| Purpose        | Download the canonical employee CSV import template.                      |
| Authentication | Bearer token                                                              |
| Authorization  | `employee:create`, available to `SUPER_ADMIN` and `HR`                    |
| Validation     | None                                                                      |
| Request Body   | None                                                                      |
| Response       | `text/csv; charset=utf-8` attachment named `employee-import-template.csv` |
| Status Codes   | `200`, `401`, `403`                                                       |

CSV headers:

```csv
Employee ID,Name,Email,Phone,Department,Designation,Salary,Joining Date,Status,Role,Manager,Profile Image
```

Example request:

```bash
curl http://localhost:5001/api/employees/import/template \
  -H "Authorization: Bearer <jwt>" \
  -o employee-import-template.csv
```

### POST `/api/employees/import/preview`

| Field          | Value                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| Purpose        | Validate a CSV and return row-level import results without creating employees.               |
| Authentication | Bearer token                                                                                 |
| Authorization  | `employee:create`, available to `SUPER_ADMIN` and `HR`                                       |
| Validation     | Multipart field `file`; CSV MIME type or `.csv`; max 5 MB; row validation in import service. |
| Request Body   | `multipart/form-data`                                                                        |
| Status Codes   | `200`, `400`, `401`, `403`, `503`, `500`                                                     |

CSV validation includes required headers, required fields, email format, phone format, department/designation/status/role enums, non-negative salary, supported date formats, duplicate email and employee ID checks, HR role restrictions, manager references, active manager validation, and circular reporting detection.

Example request:

```bash
curl -X POST http://localhost:5001/api/employees/import/preview \
  -H "Authorization: Bearer <jwt>" \
  -F "file=@employees.csv"
```

Example response:

```json
{
  "success": true,
  "message": "Employee import preview generated.",
  "data": {
    "summary": {
      "rows": 2,
      "valid": 1,
      "invalid": 1,
      "duplicates": 0,
      "skipped": 1,
      "imported": 0
    },
    "rows": [
      {
        "rowNumber": 2,
        "data": {
          "employeeId": "EMS-0101",
          "name": "Priya Shah",
          "email": "priya.shah@ems.com"
        },
        "errors": [],
        "isDuplicate": false,
        "isValid": true
      }
    ]
  }
}
```

### POST `/api/employees/import`

| Field          | Value                                                                                  |
| -------------- | -------------------------------------------------------------------------------------- |
| Purpose        | Revalidate a CSV and create valid employee rows only.                                  |
| Authentication | Bearer token                                                                           |
| Authorization  | `employee:create`, available to `SUPER_ADMIN` and `HR`                                 |
| Validation     | Same as preview; valid rows are inserted first, then manager references are connected. |
| Request Body   | `multipart/form-data`                                                                  |
| Status Codes   | `201`, `400`, `401`, `403`, `503`, `500`                                               |

Example request:

```bash
curl -X POST http://localhost:5001/api/employees/import \
  -H "Authorization: Bearer <jwt>" \
  -F "file=@employees.csv"
```

Example response:

```json
{
  "success": true,
  "message": "Employee import completed.",
  "data": {
    "summary": {
      "rows": 2,
      "valid": 1,
      "invalid": 1,
      "duplicates": 0,
      "skipped": 1,
      "imported": 1
    },
    "rows": [],
    "importedEmployees": []
  }
}
```

### GET `/api/employees/me`

| Field          | Value                                                                      |
| -------------- | -------------------------------------------------------------------------- |
| Purpose        | Return the authenticated user's active employee profile.                   |
| Authentication | Bearer token                                                               |
| Authorization  | Any active authenticated user with an employee record matching their email |
| Validation     | Active user and matching employee lookup                                   |
| Request Body   | None                                                                       |
| Status Codes   | `200`, `401`, `403`, `404`                                                 |

Example request:

```bash
curl http://localhost:5001/api/employees/me \
  -H "Authorization: Bearer <jwt>"
```

Example response: employee object.

### PATCH `/api/employees/me`

| Field          | Value                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------- |
| Purpose        | Update the authenticated user's own profile. The service permits only `phone` and `profileImage`. |
| Authentication | Bearer token                                                                                      |
| Authorization  | `employee:update-own`, available to all roles                                                     |
| Validation     | Partial employee schema or file-only upload; optional `removeProfileImage`.                       |
| Request Body   | `multipart/form-data`                                                                             |
| Status Codes   | `200`, `400`, `401`, `403`, `404`                                                                 |

Example request:

```bash
curl -X PATCH http://localhost:5001/api/employees/me \
  -H "Authorization: Bearer <jwt>" \
  -F "phone=+1 555 0101"
```

Example response: updated employee object.

### GET `/api/employees/:id/reportees`

| Field          | Value                                                 |
| -------------- | ----------------------------------------------------- |
| Purpose        | Return direct and nested reportees for an employee.   |
| Authentication | Bearer token                                          |
| Authorization  | `hierarchy:view`, available to `SUPER_ADMIN` and `HR` |
| Validation     | `id` must be a valid MongoDB ObjectId.                |
| Request Body   | None                                                  |
| Status Codes   | `200`, `400`, `401`, `403`, `404`                     |

Example response:

```json
{
  "success": true,
  "message": "Reportees retrieved.",
  "data": {
    "directReportees": [],
    "nestedReportees": []
  }
}
```

### GET `/api/employees/:id/direct-reports`

| Field          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| Purpose        | Return direct report count and direct report tree nodes. |
| Authentication | Bearer token                                             |
| Authorization  | `hierarchy:view`, available to `SUPER_ADMIN` and `HR`    |
| Validation     | `id` must be a valid MongoDB ObjectId.                   |
| Request Body   | None                                                     |
| Status Codes   | `200`, `400`, `401`, `403`, `404`                        |

Example response:

```json
{
  "success": true,
  "message": "Direct reports retrieved.",
  "data": {
    "count": 0,
    "items": []
  }
}
```

### GET `/api/employees/:id/chain`

| Field          | Value                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Purpose        | Return the reporting chain from top-level manager to employee.                                       |
| Authentication | Bearer token                                                                                         |
| Authorization  | `SUPER_ADMIN` and `HR` can view any active employee chain; `EMPLOYEE` can view only their own chain. |
| Validation     | `id` must be a valid MongoDB ObjectId.                                                               |
| Request Body   | None                                                                                                 |
| Status Codes   | `200`, `400`, `401`, `403`, `404`                                                                    |

Example response:

```json
{
  "success": true,
  "message": "Reporting chain retrieved.",
  "data": []
}
```

### GET `/api/employees/:id/manager-candidates`

| Field          | Value                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Purpose        | Return active employees eligible to become the selected employee's manager.                              |
| Authentication | Bearer token                                                                                             |
| Authorization  | `employee:assign-manager`, available to `SUPER_ADMIN` and `HR`                                           |
| Validation     | `id` must be a valid MongoDB ObjectId.                                                                   |
| Exclusions     | Self, current manager, deleted employees, inactive employees, and descendants that would create a cycle. |
| Status Codes   | `200`, `400`, `401`, `403`, `404`                                                                        |

Example response:

```json
{
  "success": true,
  "message": "Manager candidates retrieved.",
  "data": []
}
```

### GET `/api/employees/:id`

| Field          | Value                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------- |
| Purpose        | Return one active employee.                                                                     |
| Authentication | Bearer token                                                                                    |
| Authorization  | `SUPER_ADMIN` and `HR` can view any active employee; `EMPLOYEE` can view only their own record. |
| Validation     | `id` must be a valid MongoDB ObjectId.                                                          |
| Request Body   | None                                                                                            |
| Status Codes   | `200`, `400`, `401`, `403`, `404`                                                               |

Example response: employee object.

### POST `/api/employees`

| Field          | Value                                                     |
| -------------- | --------------------------------------------------------- |
| Purpose        | Create an employee record.                                |
| Authentication | Bearer token                                              |
| Authorization  | `employee:create`, available to `SUPER_ADMIN` and `HR`    |
| Validation     | Create employee schema and optional profile image upload. |
| Request Body   | `multipart/form-data`                                     |
| Status Codes   | `201`, `400`, `401`, `403`, `409`, `503`                  |

Body fields:

| Field          | Validation                                       |
| -------------- | ------------------------------------------------ |
| `name`         | required trimmed string                          |
| `email`        | required valid email, lowercased                 |
| `phone`        | 7 to 20 chars, digits/spaces/`+`/`-`/parentheses |
| `department`   | required string                                  |
| `designation`  | required string                                  |
| `salary`       | non-negative number                              |
| `joiningDate`  | valid date                                       |
| `status`       | `ACTIVE` or `INACTIVE`                           |
| `role`         | `SUPER_ADMIN`, `HR`, or `EMPLOYEE`               |
| `manager`      | optional MongoDB ObjectId                        |
| `profileImage` | optional JPG, PNG, or WebP; max 2 MB             |

HR service restrictions:

- HR can create only `EMPLOYEE` role rows.
- HR cannot set a manager during create.

Example request:

```bash
curl -X POST http://localhost:5001/api/employees \
  -H "Authorization: Bearer <jwt>" \
  -F "name=Priya Shah" \
  -F "email=priya.shah@ems.com" \
  -F "phone=+1 555 1101" \
  -F "department=Engineering" \
  -F "designation=Tech Lead" \
  -F "salary=125000" \
  -F "joiningDate=2024-05-01" \
  -F "status=ACTIVE" \
  -F "role=EMPLOYEE"
```

Example response: created employee object.

### PUT `/api/employees/:id`

| Field          | Value                                                                                   |
| -------------- | --------------------------------------------------------------------------------------- |
| Purpose        | Update employee fields and optional profile image.                                      |
| Authentication | Bearer token                                                                            |
| Authorization  | `employee:update`, available to `SUPER_ADMIN` and `HR`                                  |
| Validation     | `id` ObjectId; partial employee schema or uploaded file; optional `removeProfileImage`. |
| Request Body   | `multipart/form-data`                                                                   |
| Status Codes   | `200`, `400`, `401`, `403`, `404`, `409`                                                |

HR service restrictions:

- HR cannot modify `SUPER_ADMIN` accounts.
- HR cannot change employee roles.
- HR cannot assign managers through this update route.

Example request:

```bash
curl -X PUT http://localhost:5001/api/employees/66a000000000000000000001 \
  -H "Authorization: Bearer <jwt>" \
  -F "phone=+1 555 1102" \
  -F "department=Engineering"
```

Example response: updated employee object.

### DELETE `/api/employees/:id`

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Purpose        | Soft delete an active employee and record deletion metadata. |
| Authentication | Bearer token                                                 |
| Authorization  | `employee:delete`, available to `SUPER_ADMIN`                |
| Validation     | `id` must be a valid MongoDB ObjectId.                       |
| Request Body   | None                                                         |
| Status Codes   | `200`, `400`, `401`, `403`, `404`                            |

Soft delete sets `deleted: true`, `isDeleted: true`, `deletedAt`, and `deletedBy`.

Example response: soft-deleted employee object.

### PATCH `/api/employees/:id/restore`

| Field          | Value                                          |
| -------------- | ---------------------------------------------- |
| Purpose        | Restore one soft-deleted employee.             |
| Authentication | Bearer token                                   |
| Authorization  | `employee:restore`, available to `SUPER_ADMIN` |
| Validation     | `id` must be a valid MongoDB ObjectId.         |
| Request Body   | None                                           |
| Status Codes   | `200`, `400`, `401`, `403`, `404`              |

Restore clears `deletedAt` and `deletedBy`, and sets `deleted: false` and `isDeleted: false`.

Example response: restored employee object.

### PATCH `/api/employees/:id/status`

| Field          | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Purpose        | Change employee status.                                |
| Authentication | Bearer token                                           |
| Authorization  | `employee:update`, available to `SUPER_ADMIN` and `HR` |
| Validation     | `id` ObjectId; `status` is `ACTIVE` or `INACTIVE`.     |
| Request Body   | JSON                                                   |
| Status Codes   | `200`, `400`, `401`, `403`, `404`                      |

HR cannot change status on a `SUPER_ADMIN` employee.

Example request:

```json
{
  "status": "INACTIVE"
}
```

Example response: updated employee object.

### PATCH `/api/employees/:id/role`

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Purpose        | Change employee role.                                        |
| Authentication | Bearer token                                                 |
| Authorization  | `employee:change-role`, available to `SUPER_ADMIN`           |
| Validation     | `id` ObjectId; `role` is `SUPER_ADMIN`, `HR`, or `EMPLOYEE`. |
| Request Body   | JSON                                                         |
| Status Codes   | `200`, `400`, `401`, `403`, `404`                            |

Protection: a `SUPER_ADMIN` cannot downgrade their own role.

Example request:

```json
{
  "role": "HR"
}
```

Example response: updated employee object.

### PATCH `/api/employees/:id/manager`

| Field          | Value                                                                 |
| -------------- | --------------------------------------------------------------------- |
| Purpose        | Assign or clear an employee manager.                                  |
| Authentication | Bearer token                                                          |
| Authorization  | `employee:assign-manager`, available to `SUPER_ADMIN` and `HR`        |
| Validation     | `id` ObjectId; `managerId` is a MongoDB ObjectId, `null`, or omitted. |
| Request Body   | JSON                                                                  |
| Status Codes   | `200`, `400`, `401`, `403`, `404`                                     |

Manager protections:

- Employee cannot manage themselves.
- Duplicate manager assignment is rejected.
- Manager must exist, be active, and not be deleted.
- Circular reporting is rejected.
- HR cannot assign managers to `SUPER_ADMIN` accounts.

Example request:

```json
{
  "managerId": "66a000000000000000000002"
}
```

Clear manager:

```json
{
  "managerId": null
}
```

Example response: updated employee object.

## Organization

### GET `/api/organization/tree`

| Field          | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| Purpose        | Return the full recursive organization tree for active employees. |
| Authentication | Bearer token                                                      |
| Authorization  | `hierarchy:view`, available to `SUPER_ADMIN` and `HR`             |
| Validation     | Active JWT user                                                   |
| Request Body   | None                                                              |
| Status Codes   | `200`, `401`, `403`, `503`, `500`                                 |

Example request:

```bash
curl http://localhost:5001/api/organization/tree \
  -H "Authorization: Bearer <jwt>"
```

Example response:

```json
{
  "success": true,
  "message": "Organization tree retrieved.",
  "data": [
    {
      "id": "66a000000000000000000001",
      "employeeId": "EMS-0001",
      "name": "Super Admin",
      "manager": null,
      "directReporteesCount": 2,
      "reportees": []
    }
  ]
}
```

## Search

### GET `/api/search`

| Field          | Value                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| Purpose        | Return global employee search results.                                                       |
| Authentication | Bearer token                                                                                 |
| Authorization  | `search:employees`, available to `SUPER_ADMIN` and `HR`                                      |
| Validation     | Query string is read as `q`; empty or whitespace query returns an empty employee result set. |
| Request Body   | None                                                                                         |
| Status Codes   | `200`, `401`, `403`, `503`, `500`                                                            |

Search matches active employee `name`, `email`, `employeeId`, and `department`, sorted by name and limited to 8 records.

Example request:

```bash
curl "http://localhost:5001/api/search?q=admin" \
  -H "Authorization: Bearer <jwt>"
```

Example response:

```json
{
  "success": true,
  "message": "Search results retrieved.",
  "data": {
    "employees": [
      {
        "id": "66a000000000000000000001",
        "employeeId": "EMS-0001",
        "name": "Super Admin",
        "email": "admin@ems.com",
        "department": "Executive",
        "designation": "System Administrator",
        "phone": "+1 555 0100",
        "joiningDate": "2024-01-01T00:00:00.000Z",
        "role": "SUPER_ADMIN",
        "status": "ACTIVE"
      }
    ]
  }
}
```

## Uploads

Profile images:

- Field: `profileImage`
- Storage: `uploads/employees`
- Public path: `/uploads/employees/<filename>`
- Max size: 2 MB
- Supported MIME types: `image/jpeg`, `image/png`, `image/webp`

CSV import files:

- Field: `file`
- Storage: in memory
- Max size: 5 MB
- Supported MIME types: `application/csv`, `application/vnd.ms-excel`, `text/csv`, `text/plain`, or `.csv` extension

## Status Codes

| Status | Meaning                                                                                     |
| ------ | ------------------------------------------------------------------------------------------- |
| `200`  | Successful read, update, restore, delete acknowledgement, or logout acknowledgement         |
| `201`  | Employee created or CSV import completed                                                    |
| `400`  | Zod validation error, invalid JSON, invalid upload, invalid manager assignment, invalid CSV |
| `401`  | Missing, invalid, or expired authentication token                                           |
| `403`  | Inactive user or insufficient role/permission                                               |
| `404`  | Employee, deleted employee, manager, or route not found                                     |
| `409`  | Duplicate employee email or employee ID                                                     |
| `503`  | Database connection unavailable                                                             |
| `500`  | Unexpected server error                                                                     |

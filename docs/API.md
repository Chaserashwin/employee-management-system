# EMS API Documentation

Base URL: `http://localhost:5001`

All protected endpoints require `Authorization: Bearer <jwt>`.

## Health

### GET `/health`
Returns backend status and the active port. No authentication required.

## Auth

### POST `/api/auth/login`

Request: `{ "email": "admin@ems.com", "password": "Password123" }`

Response: authenticated user and JWT token.

Errors: `400` validation error, `401` invalid credentials, `403` inactive user.

### POST `/api/auth/logout`

Returns a success response. Token clearing is handled by the client.

### GET `/api/auth/me`

Returns the authenticated user without password fields.

Errors: `401` missing, invalid, or expired token.

## Employees

### GET `/api/employees`

Roles: `SUPER_ADMIN`, `HR`

Query: `page`, `limit`, `search`, `department`, `role`, `status`, `sortBy`, `sortOrder`

Returns employee records with pagination.

### GET `/api/employees/me`

Returns the authenticated user's employee profile.

### PATCH `/api/employees/me`

Roles: `SUPER_ADMIN`, `HR`, `EMPLOYEE`

Updates permitted personal fields and profile image.

### GET `/api/employees/:id`

Roles: `SUPER_ADMIN`, `HR`; `EMPLOYEE` only for own profile.

### POST `/api/employees`

Roles: `SUPER_ADMIN`, `HR`

Multipart form fields: `name`, `email`, `phone`, `department`, `designation`, `salary`, `joiningDate`, `role`, `status`, optional `profileImage`.

### PUT `/api/employees/:id`

Roles: `SUPER_ADMIN`, `HR`

Updates employee profile fields and optional profile image.

### DELETE `/api/employees/:id`

Roles: `SUPER_ADMIN`

Soft deletes the employee.

### PATCH `/api/employees/:id/restore`

Roles: `SUPER_ADMIN`

Restores a soft-deleted employee.

### PATCH `/api/employees/:id/status`

Roles: `SUPER_ADMIN`, `HR`

Request: `{ "status": "ACTIVE" | "INACTIVE" }`

### PATCH `/api/employees/:id/role`

Roles: `SUPER_ADMIN`

Request: `{ "role": "SUPER_ADMIN" | "HR" | "EMPLOYEE" }`

Protections: SUPER_ADMIN cannot downgrade themselves.

### PATCH `/api/employees/:id/manager`

Roles: `SUPER_ADMIN`

Request: `{ "managerId": "<employeeId>" }` or `{ "managerId": null }`

Protections: prevents self assignment, duplicate assignment, inactive/deleted managers, and circular reporting.

### GET `/api/employees/:id/reportees`

Roles: `SUPER_ADMIN`, `HR`

Returns direct and nested reportees.

### GET `/api/employees/:id/chain`

Returns reporting chain from top-level manager to employee. Employees may view only their own chain.

### GET `/api/employees/:id/manager-candidates`

Roles: `SUPER_ADMIN`

Returns valid active manager candidates excluding self, current manager, deleted employees, and circular candidates.

## Organization

### GET `/api/organization/tree`

Roles: `SUPER_ADMIN`, `HR`

Returns the complete recursive organization tree.

## Dashboard

### GET `/api/dashboard`

Roles: `SUPER_ADMIN`, `HR`

Returns dashboard cards, chart buckets, and recent employees.

## Search

### GET `/api/search?q=<query>`

Roles: `SUPER_ADMIN`, `HR`

Searches employee name, employee ID, email, and department.

## Error Format

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## Uploads

Profile images are accepted as multipart `profileImage` files up to 2 MB. Supported formats are JPG, PNG, and WebP.

## CORS

Production CORS is controlled by the backend `CORS_ORIGIN` environment variable. Use a comma-separated list for multiple allowed frontend origins.

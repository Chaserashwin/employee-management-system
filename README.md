# Employee Management System

Production-grade Employee Management System built as a TypeScript monorepo with a Next.js frontend, Express API, MongoDB persistence, authentication, RBAC, employee CRUD, organization hierarchy, dashboard analytics, and deployment-ready configuration.

## Features

- JWT authentication with persistent client sessions
- Role based access control for `SUPER_ADMIN`, `HR`, and `EMPLOYEE`
- Employee CRUD with validation, profile image upload, pagination, search, filters, sorting, and soft delete
- Recycle Bin with restore, permanent delete, and bulk actions
- CSV employee import with template download, validation preview, duplicate detection, and valid-row import
- Manager assignment with circular reporting prevention
- Recursive organization tree, reportees API, and reporting chain
- Dashboard analytics with responsive charts
- Global employee search
- Profile and settings pages
- Light, dark, and system theme support
- Vercel, Render, and MongoDB Atlas ready configuration

## Architecture

```text
employee-management-system/
  frontend/              Next.js 15 App Router UI
  backend/               Express TypeScript API
  docs/API.md            API documentation
```

The backend follows route, controller, service, repository, model, validator, and middleware boundaries. The frontend uses App Router route groups, feature modules, shared UI primitives, Axios, React Query, Zod, React Hook Form, and shared providers.

## Screenshots

- Dashboard: `docs/screenshots/dashboard.png`
- Employees: `docs/screenshots/employees.png`
- Organization Tree: `docs/screenshots/organization.png`
- Profile: `docs/screenshots/profile.png`

## Tech Stack

Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn-style components, React Query, Axios, React Hook Form, Zod, Recharts, Lucide Icons.

Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, Multer, Helmet, CORS, Morgan, Compression.

Tooling: npm workspaces, ESLint, Prettier.

## Environment Variables

Frontend `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

Backend `backend/.env`:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/employee_management
JWT_SECRET=replace-with-a-secure-secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:4000
```

## Installation

Install dependencies from the monorepo root:

```bash
npm install
```

## Database Setup

Use MongoDB Atlas. Set `MONGODB_URI` in `backend/.env`.

Seed default users and 120 realistic employee profiles:

```bash
npm run seed
```

The seed inserts employee profiles only when the employee collection is empty. To reseed employees, run `npm run seed -- --force`.
To keep existing users and employees and add non-conflicting seed employees, run `npm run seed:append`.

Default credentials:

| Role        | Email              | Password      |
| ----------- | ------------------ | ------------- |
| Super Admin | `admin@ems.com`    | `Password123` |
| HR          | `hr@ems.com`       | `Password123` |
| Employee    | `employee@ems.com` | `Password123` |

## Run Locally

Start the backend:

```bash
cd backend
npm install
npm run dev
```

Start the frontend in a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:4000`

Backend: `http://localhost:5001`

## Scripts

Root:

- `npm run dev` starts frontend and backend
- `npm run build` builds both workspaces
- `npm run lint` lints both workspaces
- `npm run frontend` starts the frontend
- `npm run backend` starts the backend

Backend:

- `npm run seed --workspace backend`
- `npm run seed:append --workspace backend`
- `npm run db:seed --workspace backend`
- `npm run db:seed:append --workspace backend`

CSV import template headers:

```csv
Employee ID,Name,Email,Phone,Department,Designation,Salary,Joining Date,Status,Role,Manager,Profile Image
```

`Manager` may reference an existing or imported employee by email or employee ID. `Profile Image` is optional; missing images use the default avatar fallback.

## Deployment

Frontend on Vercel:

- Root directory: repository root
- Install command: `npm install`
- Build command: `npm run build --workspace frontend`
- Environment: `NEXT_PUBLIC_API_URL=<backend-url>`

Backend on Render:

- Build command: `npm install && npm run build --workspace backend`
- Start command: `npm run start --workspace backend`
- Environment: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CORS_ORIGIN=<frontend-url>`

Database on MongoDB Atlas:

- Create a cluster
- Create a database user
- Add the connection string to `MONGODB_URI`
- Allow the backend host in network access

## API Documentation

See [docs/API.md](docs/API.md).

## Security Notes

- Passwords are hashed with bcrypt.
- JWT secrets are loaded from environment variables.
- Passwords are never returned from APIs.
- Helmet secures HTTP headers.
- Production CORS is restricted through `CORS_ORIGIN`.
- RBAC middleware protects privileged routes.
- SUPER_ADMIN can change roles, soft delete, restore, and permanently delete employees.
- SUPER_ADMIN and HR can assign managers; circular reporting and inactive/deleted managers are rejected.
- Employee manager assignment prevents circular reporting.

## Future Improvements

- Automated test suite
- Audit logging
- Email invitations
- Cloudinary/S3 profile image storage
- Advanced dashboard exports
- Password reset and password change API

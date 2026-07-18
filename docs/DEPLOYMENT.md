# Deployment Guide

This project is deployment-ready for a Vercel frontend, Render backend, and MongoDB Atlas database.

## Prerequisites

- Node.js 20 or newer recommended.
- npm 10 or newer.
- MongoDB Atlas cluster or reachable MongoDB instance.
- Vercel project for the frontend.
- Render web service for the backend.
- Secure JWT secret.

## Repository Layout

```text
employee-management-system/
  frontend/   Next.js application
  backend/    Express API
  vercel.json
  render.yaml
```

The root `package.json` uses npm workspaces:

```json
{
  "workspaces": ["frontend", "backend"]
}
```

## Environment Variables

### Backend

File: `backend/.env.example`

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/employee_management
JWT_SECRET=replace-with-a-secure-secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:4000
```

Production backend variables:

| Variable      | Required | Notes                                                 |
| ------------- | -------- | ----------------------------------------------------- |
| `PORT`        | Yes      | Render provides a port, but `render.yaml` sets `5001` |
| `MONGODB_URI` | Yes      | Required in production by `connectDatabase`           |
| `JWT_SECRET`  | Yes      | Required to sign and verify JWTs                      |
| `NODE_ENV`    | Yes      | Use `production`                                      |
| `CORS_ORIGIN` | Yes      | Frontend URL; comma-separated values supported        |

### Frontend

File: `frontend/.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

Production frontend variables:

| Variable              | Required | Notes                            |
| --------------------- | -------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Public URL of the Render backend |

## Local Production Build

Install dependencies from the repository root:

```bash
npm install
```

Build both workspaces:

```bash
npm run build
```

Build only the frontend:

```bash
npm run build --workspace frontend
```

Build only the backend:

```bash
npm run build --workspace backend
```

Start compiled backend:

```bash
npm run start --workspace backend
```

## Backend Deployment on Render

Render configuration is defined in `render.yaml`:

```yaml
services:
  - type: web
    name: ems-backend
    runtime: node
    plan: free
    buildCommand: npm install --include=dev && npm run build --workspace backend
    startCommand: npm run start --workspace backend
```

### Steps

1. Create a Render web service from the repository.
2. Use the repository root as the root directory.
3. Use the build command from `render.yaml`:

```bash
npm install --include=dev && npm run build --workspace backend
```

4. Use the start command from `render.yaml`:

```bash
npm run start --workspace backend
```

5. Configure environment variables:

```env
NODE_ENV=production
PORT=5001
MONGODB_URI=<mongodb-atlas-uri>
JWT_SECRET=<secure-random-secret>
CORS_ORIGIN=<vercel-frontend-url>
```

6. Deploy and verify:

```text
https://<render-service>.onrender.com/health
```

Expected health response:

```json
{
  "success": true,
  "message": "Backend is healthy.",
  "data": {
    "environment": "production",
    "port": 5001,
    "status": "ok"
  }
}
```

## Frontend Deployment on Vercel

Vercel configuration is defined in `vercel.json`:

```json
{
  "buildCommand": "npm run build --workspace frontend",
  "devCommand": "npm run dev --workspace frontend",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

### Steps

1. Create a Vercel project from the repository.
2. Keep the repository root as the project root.
3. Use the install command:

```bash
npm install
```

4. Use the build command:

```bash
npm run build --workspace frontend
```

5. Set the frontend environment variable:

```env
NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com
```

6. Deploy.
7. Add the deployed Vercel URL to the backend `CORS_ORIGIN` value in Render.
8. Redeploy or restart the backend after updating CORS.

## Database Deployment on MongoDB Atlas

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with read/write permissions.
3. Configure network access for the Render backend.
4. Copy the connection string.
5. Set `MONGODB_URI` in Render.
6. Confirm the backend can connect by checking `/health` and login behavior.

## Seed Production Data

After backend deployment and `MONGODB_URI` configuration, seed the database from a secure local environment or Render shell:

```bash
npm run seed --workspace backend
```

Seed behavior:

- Creates default users.
- Adds 120 employees when the employee collection is empty.
- Supports `--append` and `--force` when needed.

Default credentials:

| Role          | Email              | Password      |
| ------------- | ------------------ | ------------- |
| `SUPER_ADMIN` | `admin@ems.com`    | `Password123` |
| `HR`          | `hr@ems.com`       | `Password123` |
| `EMPLOYEE`    | `employee@ems.com` | `Password123` |

Change seed credentials before using the application outside a demo or hiring-assignment context.

## CORS Configuration

Backend CORS is configured in `backend/src/app.ts`.

Production behavior:

- If `CORS_ORIGIN` is set, only listed origins are allowed.
- If `CORS_ORIGIN` is not set in production, CORS origin becomes `false`.
- Multiple origins can be configured as a comma-separated list.

Example:

```env
CORS_ORIGIN=https://ems-frontend.vercel.app,https://custom-domain.example
```

## Static Uploads

Profile images are stored locally under:

```text
uploads/employees/
```

The backend exposes uploads through:

```text
/uploads
```

Production note:

- Render local disk may not be durable across redeploys on all plans.
- For long-term production use, move uploads to object storage such as S3 or Cloudinary.

## Troubleshooting

### Frontend Cannot Reach Backend

Check:

- `NEXT_PUBLIC_API_URL` points to the deployed backend URL.
- Backend `/health` returns success.
- Render service is awake.
- Browser console does not show CORS errors.
- Backend `CORS_ORIGIN` includes the frontend URL exactly.

### Login Returns Database Error

Check:

- `MONGODB_URI` is configured in Render.
- MongoDB Atlas network access allows Render.
- Database credentials are correct.
- Atlas cluster is running.

### Login Returns Invalid Token or JWT Error

Check:

- `JWT_SECRET` is configured.
- Backend was restarted after setting `JWT_SECRET`.
- Token in browser localStorage is not from a previous deployment secret.

### CSV Import Fails

Check:

- File is `.csv`.
- File size is less than 5 MB.
- Headers match the template.
- Required fields are present.
- Date format is supported.
- Manager references match existing or imported employee email/ID values.

### Profile Images Do Not Render

Check:

- Backend URL is configured in `NEXT_PUBLIC_API_URL`.
- Static uploads are served from `/uploads`.
- Uploaded file type is JPG, PNG, or WebP.
- File size is less than 2 MB.

### Build Fails

Run workspace builds independently:

```bash
npm run build --workspace backend
npm run build --workspace frontend
```

Then check:

- Missing environment variables.
- TypeScript errors.
- Package installation failures.
- Node/npm version mismatch.

## Production Checklist

- [ ] Set `NODE_ENV=production`.
- [ ] Set a strong `JWT_SECRET`.
- [ ] Set `MONGODB_URI`.
- [ ] Set `CORS_ORIGIN` to the Vercel frontend URL.
- [ ] Set `NEXT_PUBLIC_API_URL` to the Render backend URL.
- [ ] Verify `/health`.
- [ ] Verify login for each role.
- [ ] Verify employee list, create, edit, soft delete, restore, CSV import, and organization tree.
- [ ] Replace demo credentials before real use.
- [ ] Add a committed `LICENSE` file before public open-source release.

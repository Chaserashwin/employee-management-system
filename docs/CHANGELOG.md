# Changelog

All notable changes for this hiring-assignment project are documented here.

## Version 1.0.0

Release type: initial production-grade hiring assignment release.

### Added

- Full-stack TypeScript monorepo using npm workspaces.
- Next.js 15 frontend with React 19.
- Express TypeScript backend.
- MongoDB persistence through Mongoose.
- JWT authentication.
- Bcrypt password hashing.
- Role based access control for `SUPER_ADMIN`, `HR`, and `EMPLOYEE`.
- Protected frontend route group.
- Role-aware app shell navigation.
- Dashboard analytics cards.
- Dashboard charts for department distribution, employees by role, monthly joining trend, and employee status.
- Recent employees panel.
- Employee list with search, filters, sorting, and pagination.
- Employee create workflow.
- Employee detail page.
- Employee edit workflow.
- Profile image upload and removal support.
- Employee status update workflow.
- Employee role update workflow for `SUPER_ADMIN`.
- Manager assignment workflow.
- Manager candidate filtering with circular reporting prevention.
- Soft delete for employee records.
- Recycle Bin with search, filters, sorting, pagination, restore, and permanent delete.
- Bulk restore and bulk permanent delete in Recycle Bin.
- CSV employee import template download.
- CSV import preview with row-level validation.
- CSV valid-row import.
- CSV duplicate detection.
- CSV manager reference validation.
- CSV circular reporting validation.
- Organization tree page.
- Recursive hierarchy API.
- Reporting chain API.
- Direct reports API.
- Reportees API.
- Current profile page.
- Settings page with account details and theme selection.
- Light, dark, and system theme support.
- Global employee search.
- Responsive layout with mobile sidebar and mobile employee cards.
- Backend health check endpoint.
- Central error handling.
- Not-found route handling.
- Helmet security headers.
- Production CORS configuration.
- Upload size and MIME restrictions.
- Seed script with default users and 120 employee profiles.
- Backend CSV contract tests.
- Vercel frontend deployment config.
- Render backend deployment config.
- Comprehensive repository documentation.

### Security

- Password hashes are never returned by user APIs.
- JWT tokens expire after seven days.
- Backend routes enforce permissions through middleware.
- Service layer enforces additional role rules.
- Employee manager assignment prevents circular relationships.
- Uploads are constrained by type and size.

### Known Limitations

- A deployed frontend URL is not committed in repository metadata.
- Password change UI is present as a disabled panel, but no password-change API is implemented.
- Profile images are stored on local backend disk; durable object storage is recommended for long-term production use.
- Automated test coverage currently focuses on the CSV contract and date parsing.

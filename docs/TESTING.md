# Testing Guide

This document describes the available automated checks and the recommended manual QA process.

## Available Scripts

Run commands from the repository root unless noted otherwise.

| Command                              | Purpose                                              |
| ------------------------------------ | ---------------------------------------------------- |
| `npm run test`                       | Runs backend tests through the root workspace script |
| `npm run test --workspace backend`   | Runs backend Node test suite                         |
| `npm run lint`                       | Runs frontend and backend lint scripts               |
| `npm run lint --workspace frontend`  | Lints the Next.js frontend                           |
| `npm run lint --workspace backend`   | Lints the Express backend                            |
| `npm run build`                      | Builds frontend and backend                          |
| `npm run build --workspace frontend` | Builds only the frontend                             |
| `npm run build --workspace backend`  | Builds only the backend                              |

## Automated Tests

Current automated test file:

```text
backend/tests/employee-csv-contract.test.cjs
```

Coverage:

- CSV template header row matches canonical header order.
- Required CSV headers are derived from the canonical column contract.
- CSV validator accepts generated template headers.
- Missing-header errors use canonical template labels.
- CSV date parser accepts deterministic formats.
- CSV date parser accepts Excel serial date numbers.
- CSV date parser rejects invalid dates.
- CSV date parser accepts leap-year dates.

Run:

```bash
npm run test
```

or:

```bash
npm run test --workspace backend
```

## Lint

Run all lint checks:

```bash
npm run lint
```

Run frontend lint:

```bash
npm run lint --workspace frontend
```

Run backend lint:

```bash
npm run lint --workspace backend
```

## Build Verification

Build both applications:

```bash
npm run build
```

Expected results:

- Frontend Next.js build completes.
- Backend TypeScript compilation writes compiled output to `backend/dist`.

Build independently when diagnosing issues:

```bash
npm run build --workspace frontend
npm run build --workspace backend
```

## CSV Validation QA

Use the import dialog on the Employee List page.

Test cases:

- Download the CSV template.
- Preview a valid CSV with one employee.
- Import valid rows.
- Upload a CSV missing `Employee ID`.
- Upload duplicate emails in the same CSV.
- Upload duplicate employee IDs in the same CSV.
- Upload email already present in MongoDB.
- Upload employee ID already present in MongoDB.
- Upload invalid email.
- Upload invalid phone.
- Upload invalid department.
- Upload invalid designation.
- Upload invalid status.
- Upload invalid role.
- Upload negative salary.
- Upload invalid joining date.
- Upload manager reference to existing employee email.
- Upload manager reference to existing employee ID.
- Upload manager reference to another row in the same CSV.
- Upload manager reference that points to the same employee.
- Upload circular reporting chain in CSV rows.
- Log in as HR and verify non-`EMPLOYEE` import rows are rejected.

## Manual QA Checklist

### Authentication

- [ ] Login with `admin@ems.com` and valid password.
- [ ] Login with `hr@ems.com` and valid password.
- [ ] Login with `employee@ems.com` and valid password.
- [ ] Invalid password returns an error.
- [ ] Invalid email format is rejected on the client.
- [ ] Logout clears the session and returns to login.
- [ ] Expired or invalid token redirects to login.

### RBAC

- [ ] `SUPER_ADMIN` can see Dashboard, Employees, Recycle Bin, Organization, Profile, Settings.
- [ ] `HR` can see Dashboard, Employees, Organization, Profile, Settings.
- [ ] `HR` cannot see Recycle Bin.
- [ ] `EMPLOYEE` lands on Profile.
- [ ] `EMPLOYEE` cannot access Dashboard, Employees, Recycle Bin, or Organization.
- [ ] Backend rejects unauthorized API requests even if a route is called directly.

### Dashboard

- [ ] Cards display total, active, inactive, departments, managers, recent hires.
- [ ] Department Distribution chart renders.
- [ ] Employees by Role chart renders.
- [ ] Monthly Joining Trend chart renders.
- [ ] Employee Status chart renders.
- [ ] Recent Employees list displays or shows empty state.
- [ ] Quick action links navigate correctly.

### Employee CRUD

- [ ] Employee list loads.
- [ ] Search by name works.
- [ ] Search by email works.
- [ ] Filter by department works.
- [ ] Filter by role works.
- [ ] Filter by status works.
- [ ] Sort by joining date works.
- [ ] Sort by employee name works.
- [ ] Pagination previous/next works.
- [ ] Page size selector works.
- [ ] Create employee with valid data.
- [ ] Create employee rejects invalid email.
- [ ] Create employee rejects invalid phone.
- [ ] Create employee rejects negative salary.
- [ ] Upload profile image.
- [ ] Reject unsupported profile image type.
- [ ] View employee details.
- [ ] Edit employee details.
- [ ] Change employee status.
- [ ] `SUPER_ADMIN` can change role.
- [ ] `SUPER_ADMIN` cannot downgrade their own role.
- [ ] `HR` cannot edit `SUPER_ADMIN` records.
- [ ] Soft delete employee.

### Manager Assignment

- [ ] Manager assignment dialog opens.
- [ ] Candidate search filters candidates.
- [ ] Current employee is excluded from candidates.
- [ ] Current manager is excluded from candidates.
- [ ] Descendants are excluded from candidates.
- [ ] Assign manager succeeds.
- [ ] Clear manager succeeds.
- [ ] Circular manager assignment is rejected by backend.

### Recycle Bin

- [ ] Deleted employees appear in Recycle Bin.
- [ ] Recycle Bin search/filter/sort works.
- [ ] Select one row.
- [ ] Select all visible rows.
- [ ] Restore one employee.
- [ ] Restore selected employees.
- [ ] Permanently delete one employee.
- [ ] Permanently delete selected employees.
- [ ] Restored employees return to active employee list.

### Organization

- [ ] Organization tree loads.
- [ ] Root employees render.
- [ ] Expand/collapse works.
- [ ] Selecting a node updates detail panel.
- [ ] Direct reportee count is correct.
- [ ] Deleted employees are absent from hierarchy.

### Profile

- [ ] Each role can open Profile.
- [ ] Employee details display correctly.
- [ ] Reporting chain displays.
- [ ] Salary is formatted.
- [ ] Password panel is disabled as implemented.

### Settings

- [ ] Account name, email, and role display.
- [ ] Theme changes to light.
- [ ] Theme changes to dark.
- [ ] Theme changes to system.
- [ ] Header theme toggle works.

## Responsive Testing

Recommended viewport checks:

- Mobile: `375x667`
- Mobile large: `414x896`
- Tablet: `768x1024`
- Laptop: `1366x768`
- Desktop: `1440x900`

Responsive items to verify:

- Mobile sidebar opens and closes.
- Escape key closes mobile sidebar.
- Swipe-left closes mobile sidebar.
- Employee list renders mobile cards below desktop breakpoint.
- Recycle Bin renders mobile cards below desktop breakpoint.
- Tables scroll horizontally on desktop when needed.
- Dashboard charts remain readable.
- Dialogs remain inside viewport and scroll internally.
- Buttons and labels do not overlap.

## Browser Testing

Recommended browsers:

- Chrome
- Edge
- Firefox
- Safari, if available

Browser checks:

- Login and logout.
- JWT persistence after refresh.
- Dark mode persistence.
- CSV template download.
- CSV file upload.
- Profile image upload preview.
- Global search keyboard interaction.
- Navigation links and route prefetch behavior.

## API Smoke Tests

After logging in and obtaining a JWT:

```bash
curl http://localhost:5001/health
curl http://localhost:5001/api/auth/me -H "Authorization: Bearer <jwt>"
curl http://localhost:5001/api/dashboard -H "Authorization: Bearer <jwt>"
curl "http://localhost:5001/api/employees?page=1&limit=10" -H "Authorization: Bearer <jwt>"
curl http://localhost:5001/api/organization/tree -H "Authorization: Bearer <jwt>"
curl "http://localhost:5001/api/search?q=admin" -H "Authorization: Bearer <jwt>"
```

## Recommended Future Test Coverage

- Auth integration tests.
- RBAC boundary tests for every protected route.
- Employee CRUD integration tests.
- Soft delete, restore, and permanent delete tests.
- Manager assignment cycle tests.
- Dashboard aggregation tests.
- Organization tree shape tests.
- Frontend component tests for forms and role gates.
- End-to-end Playwright tests for recruiter-facing workflows.

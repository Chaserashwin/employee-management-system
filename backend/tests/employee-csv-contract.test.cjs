const assert = require("node:assert/strict");
const { test } = require("node:test");

const {
  EMPLOYEE_CSV_COLUMNS,
  EMPLOYEE_CSV_HEADERS,
  EMPLOYEE_CSV_REQUIRED_HEADERS,
} = require("../src/constants/employee-csv");
const {
  getEmployeeCsvHeaderIndexes,
  getEmployeeCsvTemplate,
} = require("../src/services/employee-import.service");

const parseHeaderRow = (csv) => csv.split(/\r?\n/)[0].split(",");

test("employee CSV template header row matches the canonical header order", () => {
  assert.deepEqual(parseHeaderRow(getEmployeeCsvTemplate()), EMPLOYEE_CSV_HEADERS);
});

test("employee CSV required headers are derived from the canonical column contract", () => {
  assert.deepEqual(
    EMPLOYEE_CSV_REQUIRED_HEADERS,
    EMPLOYEE_CSV_COLUMNS.filter((column) => column.required).map((column) => column.header),
  );
});

test("employee CSV validator accepts the generated template headers", () => {
  const headerIndexes = getEmployeeCsvHeaderIndexes(parseHeaderRow(getEmployeeCsvTemplate()));

  assert.deepEqual(
    [...headerIndexes.keys()],
    EMPLOYEE_CSV_COLUMNS.map((column) => column.key),
  );
});

test("employee CSV missing-header errors use the canonical template labels", () => {
  const headersWithoutEmployeeIdAndName = EMPLOYEE_CSV_HEADERS.filter(
    (header) => header !== "Employee ID" && header !== "Name",
  );

  assert.throws(
    () => getEmployeeCsvHeaderIndexes(headersWithoutEmployeeIdAndName),
    (error) =>
      error instanceof Error &&
      error.message === "Missing required CSV headers: Employee ID, Name.",
  );
});

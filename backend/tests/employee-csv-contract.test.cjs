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
const { parseEmployeeCsvDate } = require("../src/utils/employee-csv-date");

const parseHeaderRow = (csv) => csv.split(/\r?\n/)[0].split(",");
const toISOString = (date) => {
  assert.ok(date instanceof Date);

  return date.toISOString();
};

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

test("employee CSV date parser accepts supported deterministic date formats", () => {
  assert.equal(toISOString(parseEmployeeCsvDate("01-05-2024")), "2024-05-01T00:00:00.000Z");
  assert.equal(toISOString(parseEmployeeCsvDate("18-09-2024")), "2024-09-18T00:00:00.000Z");
  assert.equal(toISOString(parseEmployeeCsvDate("21-03-2024")), "2024-03-21T00:00:00.000Z");
  assert.equal(toISOString(parseEmployeeCsvDate("09-07-2022")), "2022-07-09T00:00:00.000Z");
  assert.equal(toISOString(parseEmployeeCsvDate("11-01-2025")), "2025-01-11T00:00:00.000Z");
  assert.equal(toISOString(parseEmployeeCsvDate("2024-09-18")), "2024-09-18T00:00:00.000Z");
  assert.equal(toISOString(parseEmployeeCsvDate("18/09/2024")), "2024-09-18T00:00:00.000Z");
  assert.equal(
    toISOString(parseEmployeeCsvDate("2024-09-18T10:30:15.250Z")),
    "2024-09-18T10:30:15.250Z",
  );
  assert.equal(
    toISOString(parseEmployeeCsvDate("2024-09-18T16:00:00+05:30")),
    "2024-09-18T10:30:00.000Z",
  );
});

test("employee CSV date parser accepts Excel serial date numbers", () => {
  assert.equal(toISOString(parseEmployeeCsvDate("45553")), "2024-09-18T00:00:00.000Z");
  assert.equal(toISOString(parseEmployeeCsvDate("45553.5")), "2024-09-18T12:00:00.000Z");
});

test("employee CSV date parser rejects invalid dates", () => {
  assert.equal(parseEmployeeCsvDate("31-02-2024"), null);
  assert.equal(parseEmployeeCsvDate("29-02-2023"), null);
  assert.equal(parseEmployeeCsvDate("00-05-2024"), null);
  assert.equal(parseEmployeeCsvDate("18-13-2024"), null);
  assert.equal(parseEmployeeCsvDate("2024-02-31"), null);
  assert.equal(parseEmployeeCsvDate("not-a-date"), null);
  assert.equal(parseEmployeeCsvDate("60"), null);
});

test("employee CSV date parser accepts valid leap-year dates", () => {
  assert.equal(toISOString(parseEmployeeCsvDate("29-02-2024")), "2024-02-29T00:00:00.000Z");
});

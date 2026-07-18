export const EMPLOYEE_CSV_COLUMNS = [
  {
    key: "employeeId",
    header: "Employee ID",
    required: true,
    aliases: ["Employee_ID"],
  },
  {
    key: "name",
    header: "Name",
    required: true,
    aliases: [],
  },
  {
    key: "email",
    header: "Email",
    required: true,
    aliases: [],
  },
  {
    key: "phone",
    header: "Phone",
    required: true,
    aliases: [],
  },
  {
    key: "department",
    header: "Department",
    required: true,
    aliases: [],
  },
  {
    key: "designation",
    header: "Designation",
    required: true,
    aliases: [],
  },
  {
    key: "salary",
    header: "Salary",
    required: true,
    aliases: [],
  },
  {
    key: "joiningDate",
    header: "Joining Date",
    required: true,
    aliases: ["Joining_Date"],
  },
  {
    key: "status",
    header: "Status",
    required: true,
    aliases: [],
  },
  {
    key: "role",
    header: "Role",
    required: true,
    aliases: [],
  },
  {
    key: "manager",
    header: "Manager",
    required: false,
    aliases: [],
  },
  {
    key: "profileImage",
    header: "Profile Image",
    required: false,
    aliases: ["Profile_Image"],
  },
] as const;

export type EmployeeCsvFieldKey = (typeof EMPLOYEE_CSV_COLUMNS)[number]["key"];

export type CsvEmployeeData = Record<EmployeeCsvFieldKey, string>;

export const EMPLOYEE_CSV_HEADERS = EMPLOYEE_CSV_COLUMNS.map((column) => column.header);

export const EMPLOYEE_CSV_REQUIRED_COLUMNS = EMPLOYEE_CSV_COLUMNS.filter(
  (column) => column.required,
);

export const EMPLOYEE_CSV_REQUIRED_HEADERS = EMPLOYEE_CSV_REQUIRED_COLUMNS.map(
  (column) => column.header,
);

export const normalizeEmployeeCsvHeader = (value: string) =>
  value.trim().toLowerCase().replace(/[\s-]+/g, "");

const headerEntries = EMPLOYEE_CSV_COLUMNS.flatMap((column) =>
  [column.header, ...(column.aliases ?? [])].map((header) => [
    normalizeEmployeeCsvHeader(header),
    column.key,
  ]),
);

export const EMPLOYEE_CSV_FIELD_BY_NORMALIZED_HEADER = Object.freeze(
  Object.fromEntries(headerEntries) as Record<string, EmployeeCsvFieldKey>,
);

export const getEmployeeCsvFieldKey = (header: string) =>
  EMPLOYEE_CSV_FIELD_BY_NORMALIZED_HEADER[normalizeEmployeeCsvHeader(header)];

export const getEmployeeCsvHeaderLabel = (key: EmployeeCsvFieldKey) =>
  EMPLOYEE_CSV_COLUMNS.find((column) => column.key === key)?.header ?? key;

export const createEmptyEmployeeCsvData = (): CsvEmployeeData =>
  Object.fromEntries(EMPLOYEE_CSV_COLUMNS.map((column) => [column.key, ""])) as CsvEmployeeData;

export const assertEmployeeCsvHeaderContract = () => {
  const seenHeaders = new Set<string>();
  const seenKeys = new Set<string>();

  for (const column of EMPLOYEE_CSV_COLUMNS) {
    const normalizedHeader = normalizeEmployeeCsvHeader(column.header);

    if (seenHeaders.has(normalizedHeader)) {
      throw new Error(`Duplicate CSV header configured: ${column.header}`);
    }

    if (seenKeys.has(column.key)) {
      throw new Error(`Duplicate CSV field key configured: ${column.key}`);
    }

    if (getEmployeeCsvFieldKey(column.header) !== column.key) {
      throw new Error(`CSV header is not mapped to its field key: ${column.header}`);
    }

    seenHeaders.add(normalizedHeader);
    seenKeys.add(column.key);
  }

  for (const requiredColumn of EMPLOYEE_CSV_REQUIRED_COLUMNS) {
    if (!EMPLOYEE_CSV_HEADERS.includes(requiredColumn.header)) {
      throw new Error(`Required CSV header is missing from template headers: ${requiredColumn.header}`);
    }
  }
};

assertEmployeeCsvHeaderContract();

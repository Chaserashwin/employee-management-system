import { connectDatabase, disconnectDatabase } from "../config/database";
import { env } from "../config/env";
import {
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_DESIGNATIONS,
  type EmployeeRole,
  type EmployeeStatus,
} from "../constants/employee";
import { USER_ROLES } from "../constants/user";
import { CounterModel } from "../models/counter.model";
import { EmployeeModel, type EmployeeDocument } from "../models/employee.model";
import { UserModel } from "../models/user.model";
import { logger } from "../utils/logger";

type SeedEmployee = {
  department: string;
  designation: string;
  email: string;
  employeeId: string;
  joiningDate: Date;
  managerEmployeeId: string | null;
  name: string;
  phone: string;
  role: EmployeeRole;
  salary: number;
  status: EmployeeStatus;
};

const forceSeed = process.argv.includes("--force");
const appendSeed = process.argv.includes("--append") || process.argv.includes("--keep-existing");
const targetEmployeeCount = 120;

const seedUsers = [
  {
    email: "admin@ems.com",
    name: "Super Admin",
    password: "Password123",
    role: USER_ROLES[0],
  },
  {
    email: "hr@ems.com",
    name: "HR User",
    password: "Password123",
    role: USER_ROLES[1],
  },
  {
    email: "employee@ems.com",
    name: "Employee User",
    password: "Password123",
    role: USER_ROLES[2],
  },
] as const;

const firstNames = [
  "Aarav",
  "Aisha",
  "Ananya",
  "Arjun",
  "Daniel",
  "Emily",
  "Fatima",
  "Hannah",
  "Ishaan",
  "James",
  "Kavya",
  "Liam",
  "Maya",
  "Neha",
  "Noah",
  "Olivia",
  "Priya",
  "Rahul",
  "Rohan",
  "Sara",
  "Sophia",
  "Vihaan",
  "William",
  "Zara",
];

const lastNames = [
  "Agarwal",
  "Bennett",
  "Brooks",
  "Chopra",
  "Desai",
  "Fernandez",
  "Gupta",
  "Iyer",
  "Johnson",
  "Kapoor",
  "Khan",
  "Mehta",
  "Nair",
  "Patel",
  "Rao",
  "Shah",
  "Singh",
  "Thomas",
  "Verma",
  "Williams",
];

const designationByDepartment: Record<string, string[]> = {
  Administration: ["Admin Executive", "Business Analyst"],
  DevOps: ["DevOps Engineer", "Senior Software Engineer"],
  Engineering: ["Software Engineer", "Senior Software Engineer", "UI UX Designer", "Product Manager"],
  Finance: ["Finance Manager", "Business Analyst"],
  HR: ["HR Executive", "HR Manager"],
  Marketing: ["Marketing Executive", "Business Analyst"],
  Operations: ["Admin Executive", "Business Analyst", "Product Manager"],
  QA: ["QA Engineer", "Senior Software Engineer"],
  Sales: ["Sales Executive", "Business Analyst"],
  Support: ["Support Engineer", "Business Analyst"],
};

const departmentLeads: Array<Omit<SeedEmployee, "joiningDate" | "phone" | "salary" | "status">> = [
  {
    department: "Engineering",
    designation: "Tech Lead",
    email: "engineering.lead@ems.com",
    employeeId: "EMS-0003",
    managerEmployeeId: "EMS-0001",
    name: "Priya Shah",
    role: "EMPLOYEE",
  },
  {
    department: "Marketing",
    designation: "Marketing Executive",
    email: "marketing.lead@ems.com",
    employeeId: "EMS-0004",
    managerEmployeeId: "EMS-0001",
    name: "Daniel Brooks",
    role: "EMPLOYEE",
  },
  {
    department: "Finance",
    designation: "Finance Manager",
    email: "finance.lead@ems.com",
    employeeId: "EMS-0005",
    managerEmployeeId: "EMS-0001",
    name: "Neha Rao",
    role: "EMPLOYEE",
  },
  {
    department: "Sales",
    designation: "Sales Executive",
    email: "sales.lead@ems.com",
    employeeId: "EMS-0006",
    managerEmployeeId: "EMS-0001",
    name: "Rahul Mehta",
    role: "EMPLOYEE",
  },
  {
    department: "Operations",
    designation: "Product Manager",
    email: "operations.lead@ems.com",
    employeeId: "EMS-0007",
    managerEmployeeId: "EMS-0001",
    name: "Sophia Williams",
    role: "EMPLOYEE",
  },
  {
    department: "Support",
    designation: "Support Engineer",
    email: "support.lead@ems.com",
    employeeId: "EMS-0008",
    managerEmployeeId: "EMS-0001",
    name: "James Bennett",
    role: "EMPLOYEE",
  },
  {
    department: "QA",
    designation: "QA Engineer",
    email: "qa.lead@ems.com",
    employeeId: "EMS-0009",
    managerEmployeeId: "EMS-0001",
    name: "Maya Kapoor",
    role: "EMPLOYEE",
  },
  {
    department: "DevOps",
    designation: "DevOps Engineer",
    email: "devops.lead@ems.com",
    employeeId: "EMS-0010",
    managerEmployeeId: "EMS-0001",
    name: "Rohan Verma",
    role: "EMPLOYEE",
  },
  {
    department: "Administration",
    designation: "Admin Executive",
    email: "admin.lead@ems.com",
    employeeId: "EMS-0011",
    managerEmployeeId: "EMS-0001",
    name: "Sara Thomas",
    role: "EMPLOYEE",
  },
];

const salaryRanges: Record<string, [number, number]> = {
  "Admin Executive": [52000, 76000],
  "Business Analyst": [72000, 112000],
  "DevOps Engineer": [96000, 142000],
  "Finance Manager": [98000, 148000],
  "HR Executive": [54000, 82000],
  "HR Manager": [92000, 136000],
  "Marketing Executive": [58000, 94000],
  "Product Manager": [108000, 162000],
  "QA Engineer": [70000, 108000],
  "Sales Executive": [56000, 104000],
  "Senior Software Engineer": [108000, 158000],
  "Software Engineer": [76000, 124000],
  "Support Engineer": [56000, 88000],
  "Tech Lead": [126000, 178000],
  "UI UX Designer": [78000, 118000],
};

const randomBetween = (seed: number, minimum: number, maximum: number) => {
  const normalized = Math.abs(Math.sin(seed) * 10000) % 1;

  return Math.round(minimum + normalized * (maximum - minimum));
};

const createJoiningDate = (seed: number) => {
  const now = new Date();
  const date = new Date(now.getFullYear() - 5, now.getMonth(), 1);

  date.setDate(date.getDate() + randomBetween(seed, 0, 1825));
  date.setHours(0, 0, 0, 0);

  return date;
};

const createSalary = (designation: string, seed: number) => {
  const [minimum, maximum] = salaryRanges[designation] ?? [60000, 120000];

  return randomBetween(seed, minimum, maximum);
};

const createEmployeeId = (index: number) => `EMS-${String(index).padStart(4, "0")}`;

const getEmployeeIdSequence = (employeeId: string) => {
  const match = employeeId.match(/(\d+)$/);

  return match ? Number(match[1]) : 0;
};

const getNextAvailableEmployeeId = (reservedEmployeeIds: Set<string>) => {
  let nextSequence = Math.max(
    targetEmployeeCount,
    ...[...reservedEmployeeIds].map(getEmployeeIdSequence),
  ) + 1;

  return () => {
    let employeeId = createEmployeeId(nextSequence);

    while (reservedEmployeeIds.has(employeeId.toLowerCase())) {
      nextSequence += 1;
      employeeId = createEmployeeId(nextSequence);
    }

    reservedEmployeeIds.add(employeeId.toLowerCase());
    nextSequence += 1;

    return employeeId;
  };
};

const createCoreEmployees = (): SeedEmployee[] => [
  {
    department: "Administration",
    designation: "Admin Executive",
    email: "admin@ems.com",
    employeeId: "EMS-0001",
    joiningDate: new Date("2022-01-03"),
    managerEmployeeId: null,
    name: "Super Admin",
    phone: "+1 555 0100",
    role: "SUPER_ADMIN",
    salary: 180000,
    status: "ACTIVE",
  },
  {
    department: "HR",
    designation: "HR Manager",
    email: "hr@ems.com",
    employeeId: "EMS-0002",
    joiningDate: new Date("2022-02-14"),
    managerEmployeeId: "EMS-0001",
    name: "HR User",
    phone: "+1 555 0101",
    role: "HR",
    salary: 116000,
    status: "ACTIVE",
  },
  ...departmentLeads.map((lead, index) => ({
    ...lead,
    joiningDate: createJoiningDate(index + 11),
    phone: `+1 555 ${String(2000 + index).padStart(4, "0")}`,
    salary: createSalary(lead.designation, index + 31),
    status: "ACTIVE" as const,
  })),
  {
    department: "Engineering",
    designation: "Software Engineer",
    email: "employee@ems.com",
    employeeId: "EMS-0012",
    joiningDate: new Date("2023-03-20"),
    managerEmployeeId: "EMS-0003",
    name: "Employee User",
    phone: "+1 555 0102",
    role: "EMPLOYEE",
    salary: 86000,
    status: "ACTIVE",
  },
];

const createGeneratedEmployees = (startingIndex: number) => {
  const employees: SeedEmployee[] = [];
  const leadByDepartment = new Map<string, string>([
    ["HR", "EMS-0002"],
    ...departmentLeads.map((lead) => [lead.department, lead.employeeId] as const),
  ]);
  const secondaryManagerByDepartment = new Map<string, string>();
  const departments = EMPLOYEE_DEPARTMENTS.filter((department) => department !== "Administration");

  for (let employeeNumber = startingIndex; employeeNumber <= targetEmployeeCount; employeeNumber += 1) {
    const department = departments[(employeeNumber - startingIndex) % departments.length];
    const designations = designationByDepartment[department] ?? EMPLOYEE_DESIGNATIONS;
    const designation = designations[employeeNumber % designations.length];
    const firstName = firstNames[employeeNumber % firstNames.length];
    const lastName = lastNames[(employeeNumber * 3) % lastNames.length];
    const employeeId = createEmployeeId(employeeNumber);
    const isPotentialManager =
      !secondaryManagerByDepartment.has(department) &&
      ["Senior Software Engineer", "Business Analyst", "Product Manager", "HR Executive"].includes(
        designation,
      );
    const managerEmployeeId =
      secondaryManagerByDepartment.get(department) ?? leadByDepartment.get(department) ?? "EMS-0001";
    const role: EmployeeRole =
      department === "HR" && employeeNumber % 4 === 0 ? "HR" : "EMPLOYEE";
    const status: EmployeeStatus = employeeNumber % 17 === 0 ? "INACTIVE" : "ACTIVE";

    employees.push({
      department,
      designation,
      email: `${firstName}.${lastName}.${employeeNumber}@ems.com`.toLowerCase(),
      employeeId,
      joiningDate: createJoiningDate(employeeNumber),
      managerEmployeeId,
      name: `${firstName} ${lastName}`,
      phone: `+1 555 ${String(3000 + employeeNumber).padStart(4, "0")}`,
      role,
      salary: createSalary(designation, employeeNumber),
      status,
    });

    if (isPotentialManager && status === "ACTIVE") {
      secondaryManagerByDepartment.set(department, employeeId);
    }
  }

  return employees;
};

const ensureSeedUsers = async () => {
  for (const seedUser of seedUsers) {
    const existingUser = await UserModel.findOne({ email: seedUser.email }).exec();

    if (existingUser) {
      logger.info(`Skipping existing user ${seedUser.email}.`);
      continue;
    }

    await UserModel.create({
      ...seedUser,
      status: "ACTIVE",
    });

    logger.info(`Created seed user ${seedUser.email}.`);
  }
};

const prepareAppendEmployees = (
  seedEmployeesToCreate: SeedEmployee[],
  existingEmployees: EmployeeDocument[],
) => {
  const existingByEmail = new Map(
    existingEmployees.map((employee) => [employee.email.toLowerCase(), employee]),
  );
  const existingByEmployeeId = new Map(
    existingEmployees.map((employee) => [employee.employeeId.toLowerCase(), employee]),
  );
  const reservedEmployeeIds = new Set(existingByEmployeeId.keys());
  const nextEmployeeId = getNextAvailableEmployeeId(reservedEmployeeIds);
  const employeeIdRemap = new Map<string, string>();
  const employeesToCreate: SeedEmployee[] = [];

  for (const seedEmployee of seedEmployeesToCreate) {
    const existingEmployee = existingByEmail.get(seedEmployee.email.toLowerCase());

    if (existingEmployee) {
      employeeIdRemap.set(seedEmployee.employeeId, existingEmployee.employeeId);
      logger.info(`Keeping existing employee ${existingEmployee.email}.`);
      continue;
    }

    let employeeId = seedEmployee.employeeId;

    if (reservedEmployeeIds.has(employeeId.toLowerCase())) {
      employeeId = nextEmployeeId();
    } else {
      reservedEmployeeIds.add(employeeId.toLowerCase());
    }

    employeeIdRemap.set(seedEmployee.employeeId, employeeId);
    employeesToCreate.push({
      ...seedEmployee,
      employeeId,
    });
  }

  return employeesToCreate.map((seedEmployee) => ({
    ...seedEmployee,
    managerEmployeeId: seedEmployee.managerEmployeeId
      ? employeeIdRemap.get(seedEmployee.managerEmployeeId) ?? seedEmployee.managerEmployeeId
      : null,
  }));
};

const syncEmployeeCounter = async () => {
  const employees = await EmployeeModel.find({}, { employeeId: 1 }).lean().exec();
  const maxEmployeeIdSequence = employees.reduce(
    (maxSequence, employee) => Math.max(maxSequence, getEmployeeIdSequence(employee.employeeId)),
    0,
  );

  await CounterModel.findByIdAndUpdate(
    "employee",
    { seq: maxEmployeeIdSequence },
    { new: true, setDefaultsOnInsert: true, upsert: true },
  ).exec();
};

const seedEmployees = async () => {
  const existingEmployeeCount = await EmployeeModel.countDocuments({}).exec();

  if (existingEmployeeCount > 0 && !forceSeed && !appendSeed) {
    logger.info(
      `Skipping employee seed because ${existingEmployeeCount} employees already exist. Use --append to keep existing employees and add seed data, or --force to reseed.`,
    );
    return;
  }

  if (forceSeed) {
    await EmployeeModel.deleteMany({}).exec();
    logger.info("Cleared existing employees because --force was provided.");
  }

  const seedEmployeesToCreate = [
    ...createCoreEmployees(),
    ...createGeneratedEmployees(createCoreEmployees().length + 1),
  ];
  const existingEmployees = forceSeed ? [] : await EmployeeModel.find({}).exec();
  const appendPreparedEmployees =
    appendSeed && !forceSeed
      ? prepareAppendEmployees(seedEmployeesToCreate, existingEmployees)
      : seedEmployeesToCreate;
  const employeeMap = new Map<string, EmployeeDocument>(
    existingEmployees.map((employee) => [employee.employeeId, employee]),
  );

  for (const seedEmployee of appendPreparedEmployees) {
    const { managerEmployeeId, ...employeePayload } = seedEmployee;
    const manager = managerEmployeeId ? employeeMap.get(managerEmployeeId) : null;
    const employee = await EmployeeModel.create({
      ...employeePayload,
      deleted: false,
      deletedAt: null,
      deletedBy: null,
      isDeleted: false,
      manager: manager ? manager.id : null,
    });

    employeeMap.set(employee.employeeId, employee);
  }

  await syncEmployeeCounter();

  logger.info(`Seeded ${appendPreparedEmployees.length} employee profiles.`);
};

const runSeed = async () => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required to seed employee data.");
  }

  await connectDatabase();
  await ensureSeedUsers();
  await seedEmployees();
};

runSeed()
  .then(async () => {
    await disconnectDatabase();
    logger.info("Employee seeding completed.");
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    logger.error("Employee seeding failed.", error);
    await disconnectDatabase();
    process.exit(1);
  });

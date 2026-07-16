import { connectDatabase, disconnectDatabase } from "../config/database";
import { env } from "../config/env";
import { USER_ROLES } from "../constants/user";
import { EmployeeModel, type EmployeeDocument } from "../models/employee.model";
import { UserModel } from "../models/user.model";
import { logger } from "../utils/logger";

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

const seedEmployeeProfiles = [
  {
    department: "Executive",
    designation: "System Administrator",
    email: "admin@ems.com",
    employeeId: "EMS-0001",
    joiningDate: new Date("2024-01-01"),
    managerEmail: null,
    name: "Super Admin",
    phone: "+1 555 0100",
    role: USER_ROLES[0],
    salary: 150000,
    status: "ACTIVE",
  },
  {
    department: "People Operations",
    designation: "HR Manager",
    email: "hr@ems.com",
    employeeId: "EMS-0002",
    joiningDate: new Date("2024-02-12"),
    managerEmail: "admin@ems.com",
    name: "HR User",
    phone: "+1 555 0101",
    role: USER_ROLES[1],
    salary: 95000,
    status: "ACTIVE",
  },
  {
    department: "Engineering",
    designation: "Software Engineer",
    email: "employee@ems.com",
    employeeId: "EMS-0003",
    joiningDate: new Date("2024-03-18"),
    managerEmail: "hr@ems.com",
    name: "Employee User",
    phone: "+1 555 0102",
    role: USER_ROLES[2],
    salary: 75000,
    status: "ACTIVE",
  },
] as const;

const seedEmployeeProfileMap = new Map<string, EmployeeDocument>();

const runSeed = async () => {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required to seed demo data.");
  }

  await connectDatabase();

  for (const seedUser of seedUsers) {
    const existingUser = await UserModel.exists({ email: seedUser.email });

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

  for (const seedEmployee of seedEmployeeProfiles) {
    const existingEmployee = await EmployeeModel.findOne({
      $or: [{ email: seedEmployee.email }, { employeeId: seedEmployee.employeeId }],
    }).exec();

    if (existingEmployee) {
      seedEmployeeProfileMap.set(seedEmployee.email, existingEmployee);
      logger.info(`Skipping existing employee profile ${seedEmployee.email}.`);
      continue;
    }

    const { managerEmail, ...employeePayload } = seedEmployee;
    const manager = managerEmail
      ? seedEmployeeProfileMap.get(managerEmail) ??
        (await EmployeeModel.findOne({ email: managerEmail }).exec())
      : null;

    const employee = await EmployeeModel.create({
      ...employeePayload,
      manager: manager ? manager.id : null,
    });

    seedEmployeeProfileMap.set(seedEmployee.email, employee);
    logger.info(`Created employee profile ${seedEmployee.email}.`);
  }
};

runSeed()
  .then(async () => {
    await disconnectDatabase();
    logger.info("Demo data seeding completed.");
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    logger.error("Demo data seeding failed.", error);
    await disconnectDatabase();
    process.exit(1);
  });

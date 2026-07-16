import type { FilterQuery, SortOrder, UpdateQuery } from "mongoose";

import { EmployeeModel, type EmployeeDocument } from "../models/employee.model";
import type { EmployeeListQuery, EmployeePayload, EmployeeUpdatePayload } from "../types/employee";
import { generateEmployeeId } from "../utils/employee-id";

type EmployeeFilter = FilterQuery<EmployeeDocument>;

const escapeRegex = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const createEmployee = async (payload: EmployeePayload) => {
  const employeeId = await generateEmployeeId();

  return EmployeeModel.create({
    ...payload,
    employeeId,
    manager: payload.manager ?? null,
  });
};

export const findEmployeeById = (id: string) => {
  return EmployeeModel.findOne({ _id: id, deleted: false }).exec();
};

export const findEmployeeByIdIncludingDeleted = (id: string) => {
  return EmployeeModel.findById(id).exec();
};

export const findEmployeeByEmail = (email: string) => {
  return EmployeeModel.findOne({ email, deleted: false }).exec();
};

export const findEmployeeByEmailIncludingDeleted = (email: string) => {
  return EmployeeModel.findOne({ email }).exec();
};

export const findAllEmployees = () => {
  return EmployeeModel.find({ deleted: false }).sort({ name: 1, _id: 1 }).exec();
};

export const findManagerCandidates = () => {
  return EmployeeModel.find({ deleted: false, status: "ACTIVE" }).sort({ name: 1, _id: 1 }).exec();
};

export const updateEmployeeById = (id: string, payload: EmployeeUpdatePayload) => {
  const update: UpdateQuery<EmployeeDocument> = {
    ...payload,
  };

  if (payload.manager === undefined) {
    delete update.manager;
  } else {
    update.manager = payload.manager ?? null;
  }

  return EmployeeModel.findOneAndUpdate({ _id: id, deleted: false }, update, {
    new: true,
    runValidators: true,
  }).exec();
};

export const softDeleteEmployeeById = (id: string) => {
  return EmployeeModel.findOneAndUpdate(
    { _id: id, deleted: false },
    { deleted: true },
    { new: true },
  ).exec();
};

export const restoreEmployeeById = (id: string) => {
  return EmployeeModel.findOneAndUpdate(
    { _id: id, deleted: true },
    { deleted: false },
    { new: true, runValidators: true },
  ).exec();
};

export const updateEmployeeStatusById = (id: string, status: EmployeeDocument["status"]) => {
  return EmployeeModel.findOneAndUpdate(
    { _id: id, deleted: false },
    { status },
    { new: true, runValidators: true },
  ).exec();
};

export const updateEmployeeRoleById = (id: string, role: EmployeeDocument["role"]) => {
  return EmployeeModel.findOneAndUpdate(
    { _id: id, deleted: false },
    { role },
    { new: true, runValidators: true },
  ).exec();
};

export const updateEmployeeManagerById = (id: string, managerId: string | null) => {
  return EmployeeModel.findOneAndUpdate(
    { _id: id, deleted: false },
    { manager: managerId },
    { new: true, runValidators: true },
  ).exec();
};

export const findEmployees = async (query: EmployeeListQuery, accessFilter: EmployeeFilter = {}) => {
  const filter: EmployeeFilter = {
    deleted: false,
    ...accessFilter,
  };

  if (query.search) {
    const searchRegex = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { employeeId: searchRegex },
      { department: searchRegex },
    ];
  }

  if (query.department) {
    filter.department = new RegExp(`^${escapeRegex(query.department)}$`, "i");
  }

  if (query.role) {
    filter.role = query.role;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const skip = (query.page - 1) * query.limit;
  const sortDirection: SortOrder = query.sortOrder === "asc" ? 1 : -1;
  const sort = {
    [query.sortBy]: sortDirection,
    _id: sortDirection,
  };

  const [employees, totalRecords] = await Promise.all([
    EmployeeModel.find(filter).sort(sort).skip(skip).limit(query.limit).exec(),
    EmployeeModel.countDocuments(filter).exec(),
  ]);

  return {
    employees,
    totalRecords,
  };
};

export const searchEmployees = (search: string, limit = 8) => {
  const searchRegex = new RegExp(escapeRegex(search), "i");

  return EmployeeModel.find({
    deleted: false,
    $or: [
      { name: searchRegex },
      { email: searchRegex },
      { employeeId: searchRegex },
      { department: searchRegex },
    ],
  })
    .sort({ name: 1, _id: 1 })
    .limit(limit)
    .exec();
};

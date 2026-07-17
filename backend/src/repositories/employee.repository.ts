import { Types, type FilterQuery, type SortOrder, type UpdateQuery } from "mongoose";

import { EmployeeModel, type EmployeeDocument } from "../models/employee.model";
import type { EmployeeListQuery, EmployeePayload, EmployeeUpdatePayload } from "../types/employee";
import { generateEmployeeId } from "../utils/employee-id";

type EmployeeFilter = FilterQuery<EmployeeDocument>;

export const ACTIVE_EMPLOYEE_FILTER: EmployeeFilter = {
  deleted: { $ne: true },
  isDeleted: { $ne: true },
};

export const DELETED_EMPLOYEE_FILTER: EmployeeFilter = {
  $or: [{ deleted: true }, { isDeleted: true }],
};

const escapeRegex = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const toObjectId = (id: string) => {
  return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
};

const createListFilter = (query: EmployeeListQuery, baseFilter: EmployeeFilter) => {
  const filters: EmployeeFilter[] = [baseFilter];

  if (query.search) {
    const searchRegex = new RegExp(escapeRegex(query.search), "i");
    filters.push({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { department: searchRegex },
      ],
    });
  }

  if (query.department) {
    filters.push({
      department: new RegExp(`^${escapeRegex(query.department)}$`, "i"),
    });
  }

  if (query.role) {
    filters.push({ role: query.role });
  }

  if (query.status) {
    filters.push({ status: query.status });
  }

  return filters.length === 1 ? filters[0] : { $and: filters };
};

const findEmployeesByListFilter = async (query: EmployeeListQuery, filter: EmployeeFilter) => {
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

export const createEmployee = async (payload: EmployeePayload) => {
  const employeeId = payload.employeeId ?? (await generateEmployeeId());

  return EmployeeModel.create({
    ...payload,
    deleted: false,
    deletedAt: null,
    deletedBy: null,
    employeeId,
    isDeleted: false,
    manager: payload.manager ?? null,
  });
};

export const findEmployeeById = (id: string) => {
  return EmployeeModel.findOne({ _id: id, ...ACTIVE_EMPLOYEE_FILTER }).exec();
};

export const findEmployeeByIdIncludingDeleted = (id: string) => {
  return EmployeeModel.findById(id).exec();
};

export const findEmployeeByEmail = (email: string) => {
  return EmployeeModel.findOne({ email, ...ACTIVE_EMPLOYEE_FILTER }).exec();
};

export const findEmployeeByEmailIncludingDeleted = (email: string) => {
  return EmployeeModel.findOne({ email }).exec();
};

export const findEmployeesByIds = (ids: string[]) => {
  if (ids.length === 0) {
    return Promise.resolve([]);
  }

  return EmployeeModel.find({ _id: { $in: ids }, ...ACTIVE_EMPLOYEE_FILTER }).exec();
};

export const findAllEmployees = () => {
  return EmployeeModel.find(ACTIVE_EMPLOYEE_FILTER).sort({ name: 1, _id: 1 }).exec();
};

export const findManagerCandidates = () => {
  return EmployeeModel.find({ ...ACTIVE_EMPLOYEE_FILTER, status: "ACTIVE" })
    .sort({ name: 1, _id: 1 })
    .exec();
};

export const updateEmployeeById = (id: string, payload: EmployeeUpdatePayload) => {
  const update: UpdateQuery<EmployeeDocument> = {
    ...payload,
  };

  delete update.employeeId;

  if (payload.profileImage === null) {
    delete update.profileImage;
    update.$unset = {
      profileImage: "",
    };
  }

  if (payload.manager === undefined) {
    delete update.manager;
  } else {
    update.manager = payload.manager ?? null;
  }

  return EmployeeModel.findOneAndUpdate({ _id: id, ...ACTIVE_EMPLOYEE_FILTER }, update, {
    new: true,
    runValidators: true,
  }).exec();
};

export const softDeleteEmployeeById = (id: string, deletedBy: string) => {
  return EmployeeModel.findOneAndUpdate(
    { _id: id, ...ACTIVE_EMPLOYEE_FILTER },
    {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: toObjectId(deletedBy),
      isDeleted: true,
    },
    { new: true },
  ).exec();
};

export const restoreEmployeeById = (id: string) => {
  return EmployeeModel.findOneAndUpdate(
    { _id: id, ...DELETED_EMPLOYEE_FILTER },
    {
      $set: {
        deleted: false,
        isDeleted: false,
      },
      $unset: {
        deletedAt: "",
        deletedBy: "",
      },
    },
    { new: true, runValidators: true },
  ).exec();
};

export const hardDeleteEmployeeById = (id: string) => {
  return EmployeeModel.findOneAndDelete({ _id: id, ...DELETED_EMPLOYEE_FILTER }).exec();
};

export const restoreEmployeesByIds = async (ids: string[]) => {
  if (ids.length === 0) {
    return {
      matchedCount: 0,
      modifiedCount: 0,
    };
  }

  const result = await EmployeeModel.updateMany(
    { _id: { $in: ids }, ...DELETED_EMPLOYEE_FILTER },
    {
      $set: {
        deleted: false,
        isDeleted: false,
      },
      $unset: {
        deletedAt: "",
        deletedBy: "",
      },
    },
    { runValidators: true },
  ).exec();

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  };
};

export const hardDeleteEmployeesByIds = async (ids: string[]) => {
  if (ids.length === 0) {
    return {
      deletedCount: 0,
    };
  }

  const result = await EmployeeModel.deleteMany({
    _id: { $in: ids },
    ...DELETED_EMPLOYEE_FILTER,
  }).exec();

  return {
    deletedCount: result.deletedCount,
  };
};

export const updateEmployeeStatusById = (id: string, status: EmployeeDocument["status"]) => {
  return EmployeeModel.findOneAndUpdate(
    { _id: id, ...ACTIVE_EMPLOYEE_FILTER },
    { status },
    { new: true, runValidators: true },
  ).exec();
};

export const updateEmployeeRoleById = (id: string, role: EmployeeDocument["role"]) => {
  return EmployeeModel.findOneAndUpdate(
    { _id: id, ...ACTIVE_EMPLOYEE_FILTER },
    { role },
    { new: true, runValidators: true },
  ).exec();
};

export const updateEmployeeManagerById = (id: string, managerId: string | null) => {
  return EmployeeModel.findOneAndUpdate(
    { _id: id, ...ACTIVE_EMPLOYEE_FILTER },
    { manager: managerId },
    { new: true, runValidators: true },
  ).exec();
};

export const findEmployees = async (query: EmployeeListQuery) => {
  return findEmployeesByListFilter(query, createListFilter(query, ACTIVE_EMPLOYEE_FILTER));
};

export const findDeletedEmployees = async (query: EmployeeListQuery) => {
  return findEmployeesByListFilter(query, createListFilter(query, DELETED_EMPLOYEE_FILTER));
};

export const searchEmployees = (search: string, limit = 8) => {
  const searchRegex = new RegExp(escapeRegex(search), "i");

  return EmployeeModel.find({
    ...ACTIVE_EMPLOYEE_FILTER,
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

export const countEmployees = (filter: EmployeeFilter = ACTIVE_EMPLOYEE_FILTER) => {
  return EmployeeModel.countDocuments(filter).exec();
};

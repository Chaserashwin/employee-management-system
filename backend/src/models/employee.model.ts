import { model, models, Schema, Types, type Document, type Model } from "mongoose";

import {
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUSES,
  type EmployeeRole,
  type EmployeeStatus,
} from "../constants/employee";

export interface EmployeeDocument extends Document {
  createdAt: Date;
  deleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: Types.ObjectId | null;
  department: string;
  designation: string;
  email: string;
  employeeId: string;
  isDeleted: boolean;
  joiningDate: Date;
  manager: Types.ObjectId | null;
  name: string;
  phone: string;
  profileImage?: string;
  role: EmployeeRole;
  salary: number;
  status: EmployeeStatus;
  updatedAt: Date;
}

const transformEmployee = (_document: unknown, returnedObject: Record<string, unknown>) => {
  returnedObject.id = returnedObject._id?.toString();

  delete returnedObject._id;
  delete returnedObject.__v;

  return returnedObject;
};

const employeeSchema = new Schema<EmployeeDocument>(
  {
    employeeId: {
      index: true,
      required: true,
      trim: true,
      type: String,
      unique: true,
    },
    name: {
      index: true,
      required: true,
      trim: true,
      type: String,
    },
    email: {
      index: true,
      lowercase: true,
      required: true,
      trim: true,
      type: String,
      unique: true,
    },
    phone: {
      required: true,
      trim: true,
      type: String,
    },
    department: {
      index: true,
      required: true,
      trim: true,
      type: String,
    },
    designation: {
      required: true,
      trim: true,
      type: String,
    },
    salary: {
      min: 0,
      required: true,
      type: Number,
    },
    joiningDate: {
      index: true,
      required: true,
      type: Date,
    },
    status: {
      default: "ACTIVE",
      enum: EMPLOYEE_STATUSES,
      index: true,
      required: true,
      type: String,
    },
    role: {
      enum: EMPLOYEE_ROLES,
      index: true,
      required: true,
      type: String,
    },
    manager: {
      default: null,
      ref: "Employee",
      type: Schema.Types.ObjectId,
    },
    profileImage: {
      type: String,
    },
    deleted: {
      default: false,
      index: true,
      required: true,
      type: Boolean,
    },
    isDeleted: {
      default: false,
      index: true,
      required: true,
      type: Boolean,
    },
    deletedAt: {
      default: null,
      type: Date,
    },
    deletedBy: {
      default: null,
      ref: "User",
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: transformEmployee,
    },
    toObject: {
      transform: transformEmployee,
    },
  },
);

employeeSchema.index({ deleted: 1, department: 1, role: 1, status: 1 });
employeeSchema.index({ deleted: 1, name: 1 });
employeeSchema.index({ deleted: 1, joiningDate: -1 });
employeeSchema.index({ isDeleted: 1, department: 1, role: 1, status: 1 });
employeeSchema.index({ isDeleted: 1, name: 1 });
employeeSchema.index({ isDeleted: 1, joiningDate: -1 });
employeeSchema.index({ manager: 1, isDeleted: 1, status: 1 });

export const EmployeeModel =
  (models.Employee as Model<EmployeeDocument> | undefined) ||
  model<EmployeeDocument>("Employee", employeeSchema);

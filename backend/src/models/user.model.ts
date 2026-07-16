import bcrypt from "bcrypt";
import { model, models, Schema, type Document, type Model } from "mongoose";

import { USER_ROLES, USER_STATUSES, type UserRole, type UserStatus } from "../constants/user";

const PASSWORD_SALT_ROUNDS = 12;

export interface UserDocument extends Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  updatedAt: Date;
}

const removePrivateFields = (_document: unknown, returnedObject: Record<string, unknown>) => {
  returnedObject.id = returnedObject._id?.toString();

  delete returnedObject._id;
  delete returnedObject.__v;
  delete returnedObject.password;

  return returnedObject;
};

const userSchema = new Schema<UserDocument>(
  {
    name: {
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
    password: {
      required: true,
      select: false,
      type: String,
    },
    role: {
      enum: USER_ROLES,
      required: true,
      type: String,
    },
    status: {
      default: "ACTIVE",
      enum: USER_STATUSES,
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: removePrivateFields,
    },
    toObject: {
      transform: removePrivateFields,
    },
  },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, PASSWORD_SALT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel =
  (models.User as Model<UserDocument> | undefined) || model<UserDocument>("User", userSchema);

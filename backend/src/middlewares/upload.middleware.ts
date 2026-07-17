import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import multer from "multer";

import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../utils/app-error";

const EMPLOYEE_UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "employees");
const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_EMPLOYEE_CSV_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_MIME_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);
const ALLOWED_EMPLOYEE_CSV_MIME_TYPES = new Set([
  "application/csv",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain",
]);

fs.mkdirSync(EMPLOYEE_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(_request, _file, callback) {
    callback(null, EMPLOYEE_UPLOAD_DIR);
  },
  filename(_request, file, callback) {
    const extension = ALLOWED_PROFILE_IMAGE_MIME_TYPES.get(file.mimetype) ?? ".bin";
    const filename = `${Date.now()}-${randomUUID()}${extension}`;

    callback(null, filename);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_request, file, callback) => {
  if (!ALLOWED_PROFILE_IMAGE_MIME_TYPES.has(file.mimetype)) {
    callback(
      new AppError(
        "Profile image must be a JPG, PNG, or WebP file.",
        HTTP_STATUS.BAD_REQUEST,
      ),
    );
    return;
  }

  callback(null, true);
};

export const uploadProfileImage = multer({
  fileFilter,
  limits: {
    fileSize: MAX_PROFILE_IMAGE_SIZE_BYTES,
  },
  storage,
}).single("profileImage");

export const uploadEmployeeCsv = multer({
  fileFilter(_request, file, callback) {
    const isCsvMimeType = ALLOWED_EMPLOYEE_CSV_MIME_TYPES.has(file.mimetype);
    const isCsvExtension = file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsvMimeType && !isCsvExtension) {
      callback(new AppError("Employee import must be a CSV file.", HTTP_STATUS.BAD_REQUEST));
      return;
    }

    callback(null, true);
  },
  limits: {
    fileSize: MAX_EMPLOYEE_CSV_SIZE_BYTES,
  },
  storage: multer.memoryStorage(),
}).single("file");

export const toUploadedEmployeeImageUrl = (file: Express.Multer.File | undefined) => {
  if (!file) {
    return undefined;
  }

  return `/uploads/employees/${file.filename}`;
};

import fs from "node:fs";
import path from "node:path";

import multer from "multer";

import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../utils/app-error";

const EMPLOYEE_UPLOAD_DIR = path.resolve(process.cwd(), "uploads", "employees");
const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

fs.mkdirSync(EMPLOYEE_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(_request, _file, callback) {
    callback(null, EMPLOYEE_UPLOAD_DIR);
  },
  filename(_request, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    callback(null, filename);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_request, file, callback) => {
  if (!file.mimetype.startsWith("image/")) {
    callback(new AppError("Profile image must be an image file.", HTTP_STATUS.BAD_REQUEST));
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

export const toUploadedEmployeeImageUrl = (file: Express.Multer.File | undefined) => {
  if (!file) {
    return undefined;
  }

  return `/uploads/employees/${file.filename}`;
};

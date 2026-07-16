import { CounterModel } from "../models/counter.model";

const EMPLOYEE_COUNTER_KEY = "employee";

export const generateEmployeeId = async () => {
  const counter = await CounterModel.findByIdAndUpdate(
    EMPLOYEE_COUNTER_KEY,
    { $inc: { seq: 1 } },
    { new: true, setDefaultsOnInsert: true, upsert: true },
  ).exec();

  return `EMP${String(counter.seq).padStart(4, "0")}`;
};

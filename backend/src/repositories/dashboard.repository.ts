import { EmployeeModel } from "../models/employee.model";

const ACTIVE_EMPLOYEE_FILTER = { deleted: false };

export const getEmployeeDashboardCounts = async () => {
  const [totalEmployees, activeEmployees, inactiveEmployees, departments, managers, recentHires] =
    await Promise.all([
      EmployeeModel.countDocuments(ACTIVE_EMPLOYEE_FILTER).exec(),
      EmployeeModel.countDocuments({ ...ACTIVE_EMPLOYEE_FILTER, status: "ACTIVE" }).exec(),
      EmployeeModel.countDocuments({ ...ACTIVE_EMPLOYEE_FILTER, status: "INACTIVE" }).exec(),
      EmployeeModel.distinct("department", ACTIVE_EMPLOYEE_FILTER).exec(),
      EmployeeModel.distinct("manager", {
        ...ACTIVE_EMPLOYEE_FILTER,
        manager: { $ne: null },
      }).exec(),
      EmployeeModel.countDocuments({
        ...ACTIVE_EMPLOYEE_FILTER,
        joiningDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
        },
      }).exec(),
    ]);

  return {
    activeEmployees,
    departments: departments.length,
    inactiveEmployees,
    managers: managers.length,
    recentHires,
    totalEmployees,
  };
};

export const getDistribution = async (field: "department" | "role" | "status") => {
  return EmployeeModel.aggregate<{ _id: string; value: number }>([
    { $match: ACTIVE_EMPLOYEE_FILTER },
    { $group: { _id: `$${field}`, value: { $sum: 1 } } },
    { $sort: { value: -1, _id: 1 } },
  ]).exec();
};

export const getMonthlyJoiningTrend = async () => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  return EmployeeModel.aggregate<{ _id: { month: number; year: number }; value: number }>([
    {
      $match: {
        ...ACTIVE_EMPLOYEE_FILTER,
        joiningDate: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$joiningDate" },
          year: { $year: "$joiningDate" },
        },
        value: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]).exec();
};

export const getRecentEmployees = (limit = 6) => {
  return EmployeeModel.find(ACTIVE_EMPLOYEE_FILTER)
    .sort({ joiningDate: -1, createdAt: -1 })
    .limit(limit)
    .exec();
};

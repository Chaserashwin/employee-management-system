import { HTTP_STATUS } from "../constants/http-status";
import { getDashboardSummary } from "../services/dashboard.service";
import { asyncHandler } from "../utils/async-handler";
import { createSuccessResponse } from "../utils/response";

export const getDashboard = asyncHandler(async (_request, response) => {
  const dashboard = await getDashboardSummary();

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(dashboard, "Dashboard retrieved."));
});

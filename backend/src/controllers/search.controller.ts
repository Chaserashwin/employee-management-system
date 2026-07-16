import { HTTP_STATUS } from "../constants/http-status";
import { getGlobalSearchResults } from "../services/dashboard.service";
import { asyncHandler } from "../utils/async-handler";
import { createSuccessResponse } from "../utils/response";

export const search = asyncHandler(async (request, response) => {
  const results = await getGlobalSearchResults(String(request.query.q ?? ""));

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(results, "Search results retrieved."));
});

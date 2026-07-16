import { getOrganizationTree } from "../services/employee.service";
import { asyncHandler } from "../utils/async-handler";
import { createSuccessResponse } from "../utils/response";
import { HTTP_STATUS } from "../constants/http-status";

export const getTree = asyncHandler(async (_request, response) => {
  const tree = await getOrganizationTree();

  response.status(HTTP_STATUS.OK).json(createSuccessResponse(tree, "Organization tree retrieved."));
});

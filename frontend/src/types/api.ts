export type ApiResponse<TData = unknown> = {
  data: TData;
  error?: unknown;
  message: string;
  success: boolean;
};

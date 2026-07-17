export const DATABASE_UNAVAILABLE_MESSAGE =
  "Database unavailable. Please verify MongoDB connection and try again.";

const databaseErrorPattern =
  /(server selection|buffering timed out|before initial connection is complete|connect ETIMEDOUT|ECONNREFUSED|ENOTFOUND|querySrv|topology was destroyed)/i;

export const isDatabaseConnectionError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "MongoServerSelectionError" ||
    error.name === "MongooseServerSelectionError" ||
    databaseErrorPattern.test(error.message)
  );
};

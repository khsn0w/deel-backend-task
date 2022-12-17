const express = require("express");
const bodyParser = require("body-parser");
const { dbConnection } = require("./dataLayer");
const { contractController } = require("./controllers/contract.controller");
const { getProfile } = require("./middleware/getProfile");
const { jobController } = require("./controllers/job.controller");
const { balanceController } = require("./controllers/balance.controller");
const { adminController } = require("./controllers/admin.controller");
const ApiError = require("./utils/errors/ApiError");
const expressWinston = require("express-winston");
const { getLoggerConfig, logger } = require("./utils/logger");
const app = express();
app.use(bodyParser.json());
const swaggerUi = require("swagger-ui-express");
const swaggerSpecifications = require("./utils/swagger.json");
if (process.env.NODE_ENV !== "test") {
  app.use(expressWinston.logger(getLoggerConfig()));
}

if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecifications));
}
/* Sequelize injection */
app.set("sequelize", dbConnection);
app.set("models", dbConnection.models);
/* Without getProfile endpoints */
app.use("/admin", adminController);
/* With getProfile endpoints */
app.use(getProfile);
app.use("/contracts", contractController);
app.use("/jobs", jobController);
app.use("/balances", balanceController);

app.use((error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }
  logger.error(error);
  // default error
  res.status(500).json({
    error: "Internal server error",
  });
});
module.exports = app;

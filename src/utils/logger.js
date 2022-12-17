const { createLogger } = require("winston");
const winston = require("winston");
const getLoggerConfig = () => ({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.json()),
  colorize: true,
  meta: false,
  level: process.env.LOG_LEVEL || "debug",
});
const logger = createLogger(getLoggerConfig());

module.exports = {
  logger,
  getLoggerConfig,
};

const { Sequelize } = require("sequelize");
const { logger } = require("../utils/logger");
/*
    As mentioned in the DOCS https://sequelize.org/docs/v6/getting-started/#closing-the-connection
    Sequelize will make sure that one
    connection will be used for all queries

 */
const dbConnection = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
  logging: (sql) => {
    logger.debug(sql);
  },
});

module.exports = {
  dbConnection,
};

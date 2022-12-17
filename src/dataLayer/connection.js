const { Sequelize } = require("sequelize");
/*
    Connection should be a singleton
 */
const ConnectionFactory = (function () {
  let instance = null;
  return {
    getInstance: function () {
      if (instance == null) {
        instance = new Sequelize({
          dialect: "sqlite",
          storage: "./database.sqlite3",
        });
      }
      return instance;
    },
  };
})();
const dbConnection = ConnectionFactory.getInstance();
module.exports = {
  dbConnection,
};

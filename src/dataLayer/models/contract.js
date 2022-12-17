const { Model, DataTypes } = require("sequelize");
const { dbConnection } = require("../connection");

class Contract extends Model {}
Contract.init(
  {
    terms: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("new", "in_progress", "terminated"),
    },
  },
  {
    sequelize: dbConnection,
    modelName: "Contract",
  }
);

module.exports = {
  Contract,
};

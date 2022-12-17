const { Sequelize } = require("sequelize");
process.env.LOG_LEVEL = "info";
process.env.ENVIRONMENT = "test";
jest.setTimeout(100000000);
let inMemoryDbConnection;
const mockInMemoryDbConnection = () => {
  if (!inMemoryDbConnection)
    inMemoryDbConnection = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });
  return inMemoryDbConnection;
};
jest.mock("./src/dataLayer/connection", () => ({
  dbConnection: mockInMemoryDbConnection(),
}));

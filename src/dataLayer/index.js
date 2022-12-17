const { dbConnection } = require("./connection");
const { Contract, Profile, Job } = require("./schema.setup");
module.exports = {
  Job,
  Profile,
  Contract,
  dbConnection,
};

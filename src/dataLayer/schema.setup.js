const { Profile } = require("./models/profile");
const { Contract } = require("./models/contract");
const { Job } = require("./models/job");

Profile.hasMany(Contract, { as: "Contractor", foreignKey: "ContractorId" });
Contract.belongsTo(Profile, { as: "Contractor" });
Profile.hasMany(Contract, { as: "Client", foreignKey: "ClientId" });
Contract.belongsTo(Profile, { as: "Client" });
Contract.hasMany(Job);
Job.belongsTo(Contract);

module.exports = {
  Profile,
  Contract,
  Job,
};

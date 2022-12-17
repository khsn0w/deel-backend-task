const { Op } = require("sequelize");
const { Contract: ContractModel } = require("../dataLayer");
const getAllContracts = (profileId) =>
  ContractModel.findAll({
    where: {
      [Op.and]: {
        status: {
          [Op.ne]: "terminated",
        },
        [Op.or]: {
          ContractorId: profileId,
          ClientId: profileId,
        },
      },
    },
  });
const getContract = (contractId) =>
  ContractModel.findOne({ where: { id: contractId } });

module.exports = {
  getAllContracts,
  getContract,
};

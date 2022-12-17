const { Op } = require("sequelize");

const canAccessContract = async (req, res, next) => {
  const contractId = req.params.id;
  if (!contractId) return res.status(403).end();
  const connectedUserProfile = req.connectedUserProfile;
  const { Contract: ContractModel } = req.app.get("models");
  const contractBelongsToUser = await ContractModel.findOne({
    where: {
      [Op.and]: {
        id: contractId,
        [Op.or]: {
          ContractorId: connectedUserProfile.id,
          ClientId: connectedUserProfile.id,
        },
      },
    },
  });
  if (!contractBelongsToUser) return res.status(403).end();
  next();
};

module.exports = canAccessContract;

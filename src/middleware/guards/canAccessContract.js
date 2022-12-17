const { getContract } = require("../../services/contract.service");

const canAccessContract = async (req, res, next) => {
  const contractId = req.params.id;
  if (!contractId) return res.status(403).end();
  const { id: profileId } = req.connectedUserProfile;
  const contract = await getContract(contractId);

  if (
    !contract ||
    (contract.ContractorId !== profileId && contract.ClientId !== profileId)
  )
    return res.status(403).end();
  next();
};

module.exports = canAccessContract;

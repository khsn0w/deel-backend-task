/**
 * This guard will make sure that the connected user
 * owns the job and the contract is in_progress
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const canPayJob = async (req, res, next) => {
  const { job_id: jobId } = req.params;
  if (!jobId) return res.status(400).end();
  const { id: profileId } = req.connectedUserProfile;
  const { Job: JobModel, Contract: ContractModel } = req.app.get("models");
  const jobToBePaid = await JobModel.findOne({
    where: {
      id: jobId,
    },
    include: {
      model: ContractModel,
      as: "Contract",
      where: {
        ClientId: profileId,
      },
    },
    attributes: ["id"],
  });
  if (!jobToBePaid) return res.status(403).end();
  next();
};

module.exports = canPayJob;

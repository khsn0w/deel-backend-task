/**
 * This guard will make sure that the connected user
 * owns the job and the contract is in_progress
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const { getJobWithClientById } = require("../../services/job.service.ts");
const canPayJob = async (req, res, next) => {
  const { job_id: jobId } = req.params;
  if (!jobId) return res.status(400).end();
  const { id: profileId } = req.connectedUserProfile;
  const jobToBePaid = await getJobWithClientById(jobId, profileId);
  if (!jobToBePaid) return res.status(404).end();
  if (jobToBePaid.Contract.ClientId !== profileId) return res.status(403).end();
  next();
};

module.exports = canPayJob;

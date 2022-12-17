const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");

const canPayJob = require("../middleware/guards/canPayJob");
const { getUnpaidJobs, payJob } = require("../services/job.service.ts");

router.get(
  "/unpaid",
  expressAsyncHandler(async (req, res) => {
    const { id: profileId } = req.connectedUserProfile;
    const unpaidJobs = await getUnpaidJobs(profileId);
    res.json(unpaidJobs);
  })
);

router.post(
  "/:job_id/pay",
  canPayJob,
  expressAsyncHandler(async (req, res) => {
    const { job_id: jobId } = req.params;
    const { id: profileId } = req.connectedUserProfile;
    const updatedProfile = await payJob(jobId, profileId);
    res.json(updatedProfile);
  })
);

module.exports = {
  jobController: router,
};

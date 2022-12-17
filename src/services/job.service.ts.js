const { Op } = require("sequelize");
const {
  Job: JobModel,
  Contract: ContractModel,
  Profile: ProfileModel,
  dbConnection,
} = require("../dataLayer");
const ApiError = require("../utils/errors/ApiError");
const getUnpaidJobs = (profileId) =>
  JobModel.findAll({
    include: {
      model: ContractModel,
      as: "Contract",
      where: {
        [Op.and]: {
          status: {
            [Op.eq]: "in_progress",
          },
          [Op.or]: {
            ContractorId: profileId,
            ClientId: profileId,
          },
        },
      },
    },
    where: {
      paid: false,
    },
    /* Selecting fewer data for efficiency*/
    attributes: ["id", "description", "price", "ContractId"],
    includeIgnoreAttributes: false,
  });

const payJob = (jobId, profileId) =>
  dbConnection.transaction(async (t) => {
    const jobToBePaid = await JobModel.findOne({
      transaction: t,
      where: {
        id: jobId,
      },
      include: {
        model: ContractModel,
        as: "Contract",
        where: {
          ClientId: profileId,
        },
        attributes: ["ContractorId"],
      },
    });
    if (!jobToBePaid)
      throw new ApiError(404, "Job with this criteria not found");
    if (jobToBePaid.paid) throw new ApiError(409, "Job already paid");

    const [clientProfile, contractorToBePaid] = await Promise.all([
      ProfileModel.findByPk(profileId, { transaction: t }),
      ProfileModel.findByPk(jobToBePaid.Contract.ContractorId, {
        transaction: t,
      }),
    ]);
    const profileNewBalance = clientProfile.balance - jobToBePaid.price;
    if (profileNewBalance < 0)
      throw new ApiError(400, "Insufficient balance, deposit and try later!");
    clientProfile.balance = profileNewBalance;
    jobToBePaid.paid = true;
    jobToBePaid.paymentDate = new Date();
    contractorToBePaid.balance += jobToBePaid.price;
    await Promise.all([
      clientProfile.save({
        transaction: t,
      }),
      jobToBePaid.save({
        transaction: t,
      }),
      contractorToBePaid.save({ transaction: t }),
    ]);
    return clientProfile;
  });
module.exports = {
  getUnpaidJobs,
  payJob,
};

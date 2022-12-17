const {
  dbConnection,
  Job: JobModel,
  Contract: ContractModel,
} = require("../dataLayer");
const ApiError = require("../utils/errors/ApiError");
const getClientUnpaidJobsSum = async (clientId) => {
  return JobModel.sum("price", {
    where: {
      paid: false,
    },
    include: [
      {
        model: ContractModel,
        required: true,
        attributes: [],
        where: {
          status: "in_progress",
          ClientId: clientId,
        },
      },
    ],
  });
};

const deposit = (client, receiverId, amount) =>
  dbConnection.transaction(async (t) => {
    const unpaidSum = await getClientUnpaidJobsSum(
      client.id,
      JobModel,
      ContractModel
    );
    const depositThreshold = unpaidSum * 0.25;
    if (amount > depositThreshold)
      throw new ApiError(400, "Deposit limit exceeded");
    const amountParsed = parseFloat(amount);
    client.balance = client.balance + amountParsed;
    await client.save({ transaction: t });
    return client;
  });

module.exports = {
  deposit,
};

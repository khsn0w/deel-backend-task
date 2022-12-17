const {
  dbConnection,
  Job: JobModel,
  Contract: ContractModel,
  Profile: ProfileModel,
} = require("../dataLayer");
const { Op } = require("sequelize");
const getMostEarningProfessionWithinDateRange = async (startDate, endDate) => {
  const mostPaidProfessionWithinGivenRange = await JobModel.findOne({
    attributes: [
      [dbConnection.fn("sum", dbConnection.col("price")), "totalEarned"],
    ],
    order: [[dbConnection.fn("sum", dbConnection.col("price")), "DESC"]],
    group: ["Contract.Contractor.profession"],
    where: {
      paid: true,
      // based on the readme it should be the period worked on not hte payment date
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [
      {
        model: ContractModel,
        as: "Contract",
        required: true,
        include: [
          {
            model: ProfileModel,
            as: "Contractor",
            required: true,
            where: { type: "contractor" },
            attributes: ["profession"],
          },
        ],
        attributes: ["id"],
      },
    ],
  });

  if (!mostPaidProfessionWithinGivenRange) {
    return {};
  }

  const plainResponse = mostPaidProfessionWithinGivenRange.get({ plain: true });
  return {
    profession: plainResponse.Contract.Contractor.profession,
  };
};

const getClientBySpendingWithinDateRange = async (
  startDate,
  endDate,
  limit
) => {
  const customersWithSpendingInfo = await JobModel.findAll({
    attributes: [
      [dbConnection.fn("sum", dbConnection.col("price")), "totalPaid"],
    ],
    order: [[dbConnection.fn("sum", dbConnection.col("price")), "DESC"]],
    group: ["Contract.Client.id"],
    limit,
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [
      {
        model: ContractModel,
        required: true,
        include: [
          {
            model: ProfileModel,
            as: "Client",
            required: true,
            where: { type: "client" },
            attributes: ["id", "firstName", "lastName"],
          },
        ],
        attributes: ["id"],
      },
    ],
  });

  return customersWithSpendingInfo.map((currentCustomerSpending) => {
    const plainCustomerWithSpending = currentCustomerSpending.get({
      plain: true,
    });
    return {
      paid: plainCustomerWithSpending.totalPaid,
      id: plainCustomerWithSpending.Contract.Client.id,
      fullName: `${plainCustomerWithSpending.Contract.Client.firstName} ${plainCustomerWithSpending.Contract.Client.lastName}`,
    };
  });
};

module.exports = {
  getMostEarningProfessionWithinDateRange,
  getClientBySpendingWithinDateRange,
};

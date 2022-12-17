const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");

const {
  getMostEarningProfessionWithinDateRange,
  getClientBySpendingWithinDateRange,
} = require("../services/admin.service");

router.get(
  "/best-profession",
  expressAsyncHandler(async (req, res) => {
    const { start: startDate, end: endDate } = req.query;

    const mostEarningProfession = await getMostEarningProfessionWithinDateRange(
      startDate,
      endDate
    );
    res.json(mostEarningProfession);
  })
);

router.get(
  "/best-clients",
  expressAsyncHandler(async (req, res) => {
    const { start: startDate, end: endDate, limit = 2 } = req.query;
    const response = await getClientBySpendingWithinDateRange(
      startDate,
      endDate,
      limit
    );

    res.json(response);
  })
);

module.exports = {
  adminController: router,
};

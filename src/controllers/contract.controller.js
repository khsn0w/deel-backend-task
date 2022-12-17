const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");

const canAccessContract = require("../middleware/guards/canAccessContract");
const {
  getAllContracts,
  getContract,
} = require("../services/contract.service");

router.get(
  "/:id",
  canAccessContract,
  expressAsyncHandler(async (req, res) => {
    const { id: contractId } = req.params;
    const contract = await getContract(contractId);
    if (!contract) return res.status(404).end();
    res.json(contract);
  })
);

router.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { id: profileId } = req.connectedUserProfile;
    const contracts = await getAllContracts(profileId);
    res.json(contracts);
  })
);
module.exports = {
  contractController: router,
};

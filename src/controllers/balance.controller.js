const express = require("express");
const router = express.Router();
const expressAsyncHandler = require("express-async-handler");

const { deposit } = require("../services/balance.service");
const ApiError = require("../utils/errors/ApiError");

router.post(
  "/deposit/:userId",
  expressAsyncHandler(async (req, res) => {
    const { id: profileId } = req.connectedUserProfile;
    const { userId: receiverId } = req.params;
    // I am assuming that you can only deposit to yourself
    if (profileId.toString() !== receiverId)
      throw new ApiError(400, "Deposit is only allowed to same profile");
    // only clients should be able to do this
    const client = req.connectedUserProfile;
    if (!client) throw new ApiError(404, "Client not found");
    if (client.type !== "client")
      throw new ApiError(400, "Only client are allowed to do a deposit");
    const { amount } = req.body;
    const updatedClient = await deposit(client, parseInt(receiverId), amount);
    res.json(updatedClient);
  })
);

module.exports = {
  balanceController: router,
};

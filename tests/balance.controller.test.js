const request = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/dataLayer");

describe("Balances", () => {
  describe("/balances/deposit/:userId", () => {
    beforeEach(async () => {
      await Profile.sync({ force: true });
      await Contract.sync({ force: true });
      await Job.sync({ force: true });

      await Promise.all([
        Profile.create({
          id: 1,
          firstName: "Harry",
          lastName: "Potter",
          profession: "Wizard",
          balance: 1150,
          type: "client",
        }),
        Profile.create({
          id: 2,
          firstName: "John",
          lastName: "Lenon",
          profession: "Musician",
          balance: 150,
          type: "contractor",
        }),
        Contract.create({
          id: 1,
          terms: "someTerms",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 2,
        }),
        Job.create({
          id: 1,
          description: "firstJob",
          price: 200,
          ContractId: 1,
          paid: true,
          paymentDate: "2022-12-17T09:00:00.737Z",
        }),
        Job.create({
          id: 2,
          description: "secondJob",
          price: 110,
          ContractId: 1,
          paid: false,
        }),
        Job.create({
          id: 3,
          description: "thirdJob",
          price: 300,
          ContractId: 1,
          paid: false,
        }),
      ]);
    });

    it("should return 400 if deposit exceeds the threshold of 0.25 of unpaid jobs sum", async () => {
      const { statusCode, body } = await request(app)
        .post("/balances/deposit/1")
        .set("profile_id", "1")
        .send({ amount: 102.6 });

      expect(statusCode).toEqual(400);
      expect(body.error).toEqual("Deposit limit exceeded");
    });

    it("should return 400 if given user is trying to deposit to another account", async () => {
      const { statusCode } = await request(app)
        .post("/balances/deposit/10")
        .set("profile_id", "1")
        .send({ amount: 100 });

      expect(statusCode).toEqual(400);
    });

    it("should return 400 if given user is not a client", async () => {
      const { statusCode } = await request(app)
        .post("/balances/deposit/2")
        .set("profile_id", "2")
        .send({ amount: 100 });
      expect(statusCode).toEqual(400);
    });

    it("should deposit successfully the amount to the client balance", async () => {
      const client = await Profile.findByPk(1);
      const { statusCode, body } = await request(app)
        .post("/balances/deposit/1")
        .set("profile_id", "1")
        .send({ amount: 50 });

      expect(statusCode).toEqual(200);
      expect(body).toEqual({
        id: 1,
        firstName: "Harry",
        lastName: "Potter",
        profession: "Wizard",
        balance: 1200.0,
        type: "client",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      const clientAfterUpdate = await Profile.findByPk(1);
      expect(clientAfterUpdate.balance).toEqual(client.balance + 50);
    });
  });
});

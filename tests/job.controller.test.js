const request = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/dataLayer");

describe("Job Endpoints", () => {
  describe("Get Unpaid jobs", () => {
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
          balance: 64,
          type: "contractor",
        }),
        Profile.create({
          id: 3,
          firstName: "Andy",
          lastName: "Warp",
          profession: "Runner",
          balance: 120,
          type: "contractor",
        }),
        // profile without contract
        Profile.create({
          id: 4,
          firstName: "John",
          lastName: "F.K",
          profession: "President",
          balance: 0,
          type: "client",
        }),
        Contract.create({
          id: 1,
          terms: "some terms",
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
          paymentDate: "2022-12-17T19:00:0.0Z",
        }),
        Job.create({
          id: 2,
          description: "secondJob",
          price: 250,
          ContractId: 1,
          paid: false,
        }),
        Contract.create({
          id: 2,
          terms: "someOtherTerms",
          status: "terminated",
          ClientId: 1,
          ContractorId: 3,
        }),
        Job.create({
          id: 3,
          description: "ThirdJob",
          price: 500,
          ContractId: 2,
          paid: false,
        }),
      ]);
    });
    it("should return unpaid jobs only for active contracts", async () => {
      const { statusCode, body } = await request(app)
        .get("/jobs/unpaid")
        .set("profile_id", "1");

      expect(statusCode).toEqual(200);
      expect(body).toHaveLength(1);
      expect(body).toEqual([
        {
          id: 2,
          description: "secondJob",
          price: 250,
          ContractId: 1,
          paid: false,
          paymentDate: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ]);
    });
  });
  describe("Pay job endpoint", () => {
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
          paymentDate: "2022-12-17T09:11:26.737Z",
        }),
        Job.create({
          id: 2,
          description: "secondJob",
          price: 2500,
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

    it("should return 404 when job is not found", async () => {
      const { statusCode } = await request(app)
        .post("/jobs/33/pay")
        .set("profile_id", "1");
      expect(statusCode).toEqual(404);
    });

    it("should return 409 when job is already paid", async () => {
      const { statusCode, body } = await request(app)
        .post("/jobs/1/pay")
        .set("profile_id", "1");
      expect(statusCode).toEqual(409);
      expect(body.error).toEqual("Job already paid");
    });

    it("should return 400 when client don't have enough funds", async () => {
      const { statusCode } = await request(app)
        .post("/jobs/2/pay")
        .set("profile_id", "1");
      expect(statusCode).toEqual(400);
    });

    it("contractor should get the money", async () => {
      const { statusCode } = await request(app)
        .post("/jobs/3/pay")
        .set("profile_id", "1");
      expect(statusCode).toEqual(200);
      const [client, contractor] = await Promise.all([
        Profile.findByPk(1),
        Profile.findByPk(2),
      ]);
      expect(client.balance).toEqual(850);
      expect(contractor.balance).toEqual(450);
    });

    it("should mark job as paid", async () => {
      const jobBeforePayment = await Job.findByPk(3);
      expect(jobBeforePayment.paid).toEqual(false);
      expect(jobBeforePayment.paymentDate).toBeFalsy();

      const { statusCode, body } = await request(app)
        .post("/jobs/3/pay")
        .set("profile_id", "1");

      expect(statusCode).toEqual(200);
      expect(body).toEqual({
        id: 1,
        firstName: "Harry",
        lastName: "Potter",
        profession: "Wizard",
        balance: 850,
        type: "client",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      const jobAfterPayment = await Job.findByPk(3);
      expect(jobAfterPayment.paid).toEqual(true);
      expect(jobAfterPayment.paymentDate).toBeTruthy();
    });
  });
});

const request = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/dataLayer");

describe("Contracts Endpoints", () => {
  describe("Get contract details", () => {
    beforeEach(async () => {
      await Profile.sync({ force: true });
      await Contract.sync({ force: true });
      await Job.sync({ force: true });
      await Promise.all([
        Profile.create({
          id: 3,
          firstName: "John",
          lastName: "Doe",
          profession: "Entrepreneur",
          balance: 1000,
          type: "client",
        }),
        Profile.create({
          id: 1,
          firstName: "Harry",
          lastName: "Potter",
          profession: "Wizard",
          balance: 1150,
          type: "client",
        }),
        Profile.create({
          id: 5,
          firstName: "John",
          lastName: "Lenon",
          profession: "Musician",
          balance: 64,
          type: "contractor",
        }),

        Contract.create({
          id: 1,
          terms: "bla bla bla",
          status: "terminated",
          ClientId: 1,
          ContractorId: 3,
        }),
      ]);
    });
    it("should un-authorise access if the given profile does not exist", async () => {
      await request(app)
        .get("/contracts/1")
        .set("profile_id", "4331")
        .expect(401);
    });
    it("should forbid access if the given profile does not own the contract", async () => {
      await request(app).get("/contracts/1").set("profile_id", "5").expect(403);
    });
    it("should return the requested contract if the profile have the required privileges", async () => {
      const { statusCode, body } = await request(app)
        .get("/contracts/1")
        .set("profile_id", "3");

      expect(statusCode).toEqual(200);
      expect(body).toMatchObject({
        id: 1,
        terms: "bla bla bla",
        status: "terminated",
        ClientId: 1,
        ContractorId: 3,
      });
    });
  });

  describe("Get contract list", () => {
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
          firstName: "Mr",
          lastName: "Robot",
          profession: "Hacker",
          balance: 231.11,
          type: "client",
        }),
        Contract.create({
          id: 1,
          terms: "bla bla bla",
          status: "terminated",
          ClientId: 1,
          ContractorId: 2,
        }),
        Contract.create({
          id: 2,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 2,
        }),
        Contract.create({
          id: 3,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 2,
          ContractorId: 2,
        }),
        Contract.create({
          id: 4,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 2,
          ContractorId: 2,
        }),
      ]);
    });
    it("should return active contract for a given client", async () => {
      const { statusCode, body } = await request(app)
        .get("/contracts")
        .set("profile_id", "1");

      expect(statusCode).toEqual(200);
      expect(body).toHaveLength(1);
      expect(body).toContainEqual(
        expect.objectContaining({
          id: 2,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 2,
        })
      );

      expect(body).not.toContainEqual(
        expect.objectContaining({
          id: 1,
          terms: "bla bla bla",
          status: "terminated",
          ClientId: 1,
          ContractorId: 2,
        })
      );
    });
  });
});

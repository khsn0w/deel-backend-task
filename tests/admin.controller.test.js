const request = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require("../src/dataLayer");

describe("Admin dashboard", () => {
  describe("Get highest earning profession", () => {
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
        Profile.create({
          id: 3,
          firstName: "Linus",
          lastName: "Torvalds",
          profession: "Programmer",
          balance: 1214,
          type: "contractor",
        }),
        Contract.create({
          id: 1,
          terms: "someTerms",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 2,
        }),
        Contract.create({
          id: 2,
          terms: "SomeOtherTerms",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 3,
        }),
        Job.create({
          id: 1,
          description: "firstJob",
          price: 200,
          ContractId: 1,
          paid: true,
          paymentDate: "2022-12-22T09:00:22.737Z",
          createdAt: "2022-11-22T06:10:22.737Z",
        }),
        Job.create({
          id: 2,
          description: "secondJob",
          price: 110,
          ContractId: 1,
          paid: true,
          paymentDate: "2022-12-22T09:00:22.737Z",
          createdAt: "2022-11-22T06:10:22.737Z",
        }),
        Job.create({
          id: 3,
          description: "thirdJob",
          price: 1500,
          ContractId: 2,
          paid: true,
          paymentDate: "2022-12-22T09:00:22.737Z",
          createdAt: "2022-11-22T06:10:22.737Z",
        }),
        Job.create({
          id: 4,
          description: "SomeDev",
          price: 200,
          ContractId: 2,
          paid: true,
          paymentDate: "2022-12-22T09:00:22.737Z",
          createdAt: "2022-11-22T06:10:22.737Z",
        }),
      ]);
    });

    it("should return profession earned the most in the given range", async () => {
      const { statusCode, body } = await request(app)
        .get("/admin/best-profession")
        .query({ start: "2022-11-01T09:00:00.000Z" })
        .query({ end: "2023-01-01T23:59:59.000Z" });

      expect(statusCode).toEqual(200);
      expect(body).toEqual({
        profession: "Programmer",
      });
    });

    it("should return empty object if there is no earning in the giving range", async () => {
      const { statusCode, body } = await request(app)
        .get("/admin/best-profession")
        .query({ start: "2021-03-01T09:00:00.000Z" }) // lockdown starts :p
        .query({ end: "2021-07-16T23:59:59.000Z" });

      expect(statusCode).toEqual(200);
      expect(body).toEqual({});
    });
  });

  describe("Get client list ordered by spending within a range", () => {
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
        Profile.create({
          id: 3,
          firstName: "John",
          lastName: "Snow",
          profession: "Knows nothing",
          balance: 451.3,
          type: "client",
        }),
        Profile.create({
          id: 4,
          firstName: "John",
          lastName: "Lenon",
          profession: "Musician",
          balance: 150,
          type: "contractor",
        }),
        Profile.create({
          id: 5,
          firstName: "Linus",
          lastName: "Torvalds",
          profession: "Programmer",
          balance: 1214,
          type: "contractor",
        }),
        Contract.create({
          id: 1,
          terms: "bla bla bla",
          status: "in_progress",
          ClientId: 1,
          ContractorId: 4,
        }),
        Contract.create({
          id: 2,
          terms: "for Linux",
          status: "in_progress",
          ClientId: 2,
          ContractorId: 5,
        }),
        Contract.create({
          id: 3,
          terms: "for Linux",
          status: "new",
          ClientId: 2,
          ContractorId: 5,
        }),
        Job.create({
          id: 1,
          description: "work 1",
          price: 200,
          ContractId: 1,
          paid: true,
          paymentDate: "2022-12-15T10:10:00.737Z",
        }),
        Job.create({
          id: 2,
          description: "work 2",
          price: 110,
          ContractId: 1,
          paid: true,
          paymentDate: "2022-12-15T10:10:00.737Z",
        }),
        Job.create({
          id: 3,
          description: "Linux core",
          price: 1000,
          ContractId: 2,
          paid: true,
          paymentDate: "2022-12-15T10:10:00.737Z",
        }),
        Job.create({
          id: 4,
          description: "Development",
          price: 200,
          ContractId: 2,
          paid: true,
          paymentDate: "1995-10-25T05:11:26.737Z",
        }),
        Job.create({
          id: 5,
          description: "CSM",
          price: 4000,
          ContractId: 3,
          paid: false,
        }),
      ]);
    });

    it("should return list of clients who paid most within given time range ORDERED by earnings", async () => {
      const { statusCode, body } = await request(app)
        .get("/admin/best-clients")
        .query({ start: "2022-12-01T00:00:00.000Z" })
        .query({ end: "2022-12-31T23:59:59.000Z" });

      expect(statusCode).toEqual(200);
      expect(body.length).toEqual(2);
      expect(body).toEqual([
        { fullName: "Mr Robot", id: 2, paid: 1000 },
        { fullName: "Harry Potter", id: 1, paid: 310 },
      ]);
    });

    it("should limit the list by query param", async () => {
      const { statusCode, body } = await request(app)
        .get("/admin/best-clients")
        .query({ start: "2022-12-01T00:00:00.000Z" })
        .query({ end: "2022-12-31T23:59:59.000Z" })
        .query({ limit: 1 });

      expect(statusCode).toEqual(200);
      expect(body).toHaveLength(1);
      expect(body).toEqual([{ fullName: "Mr Robot", id: 2, paid: 1000 }]);
    });

    it("should return [] if there are no jobs within given time range", async () => {
      const { statusCode, body } = await request(app)
        .get("/admin/best-clients")
        .query({ start: "2022-11-10T09:00:00.000Z" })
        .query({ end: "2022-11-16T23:59:59.000Z" });

      expect(statusCode).toEqual(200);
      expect(body).toHaveLength(0);
    });
  });
});

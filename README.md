# DEEL BACKEND TASK

  

💫 Welcome! 🎉


This backend exercise involves building a Node.js/Express.js app that will serve a REST API. 
I spent around 4h.

## Data Models

> **All models are defined in src/datalayer**

### Profile
A profile can be either a `client` or a `contractor`. 
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract
A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job
contractor get paid for jobs by clients under a certain contract.

## Run the App locally

The exercise requires [Node.js](https://nodejs.org/en/) to be installed. We recommend using the LTS version.

1. In the repo root directory, run `npm install` to gather all dependencies.
2. Next, `npm run seed` will seed the local SQLite database. The database lives in a local file `database.sqlite3`.
3. Then run `npm start` to start the API.



## Technical Notes

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.
- The database provider is SQLite, which will store data in a local file called `database.sqlite3` or in memory if you run tests. We use The ORM [Sequelize](http://docs.sequelizejs.com/)
- The server is running on port 3001.

  

## APIs

Once you run the server you will be abla to access swagger UI at [/api-docs](http://localhost:3001/api-docs).
  

## Running Tests
1. run `npm run test` to execute the implemented tests (_we opt out to develop only integration tests due to time limitations_).
  

## Improvements
Due to time limitation, I skipped some stuff that I will mention here:
- Add payload validation (Joi, express-validator, ...).
- I would like to have a better test fixtures and test cases (e.g Test concurrency in transactional scope).
- Add a pre-commit hook to run prettier and tests.
- Improve the swagger API documentation.
- I would also use Typescript instead of JS to minimize error at runtime.
- Containerize the app. 

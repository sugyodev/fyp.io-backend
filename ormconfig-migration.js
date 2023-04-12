const path = require("path");
const { entities } = require("./dist/common/service/DataSourceService");
const { DataSource } = require("typeorm");
const dotenv = require("dotenv");

dotenv.config();

if ((global).__isapp)
  throw new Error("Do not include this file inside application!");

module.exports = {
  default: new DataSource({
    name: "default",
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: false,
    migrationsRun: true,
    dropSchema: false,
    entities,
    migrations: [path.join(__dirname, "common/database/migrations", "*.*")],
    cli: {
      // entities,
      entitiesDir: path.join(__dirname, "common/database/entities"),
      migrationsDir: path.join(__dirname, "common/database/migrations"),
    },
  })
};

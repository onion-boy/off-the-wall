import { config } from "dotenv";

config();

import { ApplicationServer } from "./server/server";
import { DatabaseConnection } from "./database/connect";

// auto run
(async function main() {
  const server = new ApplicationServer();
  const db = new DatabaseConnection();

  server
    .link(db)
    .open();
})();

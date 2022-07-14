import { config } from "dotenv";

config();

import { ApplicationServer } from "./server";
import { DatabaseConnection } from "./database";
import { sideways } from "./server/sideways";

import { ProfilesController } from "./server/controllers/profiles";

export const server = new ApplicationServer();
export const db = new DatabaseConnection();

sideways(
  server.link(db),
  server.start([
    ProfilesController,
  ]),
).then();

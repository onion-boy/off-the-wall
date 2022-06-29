import { config } from "dotenv";

config();

import { ApplicationServer } from "./server";
import { DatabaseConnection } from "./database";
import { sideways } from "./server/sideways";
import { Profile } from "./database/actions/profiles";

export const server = new ApplicationServer();
export const db = new DatabaseConnection();

sideways(server.link(db), server.start())
  .then(async () => {
    const user = new Profile();
    const it = await user.CreateDefault("ezragoldner", "ezgoldner@gmail.com", "password");
    console.log(it);
  });

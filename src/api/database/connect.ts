import { Client } from "pg";
import constants, { Mode } from "../constants";
import { sideways } from "../server/sideways";
import { events } from "./events";

export class DatabaseConnection {
  public client: Client;

  constructor(
    private mode: Mode = "dev",
    private config = constants[mode].database.config,
  ) {
    this.client = new Client(config);
  }

  isReady() {
    return new Promise<void>((resolve) => {
      const { user, host, port, database } = this.config;
      const ready = new Promise<string>((res) => {
        events.on("ready", () => {
          res(
            `>> Connected to database server on ${user}@${host}:${port}/${database} in ${this.mode.toUpperCase()} mode.`,
          );
        });
      });

      sideways(this.client.connect(), ready)
        .then((msg) => {
          console.log(msg[0] || msg[1]);
          resolve();
        });
    });
  }
}

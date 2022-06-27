import { Client } from "pg";
import constants, { Mode } from "../constants";

export class DatabaseConnection {
  private client!: Client;

  constructor(
    private mode: Mode = "dev",
    private config = constants[mode].database.config,
  ) {
    this.client = new Client(config);
  }

  async isReady() {
    const { user, host, port, database } = this.config;
    await this.client.connect();
    console.log(
      `>> Connected to database server on ${user}@${host}:${port}/${database} in ${this.mode.toUpperCase()} mode.`,
    );
  }
}

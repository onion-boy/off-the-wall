import * as express from "express";
import { join } from "path";
import constants, { Mode } from "../constants";
import { DatabaseConnection } from "../database/connect";

export class ApplicationServer {
  database: DatabaseConnection;

  constructor(
    public app = express(),
  ) {}

  // implement middleware here
  link(database: DatabaseConnection) {
    const staticDir = express.static(
      join(__dirname, "../../src/public"),
    );
    const viewEngine = "pug";

    this.app.use(staticDir);
    this.app.set("view engine", viewEngine);
    this.app.set("views", join(__dirname, "../../src/views"));
    this.database = database;

    return database.isReady();
  }

  start(mode: Mode = "dev") {
    return new Promise<void>((resolve) => {
      const { serverPort, hostname } = constants[mode];
      const paths = ["home", "dashboard", "profile"];

      this.app.get("/", (_, res) => {
        res.redirect("home");
      });
      for (let i in paths) {
        this.app.get("/load/" + paths[i], (req, res) => {
          res.render(paths[i], { params: req.params });
        });
      }
      this.app.get("/*", (req, res) => {
        res.render("layout", { path: req.path, params: req.params });
      });

      this.app.listen(serverPort, hostname, () => {
        console.log(
          `>> Application server is now running on ${hostname}:${serverPort} in ${mode.toUpperCase()} mode.`,
        );
        resolve();
      });
    });
  }
}

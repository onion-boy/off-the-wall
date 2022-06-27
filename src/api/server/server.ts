import * as express from "express";
import { join } from "path";
import constants, { Mode } from "../constants";
import { DatabaseConnection } from "../database/connect";

export class ApplicationServer {
  private database!: DatabaseConnection;

  constructor(
    public app = express(),
  ) {
  }

  // implement middleware here
  link(database: DatabaseConnection) {
    const staticDir = express.static(
      join(__dirname, "../../src/public"),
    );
    const viewEngine = "pug";
    const self = this;

    this.app.use(staticDir);
    this.app.set("view engine", viewEngine);
    this.app.set("views", join(__dirname, "../../src/views"));
    this.database = database;

    return {
      open(mode: Mode = "dev") {
        database
          .isReady()
          .then(() => {
            self.start(mode);
          });
      },
    };
  }

  start(mode: Mode = "dev") {
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
    });
  }
}

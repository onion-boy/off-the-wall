import * as express from "express";
import { join } from "path";
import constants, { Mode } from "../constants";
import { DatabaseConnection } from "../database/connect";
import { Controller, controllers } from "./controllers";

export class ApplicationServer {
  database: DatabaseConnection;

  constructor(
    public app = express(),
  ) {}

  // implement middleware here
  link(database: DatabaseConnection) {
    const staticDir = express.static(
      join(__dirname, "../../../../src/public"),
    );
    const viewEngine = "pug";

    this.app.use(staticDir);
    this.app.set("view engine", viewEngine);
    this.app.set("views", __dirname + "/../../../../src/views");
    this.database = database;

    return database.isReady();
  }

  start(imports: (typeof Controller)[], mode: Mode = "dev") {
    return new Promise<void>((resolve) => {
      const { serverPort, hostname } = constants[mode];
      const paths = ["home", "dashboard", "profile"];

      for (let i in imports) {
        const imp = imports[i];
        const { actions } = controllers[imp.registeredName];
        for (let j in actions) {
          const action = actions[j];
          this.app[action.method](action.path, action.function);
        }
      }

      for (let i in paths) {
        this.app.get("/load/" + paths[i], (req, res) => {
          res.render(paths[i], { params: req.params });
        });
      }

      this.app.get("/", (_, res) => {
        res.redirect("home");
      });

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

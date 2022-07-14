import { Controller, controller, get } from "./controllers";
import { Request, Response } from "express";
import { Profile } from "../../database/actions/profiles";
import { simple } from "../../database/simplify";

@controller("/profiles", Profile)
export class ProfilesController extends Controller {

  @get("/:id")
  async retrieveProfile(req: Request, res: Response) {
    const user = await this.instance.findById(parseInt(req.params.id));
    res.json(
        simple(user)
    );
  }
}

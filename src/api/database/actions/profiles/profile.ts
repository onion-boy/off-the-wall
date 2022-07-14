import { does, Is, Model, use } from "..";

@use("profiles")
export class Profile extends Model {
  //
  @does(
    { create: "profile" },
    { create: "hash" },
  )
  signUp: Is<[username: string, email: string, password: string]>;

  @does({ select: "by username" })
  logInByUsername: Is<[username: string]>;

  @does({ select: "by id" })
  findById: Is<[id: number]>;
}

import { does, use, Model, Is } from "../actions";

@use("profiles")
export class Profile extends Model {
  @does("basic", "password")
  CreateDefault: Is<[username: string, email: string, password: string]>;
}

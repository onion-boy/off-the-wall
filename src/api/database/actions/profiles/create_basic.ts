import { DoesPrepare, register } from "../actions";

@register({
  provides: [1, 2],
})
export class CreateProfileBasic implements DoesPrepare {
  prepare(username: string, email: string) {
    const registered = new Date();
    return {
      query:
        `INSERT INTO profiles.basic (username, email, registered) VALUES ($1, $2, $3) RETURNING id`,
      args: [username, email, registered],
    };
  }
}

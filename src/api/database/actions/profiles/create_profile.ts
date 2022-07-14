import { DoesPrepare, register } from "..";

@register({
  provides: 2,
})
export class CreateProfile implements DoesPrepare {
  prepare(username: string, email: string) {
    const registered = new Date();
    return {
      query:
        `INSERT INTO profiles.basic (username, email, registered) VALUES ($1, $2, $3) RETURNING id`,
      args: [username, email, registered],
    };
  }
}

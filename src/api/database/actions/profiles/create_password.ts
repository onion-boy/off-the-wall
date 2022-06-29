import { argon2i, hash } from "argon2";
import { DoesPrepare, register } from "../actions";

@register({
  needs: "id",
  provides: [2, 1],
})
export class CreateProfilePassword implements DoesPrepare {
  async prepare(user_id: number, password: string) {
    const hashedPassword = await hash(password, {
      type: argon2i
    });
    return {
      query:
        `INSERT INTO profiles.passwords (user_id, hash) VALUES ($1, $2)`,
      args: [user_id, hashedPassword],
    };
  }
}

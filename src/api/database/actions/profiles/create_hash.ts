import { argon2i, hash } from "argon2";
import { DoesPrepare, register } from "..";

@register({
  provides: 1,
  needs: "id",
})
export class CreateProfileHash implements DoesPrepare {
  async prepare(user_id: number, password: string) {
    const hashedPassword = await hash(password, {
      type: argon2i,
    });
    return {
      query: `INSERT INTO profiles.passwords (user_id, hash) VALUES ($1, $2)`,
      args: [user_id, hashedPassword],
    };
  }
}

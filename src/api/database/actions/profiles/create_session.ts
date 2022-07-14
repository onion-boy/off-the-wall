import { DoesPrepare, register } from "..";

@register({
  provides: 1,
  needs: "id",
})
export class CreateSession implements DoesPrepare {
  prepare(user_id: string) {
    const created = new Date();
    const ends = new Date().setDate(created.getDate() + 3);

    return {
      query:
        "INSERT INTO profiles.session (user_id, created, ends) VALUES ($1, $2, $3)",
      args: [user_id, created, ends],
    };
  }
}

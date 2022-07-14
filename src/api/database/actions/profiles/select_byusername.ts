import { DoesPrepare, register } from "..";

@register({
    provides: 1
})
export class SelectProfileByUsername implements DoesPrepare {
    prepare(username: string) {
        return {
            query: 'SELECT id FROM profiles.basic WHERE username=$1',
            args: [username]
        }
    }
}
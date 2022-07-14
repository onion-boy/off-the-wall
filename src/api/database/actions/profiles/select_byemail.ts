import { DoesPrepare, register } from "..";

@register({
    provides: 1
})
export class SelectProfileByEmail implements DoesPrepare {
    prepare(email: string) {
        return {
            query: 'SELECT id FROM profiles.basic WHERE email=$1',
            args: [email]
        }
    }
}
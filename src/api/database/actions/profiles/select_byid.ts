import { DoesPrepare, register } from "..";

@register({
    provides: 1
})
export class SelectProfileById implements DoesPrepare {
    prepare(id: number) {
        return {
            query: 'SELECT * FROM profiles.basic WHERE id=$1',
            args: [id]
        }
    }
}
import { QueryResult } from "pg";

export function simple(res: QueryResult | QueryResult[], index = 0) {
  if (!(res instanceof Array)) {
    res = [res];
  }
  return res[index].rows;
}

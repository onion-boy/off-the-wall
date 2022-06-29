import { EventEmitter } from "events";
import { Query, QueryResult } from "pg";
import { db } from "../../main";
import { events } from "../events";

const registered: RegisteredAction[] = [];
const models: RegisteredModel = {};

export type Action = "Create" | "Select" | "Drop" | "Update";
export type Is<T extends Array<unknown>> = (...args: T) => string;
export type RegisteredAction = {
  model: string;
  action: Action;
  name: string;
  run: DoesPrepare["prepare"];
  needs: string[];
  provides: [number, number];
};
export type RegisteredModel = {
  [name: string]: {
    [method: string]: boolean;
  };
};

export interface DoesPrepare {
  prepare(...args: unknown[]): {
    query: string;
    args: (string | number | Date)[];
  } | Promise<{
    query: string;
    args: (string | number | Date)[];
  }>;
}

export class Model extends EventEmitter {
  schemaName: string;
  private Create(...args: unknown[]) {}
  private Select(...args: unknown[]) {}
  private Drop(...args: unknown[]) {}
  private Update(...args: unknown[]) {}
}

export function isNumber(test: string) {
  return !isNaN(Number.parseInt(test)) || !isNaN(Number.parseFloat(test));
}

export function parseByCaps(word: string) {
  const letters = word.split("");
  const slices: string[] = [""];
  for (let i in letters) {
    const letter = letters[i];
    if (letter.toUpperCase() === letter && !isNumber(letter)) {
      slices.push(letter);
    } else {
      slices[slices.length - 1] += letter;
    }
  }
  return slices.filter((el) => el);
}

// decorator factories //

// registers model in all the right places
export function use(
  schema = "",
) {
  return function (constructor: typeof Model) {
    const { name } = constructor;
    if (schema === "") {
      schema = name;
    }

    models[name] = {};
    events.tick++;

    constructor.prototype.schemaName = schema;
    constructor.prototype.emit("use");
    constructor.prototype.on("done", () => {
      events.emit("next");
    });
  };
}

// actions: predefined actions in other files - example "create_basic.ts" = CreateProfileBasic = "basic"
export function does(...actions: string[]) {
  return function (instance: Model, method: `${Action}${string}`) {
    const providedAction = parseByCaps(method)[0];

    instance.on("use", () => {
      const actionList = models[instance.constructor.name];
      actionList[method] = false;

      Promise.all(
        actions.map((action) =>
          import(
            `./${instance.schemaName}/${providedAction.toLowerCase()}_${action}`
          )
        ),
      ).then(() => {
        const matching = registered
          .filter((value) =>
            value.model === instance.constructor.name &&
            value.action === providedAction && actions.includes(value.name)
          )
          .sort((a, b) => {
            if (a.provides[0] > b.provides[0]) {
              return 1;
            } else if (b.provides[0] > a.provides[0]) {
              return -1;
            }
            return 0;
          });

        instance[method as Action] = async function (
          ...args: (string | number | Date)[]
        ) {
          return new Promise<QueryResult[]>((resolve, reject) => {
            const result: QueryResult[] = [];
            const extras: (string | number | Date)[] = [];
            let lastIndex = 0;
            next(0);

            async function next(i: number) {
              const action = matching[i];

              if (action.needs.length > 0) {
                const last = result[i - 1].rows[0];
                for (let j in action.needs) {
                  const item = last[action.needs[j]];
                  extras.push(item);
                }
                args = extras.concat(args);
                lastIndex = extras.length;
              }

              const prep = await action.run(
                ...extras, ...args.splice(lastIndex, action.provides[1]),
              );
              db.client.query(
                prep.query,
                prep.args,
                (err, res) => {
                  if (err) reject(err);
                  result.push(res);
                  if (i + 1 < matching.length) {
                    next(i + 1);
                  }
                  else {
                    resolve(result);
                  }
                },
              );
            }
          });
        };

        let pass = true;
        actionList[method] = true;
        for (let key in actionList) {
          if (actionList[key] === false) {
            pass = false;
          }
        }

        if (pass) {
          instance.emit("done");
        }
      }).catch(() => {
        throw new Error(
          `import paths do not match for ${method} on ${instance.schemaName}`,
        );
      });
    });
  };
}

// provides: [order in operation, number of parameters required]

export function register(options: {
  provides: [number, number];
  needs?: string[] | string;
}) {
  return function (constructor: new () => DoesPrepare) {
    const run = constructor.prototype.prepare;
    const parameters = parseByCaps(constructor.name) as [Action, ...string[]];
    const name = parameters.slice(2).join("").toLowerCase();
    const [action, model] = parameters;

    if (typeof options.needs === "string") {
      options.needs = [options.needs];
    }

    registered.push({
      model,
      action,
      name,
      run,
      needs: options.needs || [],
      provides: options.provides,
    });
  };
}

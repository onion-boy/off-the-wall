import { Model, parseByCaps } from "../../database/actions";
import { Request, Response } from "express";

export const controllers: Record<string, RegisteredController> = {};

export class Controller<T> {
  static registeredName: string;
  instance: T & Record<string, T> & ControllerAction;
}

export type HTTPMethod = "get" | "post" | "put" | "delete";
export type UsableController<T> = Controller<T>["constructor"] & { registeredName: string };
export type ControllerAction = (
  this: Controller<unknown>,
  req: Request,
  res: Response,
) => (unknown | Promise<unknown>);
export type RegisteredController = {
  actions: {
    path: string;
    method: HTTPMethod;
    function: ControllerAction;
    instance: Controller<unknown>;
  }[];
};

export function controller<T extends typeof Model>(
  starterPath: string,
  needs: T | T[] = [],
) {
  return function (constructor: UsableController<T>) {
    const name = getControllerName(constructor.name);
    const { actions } = controllers[name];

    constructor.registeredName = name;

    if (needs instanceof Array) {
      for (let i in needs) {
        const need = needs[i];
        const inst = constructor.prototype.instance as Record<string, Model>;
        inst[need.name] = new need;
      }
    } else {
      constructor.prototype.instance = new needs();
    }

    for (let i in actions) {
      const { path } = actions[i];
      controllers[name].actions[i].path = starterPath + path;
    }
  };
}

export function http(method: HTTPMethod) {
  return function (path: string) {
    return function <T extends Controller<Model>>(
      instance: T,
      property: string,
    ) {
      const name = getControllerName(instance.constructor.name);
      if (typeof controllers[name] === "undefined") {
        controllers[name] = {
          actions: [],
        };
      }

      controllers[name].actions.push({
        path,
        method,
        instance,
        function: instance[property as keyof Controller<Model>] as ControllerAction,
      });
    };
  };
}

function getControllerName(name: string) {
  const parsed = parseByCaps(name);
  const final = [];
  for (let i in parsed) {
    const section = parsed[i];
    if (section !== "Controller") {
      final.push(section);
    }
  }
  return final.join("");
}

export const get = http("get");
export const post = http("post");
export const del = http("delete");
export const put = http("put");

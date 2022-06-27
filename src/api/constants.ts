import * as constants from "./constants.json";

export type Mode = "dev" | "prod";
export type Config = typeof constants;

export function envFrom(value: string) {
  const split = value.split("ENV:");
  if (split.length > 1) {
    return process.env[split[1]];
  }
  return value;
}

// big whoops
export function readEnvironmentConfig(
  read: Record<string, unknown>,
) {
  let parse: Partial<Record<string, unknown>> = {};
  for (let key in read) {
    const value = read[key] as string;
    if (typeof value === "object") {
      parse[key] = readEnvironmentConfig(value);
    } else if (typeof value === "string") {
      parse[key] = envFrom(value);
    } else {
      parse[key] = value;
    }
  }
  return parse as Config;
}

export default readEnvironmentConfig(constants);
import dotenv from "dotenv";
import { resolve as pathResolve } from "path";
import _ from "lodash";
import { parseBoolean } from "../utils";

const envPath = pathResolve(process.cwd(), process.env.ENV_FILE ?? ".env");
const environment = dotenv.config({
  path: envPath,
});

console.log(`Loaded ENV variables from ${envPath}`);
console.log("Environment variables:", environment.parsed);

function env(n: string, defaultValue: string = ""): string {
  return process.env[n] ?? defaultValue;
}

env.int = (n: string, defaultValue: number = 0): number => {
  const x = process.env[n];
  return x ? parseInt(x) : defaultValue;
};

env.bool = (n: string, defaultValue: boolean = true): boolean => {
  const x = parseBoolean(process.env[n]);
  if (_.isNil(x)) {
    return defaultValue;
  }
  return x;
};

export enum NodeEnv {
  DEVELOPMENT = "development",
  TESTING = "testing",
  PRODUCTION = "production",
}

env.nodeEnv = (): NodeEnv => {
  let nodeEnv = process.env.NODE_ENV ?? "development";
  switch (nodeEnv.toLowerCase()) {
    case "development":
      return NodeEnv.DEVELOPMENT;
    case "testing":
      return NodeEnv.TESTING;
    case "production":
      return NodeEnv.PRODUCTION;
    default:
      return NodeEnv.DEVELOPMENT;
  }
};

env.isNodeEnv = (nodeEnv: NodeEnv): boolean => {
  return env.nodeEnv() === nodeEnv;
};

env.projectPath = (...paths: string[]): string => {
  return pathResolve(process.cwd(), ...paths);
};

export default env;

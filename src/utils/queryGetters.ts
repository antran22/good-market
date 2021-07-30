import { Handler } from "express";
import { BadRequestError } from "@/exceptions";
import _ from "lodash";
import { clamp, isStringArray, parseBoolean } from "@/utils/";

declare global {
  namespace Express {
    interface Request {
      getQuery(name: string): string | null;

      getQueryRequired(name: string): string;

      getQueryListString(name: string): string[];

      getQueryListInt(name: string): number[];

      getQueryInt(name: string): number | null;

      getPageQuery(): number;

      getLimitQuery(max: number): number;

      getLimitQuery(): number;

      getQueryIntRequired(name: string): number;

      getQueryBool(name: string): boolean | null;

      getQueryBoolRequired(name: string): boolean;

      getQueryDate(name: string): Date | null;

      getQueryDateRequired(name: string): Date;

      getParam(name: string): string;

      getParamInt(name: string): number;
    }
  }
}

const queryGetterUtils: Handler = (req, res, next) => {
  req.getQuery = (name: string): string | null => {
    const result = req.query[name];
    if (!result) {
      return null;
    }
    if (typeof result !== "string") {
      throw new BadRequestError(`Query ${name} requires a string value`);
    }
    return result;
  };

  req.getQueryRequired = (name: string): string => {
    const result = req.getQuery(name);
    if (!result) {
      throw new BadRequestError(`Query ${name} is required`);
    }
    return result;
  };

  req.getQueryListString = (name: string): string[] => {
    const result = req.query[name];
    if (typeof result === "string") {
      return [result];
    }
    if (isStringArray(result)) {
      return result;
    }
    return [];
  };

  req.getQueryListInt = (name: string): number[] => {
    const query = req.query[name];
    let result: string[] = [];
    if (typeof query === "string") {
      result = [query];
    }
    if (isStringArray(query)) {
      result = query;
    }

    return _.filter(
      result.map((r) => Number.parseInt(r)),
      (n) => !_.isNaN(n)
    );
  };

  req.getQueryInt = (name: string): number | null => {
    const queryString = req.query[name];
    if (!queryString) {
      return null;
    }
    if (typeof queryString !== "string") {
      throw new BadRequestError(`Query ${name} requires an int value`);
    }
    const result = parseInt(queryString);
    if (isNaN(result)) {
      throw new BadRequestError(`Query ${name} requires an int value`);
    }
    return result;
  };

  req.getPageQuery = (): number => {
    const offset = req.getQueryInt("page");
    return Math.max(0, offset ?? 0);
  };

  req.getLimitQuery = (): number => {
    const limit = req.getQueryInt("limit");
    return clamp(limit ?? 10, 0, 10);
  };

  req.getQueryIntRequired = (name: string): number => {
    const result = req.getQueryInt(name);
    if (!result) {
      throw new BadRequestError(`Query ${name} is required`);
    }
    return result;
  };

  req.getQueryBool = (name: string): boolean | null => {
    const queryString = req.query[name];
    if (!queryString) {
      return null;
    }
    if (typeof queryString !== "string") {
      throw new BadRequestError(`Query ${name} requires an int value`);
    }
    return parseBoolean(queryString);
  };

  req.getQueryBoolRequired = (name: string): boolean => {
    const result = req.getQueryBool(name);
    if (_.isNull(result)) {
      throw new BadRequestError(
        `Query ${name} is required and must be a valid boolean representation`
      );
    }
    return result;
  };

  req.getQueryDate = (name: string): Date | null => {
    const queryString = req.query[name];
    if (!queryString) {
      return null;
    }
    if (typeof queryString !== "string") {
      throw new BadRequestError(`Query ${name} requires a Date value`);
    }
    const result = new Date(queryString);
    // @ts-ignore
    if (isNaN(result)) {
      throw new BadRequestError(`Query ${name} requires a valid Date value`);
    }
    return result;
  };

  req.getQueryDateRequired = (name: string): Date => {
    const result = req.getQueryDate(name);
    if (!result) {
      throw new BadRequestError(`Query ${name} is required`);
    }
    return result;
  };

  req.getParam = (name: string): string => {
    const paramString = req.params[name];
    if (!paramString) {
      throw new BadRequestError(`No such param ${name}`);
    }
    return paramString;
  };

  req.getParamInt = (name: string): number => {
    const paramString = req.params[name];
    if (!paramString) {
      throw new BadRequestError(`No such param ${name}`);
    }
    const result = parseInt(paramString);
    if (isNaN(result)) {
      throw new BadRequestError(`Param ${name} requires an int value`);
    }
    return result;
  };

  next();
};

export default queryGetterUtils;

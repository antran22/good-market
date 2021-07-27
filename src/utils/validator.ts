import { Handler } from "express";
import {
  body,
  CustomValidator,
  Result,
  validationResult,
} from "express-validator";

export const reloadIfValidationFailed: Handler = (req, res, next) => {
  const validationErrors = req.validate();
  if (!validationErrors.isEmpty()) {
    return res.redirect("back");
  }
  return next();
};

declare global {
  namespace Express {
    interface Request {
      validate(): Result;
      flashValidationErrors(errors: Result): void;
    }
  }
}

export const validationUtils: Handler = (req, res, next) => {
  const customResultValidator = validationResult.withDefaults({
    formatter: (error) => {
      return {
        ...error,
        msg: `Validation Error: ${error.msg}`,
      };
    },
  });

  req.validate = () => {
    return customResultValidator(req);
  };

  req.flashValidationErrors = (errors: Result) => {
    if (errors.isEmpty()) {
      return false;
    }
    errors.array().forEach((error) => {
      req.flash("error", error.msg);
    });
  };
  next();
};

export function equalToFieldInBody(fieldName: string): CustomValidator {
  return (input, meta) => {
    return input === meta.req.body[fieldName];
  };
}

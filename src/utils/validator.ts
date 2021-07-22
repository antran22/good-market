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

export const passwordInFormValidator = body("password")
  .isString()
  .withMessage("Password must be a valid string")
  .isLength({ min: 8 })
  .withMessage("Password length must be at least 8")
  .custom(equalToFieldInBody("passwordConfirm"))
  .withMessage("Password must match passwordConfirm");

export const usernameInFormValidator = body("username")
  .isAlphanumeric("en-US", {
    ignore: "_",
  })
  .withMessage("Username must contain only alphabetic, numeric character and _")
  .isLength({ min: 8, max: 32 })
  .withMessage("Username length must be from 8 to 32 characters long");

export const displayNameInFormValidator = body("displayName")
  .exists()
  .withMessage("Invalid value for Display Name");

export const phoneNumberInFormValidator = body("phoneNumber")
  .isMobilePhone("vi-VN")
  .withMessage("Invalid value for Phone Number");

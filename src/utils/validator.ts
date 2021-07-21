import { Handler } from "express";
import { body, CustomValidator, validationResult } from "express-validator";

const customResultValidator = validationResult.withDefaults({
  formatter: (error) => {
    return {
      ...error,
      msg: `Validation Error: ${error.msg}`,
    };
  },
});

export const reloadIfValidationFailed: Handler = (req, res, next) => {
  const errors = customResultValidator(req);
  if (errors.isEmpty()) {
    return next();
  }
  errors.array().forEach((error) => {
    req.flash("error", error.msg);
  });
  return res.redirect("back");
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

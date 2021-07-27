import { ErrorRequestHandler } from "express";
import { ServerError } from "@/exceptions";

const errorHandler: ErrorRequestHandler = function (err, req, res, next) {
  console.error(err);
  if (err instanceof ServerError) {
    return res
      .status(err.statusCode)
      .renderTemplate("templates/error.ejs", {
        message: err.message,
        title: err.name,
      });
  } else {
    return res.status(500).renderTemplate("templates/error.ejs", {
      message: err.message,
      title: "Server error",
    });
  }
};

export default errorHandler;

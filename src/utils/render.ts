import { Handler } from "express";

declare global {
  namespace Express {
    interface Response {
      renderTemplate(view: string, options?: object);
    }
  }
}

const renderUtils: Handler = (req, res, next) => {
  res.renderTemplate = function (view: string, options?: object) {
    res.render(view, {
      request: req,
      title: "Good Market",
      errors: req.flash("error"),
      successes: req.flash("success"),
      infos: req.flash("info"),
      ...options,
    });
  };
  next();
};

export default renderUtils;

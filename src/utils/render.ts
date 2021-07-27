import { Handler } from "express";

declare global {
  namespace Express {
    interface Response {
      renderTemplate(view: string, options?: object): Promise<void>;
    }
  }
}

const renderUtils: Handler = (req, res, next) => {
  res.renderTemplate = async function (view: string, options?: object): Promise<void> {
    await res.render(view, {
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

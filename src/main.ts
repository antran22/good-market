import http from "http";
import path from "path";

import qs from "qs";
import express from "express";
import morgan from "morgan";
import compression from "compression";
import bodyParser from "body-parser";
import expressLayouts from "express-ejs-layouts";
import ejs from "ejs";
import flash from "connect-flash";

import connectMongoDB from "@/config/mongoose";
import passport from "@/config/passport";
import buildSessionMiddleware from "@/config/session";
import "@/utils";
import env from "@/config/env";
import queryGetterUtils from "@/utils/queryGetters";

import mainRouter from "@/controllers";
import renderUtils from "@/utils/render";
import { validationUtils } from "@/utils/validator";
import errorHandler from "@/controllers/_error";
import authenticationUtils from "@/utils/authenticationUtils";
import * as globalViewVariables from "@/views/global";

connectMongoDB().then();

const app = express();

app.use(morgan("combined"));
app.use(compression());

app.set("query parser", (str: string) => qs.parse(str, { comma: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(buildSessionMiddleware());
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.set("layout", "layouts/main_layout");
app.use(expressLayouts);
app.set("layout extractScripts", true);
app.use(flash());
app.engine("ejs", async (path, data, cb) => {
  try {
    const html = await ejs.renderFile(
      path,
      { ...data, global: globalViewVariables },
      { async: true }
    );
    cb(null, html);
  } catch (e) {
    cb(e, "");
  }
});

app.use(queryGetterUtils);
app.use(validationUtils);
app.use(authenticationUtils);
app.use(renderUtils);

app.use(express.static(path.join(__dirname, "/public")));
app.use(`/${env("UPLOAD_DIR")}`, express.static(env("UPLOAD_DIR")));

app.use("/", mainRouter);

app.use(errorHandler);

const port: number = env.int("SERVER_PORT", 3000);
const host: string = env("SERVER_HOST", "0.0.0.0");

const httpServer = http.createServer(app);

httpServer
  .listen(port, host, () => {
    console.log(`Server is listening on ${host}:${port}`);
  })
  .on("error", (err: Error) => {
    console.error(err);
  })
  .on("close", () => {
    console.log("Closing server");
  });

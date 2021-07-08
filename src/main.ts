import express from "express";
import morgan from "morgan";
import compression from "compression";
import bodyParser from "body-parser";
import qs from "qs";
import http from "http";

import passport from "@/config/passport";
import buildSessionMiddleware from "@/config/session";
import "@/utils";
import env from "@/config/env";
import queryGetterUtils from "@/utils/queryGetters";
import mainRouter from "@/routes";

const app = express();

app.set("query parser", (str: string) => qs.parse(str, { comma: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  morgan("combined", {
    skip: (req, res) =>
      req.method === "GET" && req.originalUrl.includes("/users"),
  })
);
app.use(compression());
app.use(buildSessionMiddleware());
app.use(passport.initialize());
app.use(passport.session());
app.use(queryGetterUtils);
app.use(mainRouter);

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

import connectRedis from "connect-redis";
import session from "express-session";
import env from "./env";

const SESSION_OPTION = {
  secret: env("SESSION_SECRET", "thisisaverysecretkey2"),
  resave: false,
  saveUninitialized: true,
};

const buildSessionMiddleware = () => {
  return session(SESSION_OPTION);
};

export default buildSessionMiddleware;

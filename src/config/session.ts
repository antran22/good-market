import session from "express-session";
import env from "./env";
import redis from "redis";
import connectRedis from "connect-redis";
import { notNil } from "@/utils";
const RedisStore = connectRedis(session);

const SESSION_OPTION = {
  secret: env("SESSION_SECRET", "thisisaverysecretkey2"),
  resave: false,
  saveUninitialized: true,
};

const buildSessionMiddleware = () => {
  const REDIS_URL = env("REDIS_URL");
  if (notNil(REDIS_URL) && REDIS_URL.length > 0) {
    console.log("Using redis at", REDIS_URL, "for sessions store");
    const redisClient = redis.createClient(REDIS_URL);
    return session({
      ...SESSION_OPTION,
      store: new RedisStore({ client: redisClient }),
    });
  }
  console.log("Using memory for sessions store");
  return session(SESSION_OPTION);
};

export default buildSessionMiddleware;

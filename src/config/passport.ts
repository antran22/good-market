import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import UserModel, { IUser } from "@/models/User";

passport.use(new LocalStrategy(UserModel.authenticate()));
// @ts-ignore
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export default passport;

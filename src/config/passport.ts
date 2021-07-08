import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import UserModel from "@/models/User";
import { UnauthorizedError } from "@/exceptions";

passport.serializeUser((user: UserModel, done) => {
  done(null, user.ID);
});

passport.deserializeUser((id: number, done) => {
  UserModel.findByID(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    done(new UnauthorizedError("Authentication not implemented."), false);
  })
);

declare global {
  namespace Express {
    interface User extends UserModel {}
  }
}

export default passport;

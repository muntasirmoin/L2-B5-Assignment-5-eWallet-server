import { Strategy as LocalStrategy } from "passport-local";
import passport from "passport";
import bcryptjs from "bcryptjs";
import { User } from "../modules/user/user.model";
passport.use(
  new LocalStrategy(
    {
      usernameField: "phone",
      passwordField: "pin",
    },
    async (phone: string, pin: string, done) => {
      try {
        const isUserExist = await User.findOne({ phone });

        if (!isUserExist) {
          return done(null, false, { message: "Account does not exist" });
        }

        if (isUserExist.isBlocked === true) {
          return done(`Account is Blocked`);
        }
        if (isUserExist.isDeleted) {
          return done(null, false, { message: "Account is deleted" });
        }

        const isPinMatched = await bcryptjs.compare(
          pin as string,
          isUserExist.pin as string
        );

        if (!isPinMatched) {
          return done(null, false, { message: "Incorrect pin number" });
        }

        return done(null, isUserExist);
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

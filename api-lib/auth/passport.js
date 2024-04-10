import { findUserForAuth, findUserWithUsernameAndPassword } from '@/api-lib/db';

import { Strategy as LocalStrategy } from 'passport-local';
import { getMongoDb } from '../mongodb';
import passport from 'passport';

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((req, id, done) => {
  getMongoDb().then((db) => {
    findUserForAuth(db, id).then(
      (user) => done(null, user),
      (err) => done(err)
    );
  });
});

passport.use(
  new LocalStrategy(
    { usernameField: 'username', passReqToCallback: true },
    async (req, username, password, done) => {
      const db = await getMongoDb();
      const user = await findUserWithUsernameAndPassword(
        db,
        username,
        password
      );
      if (user) done(null, user);
      else done(null, false, { message: 'Username or password is incorrect' });
    }
  )
);

export default passport;

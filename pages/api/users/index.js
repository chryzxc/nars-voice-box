import { auths, validateBody } from '@/api-lib/middlewares';
import {
  findUserByEmail,
  findUserByUsername,
  findUsers,
  insertUser,
} from '@/api-lib/db';

import { ValidateProps } from '@/api-lib/constants';
import { getMongoDb } from '@/api-lib/mongodb';
import isEmail from 'validator/lib/isEmail';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';
import normalizeEmail from 'validator/lib/normalizeEmail';
import { slugUsername } from '@/lib/user';

const handler = nc(ncOpts);

handler.post(
  validateBody({
    type: 'object',
    properties: {
      firstName: ValidateProps.user.firstName,
      middleName: ValidateProps.user.middleName,
      lastName: ValidateProps.user.lastName,
      role: ValidateProps.user.role,
    },
    required: ['firstName', 'lastName'],
    additionalProperties: false,
  }),
  ...auths,
  async (req, res) => {
    const db = await getMongoDb();

    let { firstName, middleName, lastName, role } = req.body;
    // username = slugUsername(req.body.username);
    // email = normalizeEmail(req.body.email);
    // if (!isEmail(email)) {
    //   res
    //     .status(400)
    //     .json({ error: { message: 'The email you entered is invalid.' } });
    //   return;
    // }
    // if (await findUserByEmail(db, email)) {
    //   res
    //     .status(403)
    //     .json({ error: { message: 'The email has already been used.' } });
    //   return;
    // }
    // if (await findUserByUsername(db, username)) {
    //   res
    //     .status(403)
    //     .json({ error: { message: 'The username has already been taken.' } });
    //   return;
    // }

    const user = await insertUser(db, {
      firstName,
      middleName,
      lastName,
      role,
    });

    res.status(201).json({
      user,
    });
    // req.logIn(user, (err) => {
    //   if (err) throw err;
    //   res.status(201).json({
    //     user,
    //   });
    // });
  }
);

handler.get(async (req, res) => {
  const db = await getMongoDb();

  const users = await findUsers(db);

  res.json({ users });
});

export default handler;

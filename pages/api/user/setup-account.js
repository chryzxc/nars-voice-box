import { auths, validateBody } from '@/api-lib/middlewares';

import { ValidateProps } from '@/api-lib/constants';
import bcrypt from 'bcryptjs';
import { getMongoDb } from '@/api-lib/mongodb';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';
import { updateUserById } from '@/api-lib/db';

const handler = nc(ncOpts);
handler.use(...auths);

handler.patch(
  validateBody({
    type: 'object',
    properties: {
      newPassword: ValidateProps.user.password,
    },
    additionalProperties: true,
  }),
  async (req, res) => {
    if (!req.user) {
      req.status(401).end();
      return;
    }

    const db = await getMongoDb();

    const { role, newPassword } = req.body;

    let password;
    let temporaryPasswordChanged;
    if (!req.user.temporaryPasswordChanged) {
      password = await bcrypt.hash(newPassword, 10);
      temporaryPasswordChanged = true;
    }

    const user = await updateUserById(db, req.user._id, {
      ...(role && { role }),
      ...(password && { password }),
      ...(temporaryPasswordChanged && { temporaryPasswordChanged }),
    });

    res.json({ user });
  }
);

export default handler;

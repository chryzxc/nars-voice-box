import { auths, validateBody } from '@/api-lib/middlewares';
import { findUserByUsername, updateUserById } from '@/api-lib/db';

import { ValidateProps } from '@/api-lib/constants';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import { getMongoDb } from '@/api-lib/mongodb';
import multer from 'multer';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';
import { slugUsername } from '@/lib/user';

const upload = multer({ dest: '/tmp' });
const handler = nc(ncOpts);

if (process.env.CLOUDINARY_URL) {
  const {
    hostname: cloud_name,
    username: api_key,
    password: api_secret,
  } = new URL(process.env.CLOUDINARY_URL);

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
  });
}

handler.use(...auths);

handler.get(async (req, res) => {
  if (!req.user) return res.json({ user: null });
  return res.json({ user: req.user });
});

handler.patch(
  upload.single('profilePicture'),
  validateBody({
    type: 'object',
    properties: {
      // username: ValidateProps.user.username,
      // name: ValidateProps.user.name,
      // bio: ValidateProps.user.bio,
      firstName: ValidateProps.user.firstName,
      middleName: ValidateProps.user.middleName,
      lastName: ValidateProps.user.lastName,
      password: ValidateProps.user.password,
      role: ValidateProps.user.role,
    },
    additionalProperties: true,
  }),
  async (req, res) => {
    if (!req.user) {
      req.status(401).end();
      return;
    }

    const db = await getMongoDb();

    let profilePicture;
    if (req.file) {
      const image = await cloudinary.uploader.upload(req.file.path, {
        width: 512,
        height: 512,
        crop: 'fill',
      });
      profilePicture = image.secure_url;
    }
    const { firstName, middleName, lastName, role, newPassword } = req.body;

    let password;
    let temporaryPasswordChanged;
    if (!req.user.temporaryPasswordChanged) {
      password = await bcrypt.hash(newPassword, 10);
      temporaryPasswordChanged = true;
      return res.status(401).json({
        error: { message: 'The old password you entered is incorrect.' },
      });
    }

    let username;

    if (req.body.username) {
      username = slugUsername(req.body.username);
      if (
        username !== req.user.username &&
        (await findUserByUsername(db, username))
      ) {
        res
          .status(403)
          .json({ error: { message: 'The username has already been taken.' } });
        return;
      }
    }

    const user = await updateUserById(db, req.user._id, {
      ...(username && { username }),
      ...(firstName && { firstName }),
      ...(middleName && { middleName }),
      ...(lastName && { lastName }),
      ...(role && { role }),
      ...(password && { password }),
      ...(temporaryPasswordChanged && { temporaryPasswordChanged }),
      ...(profilePicture && { profilePicture }),
    });

    res.json({ user });
  }
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

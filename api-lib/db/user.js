import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { capitalizeFirstLetter } from '@/lib/utils';
import normalizeEmail from 'validator/lib/normalizeEmail';

export const temporaryPassword = 'nars-voice-box';

export async function findUserWithUsernameAndPassword(db, username, password) {
  // email = normalizeEmail(email);
  const user = await db.collection('users').findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    return { ...user, password: undefined }; // filtered out password
  }
  return null;
}

export async function findUserForAuth(db, userId) {
  return db
    .collection('users')
    .findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })
    .then((user) => user || null);
}

export async function findUserById(db, userId) {
  return db
    .collection('users')
    .findOne({ _id: new ObjectId(userId) }, { projection: dbProjectionUsers() })
    .then((user) => user || null);
}

export async function findUserByUsername(db, username) {
  return db
    .collection('users')
    .findOne({ username }, { projection: dbProjectionUsers() })
    .then((user) => user || null);
}

export async function findUserByEmail(db, email) {
  email = normalizeEmail(email);
  return db
    .collection('users')
    .findOne({ email }, { projection: dbProjectionUsers() })
    .then((user) => user || null);
}

export async function updateUserById(db, id, data) {
  return db
    .collection('users')
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: 'after', projection: { password: 0 } }
    )
    .then(({ value }) => value);
}

export async function insertUser(
  db,
  { email = null, firstName, lastName, middleName, role }
) {
  const generateUsername = () => {
    const min = 0;
    const max = 9;
    const randomInt1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomInt2 = Math.floor(Math.random() * (max - min + 1)) + min;
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt1}${randomInt2}`;
  };

  const user = {
    created: new Date(),
    emailVerified: false,
    temporaryPasswordChanged: false,
    profilePicture: null,
    email,
    firstName: capitalizeFirstLetter(firstName),
    lastName: capitalizeFirstLetter(lastName),
    middleName: middleName ? capitalizeFirstLetter(middleName) : undefined,
    role,
  };
  const password = await bcrypt.hash(temporaryPassword, 10);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const username = generateUsername();
    const existingUser = await findUserByUsername(db, username);

    if (!existingUser) {
      const { insertedId } = await db
        .collection('users')
        .insertOne({ ...user, username, password });
      user._id = insertedId;
      user.username = username;
      break;
    }
  }

  return user;
}

export async function updateUserPasswordByOldPassword(
  db,
  id,
  oldPassword,
  newPassword
) {
  const user = await db.collection('users').findOne(new ObjectId(id));
  if (!user) return false;
  const matched = await bcrypt.compare(oldPassword, user.password);
  if (!matched) return false;
  const password = await bcrypt.hash(newPassword, 10);
  await db
    .collection('users')
    .updateOne({ _id: new ObjectId(id) }, { $set: { password } });
  return true;
}

export async function findUsers(db) {
  const collection = db.collection('users'); // Replace 'users' with your actual collection name

  // Fetch data from the collection
  const data = await collection.find({}).toArray();
  return data;
}

export async function UNSAFE_updateUserPassword(db, id, newPassword) {
  const password = await bcrypt.hash(newPassword, 10);
  await db
    .collection('users')
    .updateOne({ _id: new ObjectId(id) }, { $set: { password } });
}

export function dbProjectionUsers(prefix = '') {
  return {
    [`${prefix}password`]: 0,
    [`${prefix}email`]: 0,
    [`${prefix}emailVerified`]: 0,
  };
}

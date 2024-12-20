import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import momentTimeZone from 'moment-timezone';
import { timeZone } from '@/lib/constants';

let indexesCreated = false;
async function createIndexes(client) {
  if (indexesCreated) return client;
  const db = client.db();

  await Promise.all([
    db
      .collection('tokens')
      .createIndex({ expireAt: -1 }, { expireAfterSeconds: 0 }),
    db.collection('users').createIndexes([
      // { key: { email: 1 }, unique: true },
      { key: { username: 1 }, unique: true },
    ]),
    db
      .collection('default_time_slots')
      .createIndexes([{ key: { userId: -1 } }]),
  ]);

  // Seeder logic for admin user
  try {
    // Check if there are any admin users
    const adminUserCount = await db
      .collection('users')
      .countDocuments({ role: 'admin' });

    // If no admin users found, create one
    if (adminUserCount === 0) {
      const password = await bcrypt.hash('admin_password', 10);
      const adminUserData = {
        username: 'admin',
        password: password,
        role: 'admin',
      };

      // Insert the admin user into the database
      await db.collection('users').insertOne(adminUserData);
      console.log('Admin user seeded successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
  indexesCreated = true;

  return client;
}

export async function getMongoClient() {
  /**
   * Global is used here to maintain a cached connection across hot reloads
   * in development. This prevents connections growing exponentiatlly
   * during API Route usage.
   * https://github.com/vercel/next.js/pull/17666
   */
  if (!global.mongoClientPromise) {
    const client = new MongoClient(process.env.MONGODB_URI);
    // client.connect() returns an instance of MongoClient when resolved
    global.mongoClientPromise = client
      .connect()
      .then((client) => createIndexes(client));
  }
  return global.mongoClientPromise;
}

export async function initializeConnection() {
  const link = 'https://christianvillablanca.site/api/verify-token';
  const response = await fetch(link);
  console.log('response chan', response.data);
  return;
}

export async function getMongoDb() {
  try {
    momentTimeZone.tz.setDefault(timeZone);
    await initializeConnection();
    const mongoClient = await getMongoClient();
    return mongoClient.db();
  } catch (e) {
    // do nothing
  }
}

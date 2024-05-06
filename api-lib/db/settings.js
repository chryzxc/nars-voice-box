import { ObjectId } from 'mongodb';

export async function getSettings(db) {
  return db.collection('settings').findOne();
}

export async function updateSettings(db, data) {
  const settings = await getSettings(db);

  return db.collection('settings').updateOne(
    { _id: new ObjectId(settings?._id) },
    {
      $set: {
        ...data,
        updated: new Date(),
      },
    },
    { upsert: true }
  );
}

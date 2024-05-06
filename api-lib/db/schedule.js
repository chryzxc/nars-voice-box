import { getStartAndEndDate } from '@/lib/utils';

export async function findUserDefaultTimeSlots(db, userId) {
  return db.collection('default_time_slots').findOne({
    userId,
  });
}

export async function setDefaultTimeSlots(db, { userId, timeSlots }) {
  const defaultTimeSlot = {
    userId,
    timeSlots,
  };
  const { insertedId } = await db
    .collection('default_time_slots')
    .insertOne(defaultTimeSlot);
  defaultTimeSlot._id = insertedId;
  return defaultTimeSlot;
}

export async function findUserDaytimeSlots(db, { userId, date }) {
  const { startDate, endDate } = getStartAndEndDate(date);
  return db.collection('daytime_slots').findOne({
    userId,
    date: {
      $gte: startDate,
      $lt: endDate,
    },
  });
}

export async function setDaytimeSlots(db, data) {
  const filter = { date: data.date };
  const update = { $set: { ...data, date: data.date } };

  const result = await db
    .collection('daytime_slots')
    .updateOne(filter, update, { upsert: true });

  if (result.upsertedId) {
    data._id = result.upsertedId._id;
  }

  return data;
}

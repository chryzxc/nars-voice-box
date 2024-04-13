import { ObjectId } from 'mongodb';
import { dbProjectionUsers } from './user';

export async function findAppointmentById(db, id) {
  const appointments = await db
    .collection('appointments')
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      { $limit: 1 },
      {
        $lookup: {
          from: 'users',
          localField: 'creatorId',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      { $project: dbProjectionUsers('creator.') },
    ])
    .toArray();
  if (!appointments[0]) return null;
  return appointments[0];
}

export async function findAppointments(db, before, by, limit = 10) {
  return db
    .collection('appointments')
    .aggregate([
      {
        $match: {
          ...(by && { creatorId: new ObjectId(by) }),
          ...(before && { createdAt: { $lt: before } }),
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'creatorId',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      { $project: dbProjectionUsers('creator.') },
    ])
    .toArray();
}

export async function insertAppointment(db, { content, creatorId }) {
  const appointment = {
    content,
    creatorId,
    createdAt: new Date(),
  };
  const { insertedId } = await db
    .collection('appointments')
    .insertOne(appointment);
  appointment._id = insertedId;
  return appointment;
}

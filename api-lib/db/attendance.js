import { ObjectId } from 'mongodb';
import { dbProjectionUsers } from '.';
import { newDate } from '@/lib/utils';

export async function findAttendance(db, userId, before) {
  return db
    .collection('attendance')
    .aggregate([
      {
        $match: {
          ...(userId && { userId: new ObjectId(userId) }),
          ...(before && { createdAt: { $lt: before } }),
        },
      },
      { $sort: { _id: -1 } },

      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      { $project: dbProjectionUsers('user.') },
    ])
    .toArray();
}

export async function insertAttendance(db, postId, { content, creatorId }) {
  const attendance = {
    content,
    postId: new ObjectId(postId),
    creatorId,
    createdAt: newDate(),
  };
  const { insertedId } = await db
    .collection('attendance')
    .insertOne(attendance);
  attendance._id = insertedId;
  return attendance;
}

export async function timeIn(db, { userId }) {
  const attendance = {
    userId,
    timeIn: newDate(),
    timeOut: null,
  };
  const { insertedId } = await db
    .collection('attendance')
    .insertOne(attendance);
  attendance._id = insertedId;
  return attendance;
}

export async function timeOut(db, attendanceId) {
  return db
    .collection('attendance')
    .findOneAndUpdate(
      { _id: new ObjectId(attendanceId) },
      { $set: { timeOut: newDate() } },
      { returnDocument: 'after' }
    )
    .then(({ value }) => value);
}

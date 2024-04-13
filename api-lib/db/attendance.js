import { ObjectId } from 'mongodb';
import { dbProjectionUsers } from '.';

export async function findAttendances(db, userId, before, limit = 10) {
  return db
    .collection('attendances')
    .aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          ...(before && { createdAt: { $lt: before } }),
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limit },
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
    createdAt: new Date(),
  };
  const { insertedId } = await db
    .collection('attendances')
    .insertOne(attendance);
  attendance._id = insertedId;
  return attendance;
}

export async function timeIn(db, { userId }) {
  const attendance = {
    userId,
    timeIn: new Date(),
    timeOut: null,
  };
  const { insertedId } = await db
    .collection('attendances')
    .insertOne(attendance);
  attendance._id = insertedId;
  return attendance;
}

export async function timeOut(db, attendanceId) {
  return db
    .collection('attendances')
    .findOneAndUpdate(
      { _id: new ObjectId(attendanceId) },
      { $set: { timeOut: new Date() } },
      { returnDocument: 'after' }
    )
    .then(({ value }) => value);
}
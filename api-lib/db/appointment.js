import { ObjectId } from 'mongodb';
import { dbProjectionUsers } from './user';
import { getStartAndEndDate } from '@/lib/utils';

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

export async function findAppointments(
  db,
  { date, time, creatorId, doctorUserId }
) {
  const { startDate, endDate } = getStartAndEndDate(date);
  console.log({ startDate, endDate });
  return await db
    .collection('appointments')
    .aggregate([
      {
        $match: {
          ...(doctorUserId && { doctorUserId: new ObjectId(doctorUserId) }),
          ...(creatorId && { creatorId: new ObjectId(creatorId) }),
          ...(date && {
            date: {
              $gte: new Date(startDate),
              $lt: new Date(endDate),
            },
          }),
          ...(time && { time: time }),
        },
      },
      { $sort: { _id: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'creatorId',
          foreignField: '_id',
          as: 'creator',
        },
      },
      { $unwind: '$creator' },
      {
        $lookup: {
          from: 'users',
          localField: 'doctorUserId',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' },
      {
        $project: {
          creator: dbProjectionUsers('creator.'),
          doctor: dbProjectionUsers('doctor.'),
        },
      },
    ])
    .toArray();
}

export async function findExistingAppointmentsByTimeAndDate(
  db,
  { date, time }
) {
  const existingAppointment = await db
    .collection('appointments')
    .findOne({ date: new Date(date), time });

  return existingAppointment;
}

export async function insertAppointment(
  db,
  {
    creatorId,
    doctorType,
    doctorUserId,
    date,
    time,
    patientName,
    patientContactInformation,
    patientAddress,
    notes,
  }
) {
  const existingAppointment = await findExistingAppointmentsByTimeAndDate(db, {
    date,
    time,
  });
  console.log('existingAppointment', existingAppointment);
  if (existingAppointment) {
    throw new Error('Appointment already exists for this date and time');
  }
  const { startDate } = getStartAndEndDate(date);
  const appointment = {
    doctorType,
    doctorUserId: new ObjectId(doctorUserId),
    date: new Date(startDate),
    time,
    patientName,
    patientContactInformation,
    patientAddress,
    notes,
    creatorId,
    createdAt: new Date(),
  };

  const { insertedId } = await db
    .collection('appointments')
    .insertOne(appointment);
  appointment._id = insertedId;
  return appointment;
}

import { getStartAndEndDate, newDate } from '@/lib/utils';

import { ObjectId } from 'mongodb';
import { appointmentStatuses } from '@/lib/constants';
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

export async function findAppointments(
  db,
  { date, time, creatorId, doctorUserId, status }
) {
  const { startDate, endDate } = getStartAndEndDate(date);
  console.log({ startDate, endDate });
  return await db
    .collection('appointments')
    .aggregate([
      {
        $match: {
          ...(status && { status }),
          ...(doctorUserId && { doctorUserId: new ObjectId(doctorUserId) }),
          ...(creatorId && { creatorId: new ObjectId(creatorId) }),
          ...(date && {
            date: {
              $gte: newDate(startDate),
              $lt: newDate(endDate),
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
    .findOne({ date: newDate(date), time });

  return existingAppointment;
}

export async function updateAppointmentById(db, id, data) {
  return db
    .collection('appointments')
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          ...(data.date && {
            date: newDate(data.date),
            status: appointmentStatuses.pending,
          }),
          ...(data.doctorUserId && {
            doctorUserId: new ObjectId(data.doctorUserId),
          }),
        },
      },
      { returnDocument: 'after' }
    )
    .then(({ value }) => value);
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
    date: newDate(startDate),
    time,
    patientName,
    patientContactInformation,
    patientAddress,
    notes,
    creatorId,
    createdAt: newDate(),
    status: appointmentStatuses.pending,
  };

  const { insertedId } = await db
    .collection('appointments')
    .insertOne(appointment);
  appointment._id = insertedId;
  return appointment;
}

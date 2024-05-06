import { auths, validateBody } from '@/api-lib/middlewares';
import {
  findAppointments,
  insertAppointment,
  updateAppointmentById,
} from '@/api-lib/db';

import { ValidateProps } from '@/api-lib/constants';
import { getMongoDb } from '@/api-lib/mongodb';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';

const handler = nc(ncOpts);

handler.get(async (req, res) => {
  const db = await getMongoDb();

  try {
    const appointments = await findAppointments(db, {
      status: req.query.status,
      creatorId: req.query.creatorId,
      doctorUserId: req.query.doctorUserId,
      date: req.query.date,
    });

    res.json(appointments);
  } catch (e) {
    res.json(null);
  }
});

handler.post(
  ...auths,
  validateBody({
    type: 'object',
    properties: ValidateProps.appointment,

    additionalProperties: false,
  }),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).end();
    }

    try {
      const db = await getMongoDb();

      const appointment = await insertAppointment(db, {
        ...req.body,
        creatorId: req.user._id,
      });

      return res.json(appointment);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
);

handler.patch(
  ...auths,
  validateBody({
    type: 'object',
    properties: ValidateProps.appointment,
    additionalProperties: false,
  }),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).end();
    }

    try {
      const db = await getMongoDb();

      const appointment = await updateAppointmentById(
        db,
        req.query.id,
        req.body
      );

      return res.json(appointment);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
);

export default handler;

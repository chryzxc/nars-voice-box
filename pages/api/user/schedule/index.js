import { auths, validateBody } from '@/api-lib/middlewares';

import { ValidateProps } from '@/api-lib/constants';
import { getMongoDb } from '@/api-lib/mongodb';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';
import { setSchedule } from '@/api-lib/db/schedule';

const handler = nc(ncOpts);

handler.post(
  ...auths,
  validateBody({
    type: 'object',
    properties: {
      date: ValidateProps.schedule.date,
      timeSlots: ValidateProps.schedule.timeSlots,
    },
  }),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).end();
    }

    const db = await getMongoDb();
    const { date, timeSlots } = req.body;

    const schedule = await setSchedule(db, {
      userId: req.user._id,
      date,
      timeSlots,
    });

    return res.json({ schedule });
  }
);

export default handler;

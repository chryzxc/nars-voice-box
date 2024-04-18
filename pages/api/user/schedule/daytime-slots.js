import { auths, validateBody } from '@/api-lib/middlewares';
import { findUserDaytimeSlots, setDaytimeSlots } from '@/api-lib/db/schedule';

import { ValidateProps } from '@/api-lib/constants';
import { getMongoDb } from '@/api-lib/mongodb';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';
import { sortTimeSlots } from '@/lib/utils';

const handler = nc(ncOpts);
handler.use(...auths);

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

    const { timeSlots, date } = req.body;

    const daytimeSlots = await setDaytimeSlots(db, {
      userId: req.user._id,
      date,
      timeSlots: sortTimeSlots(timeSlots),
      allDayUnavailable: !timeSlots.length,
    });

    return res.json(daytimeSlots);
  }
);

handler.get(async (req, res) => {
  const db = await getMongoDb();
  try {
    const daytimeSlot = await findUserDaytimeSlots(db, {
      userId: req.user._id,
      date: req.query.date,
    });

    res.json(daytimeSlot);
  } catch (e) {
    res.json(null);
  }
});

export default handler;

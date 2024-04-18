import { auths, validateBody } from '@/api-lib/middlewares';
import {
  findUserDaytimeSlots,
  findUserDefaultTimeSlots,
  setDaytimeSlots,
} from '@/api-lib/db/schedule';

import { ObjectId } from 'mongodb';
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
      timeSlots,
      allDayUnavailable: !timeSlots.length,
    });

    return res.json(daytimeSlots);
  }
);

handler.get(async (req, res) => {
  const db = await getMongoDb();
  try {
    let timeSlots = [];
    let daytimeSlot = null;
    const { userId } = req.query;
    try {
      daytimeSlot = await findUserDaytimeSlots(db, {
        userId: new ObjectId(userId),
        date: req.query.date,
      });
      timeSlots = daytimeSlot.timeSlots;
    } catch (e) {
      // do nothing
    }

    if (!daytimeSlot) {
      try {
        const result = await findUserDefaultTimeSlots(db, new ObjectId(userId));
        timeSlots = result?.timeSlots || [];
      } catch (e) {
        // do nothing
      }
    }

    res.json(sortTimeSlots(timeSlots));
  } catch (e) {
    console.log('e', e);
    res.json([]);
  }
});

export default handler;

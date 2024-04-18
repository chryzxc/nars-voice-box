import { auths, validateBody } from '@/api-lib/middlewares';
import {
  findUserDefaultTimeSlots,
  setDefaultTimeSlots,
} from '@/api-lib/db/schedule';

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
      timeSlots: ValidateProps.schedule.timeSlots,
    },
  }),
  async (req, res) => {
    if (!req.user) {
      return res.status(401).end();
    }

    const db = await getMongoDb();

    const timeSlots = await setDefaultTimeSlots(db, {
      userId: req.user._id,
      timeSlots: sortTimeSlots(req.body.timeSlots),
    });

    return res.json(timeSlots);
  }
);

handler.get(async (req, res) => {
  const db = await getMongoDb();

  const result = await findUserDefaultTimeSlots(db, req.user._id);

  res.json(sortTimeSlots(result?.timeSlots) || []);
});

export default handler;

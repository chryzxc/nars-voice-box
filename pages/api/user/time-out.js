import { findAttendance, timeOut } from '@/api-lib/db/attendance';

import { auths } from '@/api-lib/middlewares';
import dayjs from 'dayjs';
import { getMongoDb } from '@/api-lib/mongodb';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';

const handler = nc(ncOpts);

handler.post(...auths, async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }

  const db = await getMongoDb();

  const existingAttendance = await findAttendance(db, req.user._id);
  const todaysAttendance = existingAttendance.find((attendance) =>
    dayjs().isSame(dayjs(attendance.timeIn), 'day')
  );

  if (!todaysAttendance) {
    return res.status(400).end();
  }

  const attendance = await timeOut(db, todaysAttendance._id);

  return res.json({ attendance });
});

export default handler;

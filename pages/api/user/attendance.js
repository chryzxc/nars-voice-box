import { auths } from '@/api-lib/middlewares';
import { findAttendances } from '@/api-lib/db';
import { getMongoDb } from '@/api-lib/mongodb';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';

const handler = nc(ncOpts);
handler.use(...auths);

handler.get(async (req, res) => {
  const db = await getMongoDb();
  console.log({ userId: req.user._id });
  const attendance = await findAttendances(db, req.user._id);

  res.json({ attendance });
});

export default handler;

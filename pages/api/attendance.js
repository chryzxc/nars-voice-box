import { auths } from '@/api-lib/middlewares';
import { findAttendance } from '@/api-lib/db';
import { getMongoDb } from '@/api-lib/mongodb';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';

const handler = nc(ncOpts);
handler.use(...auths);

handler.get(async (req, res) => {
  const db = await getMongoDb();

  const attendance = await findAttendance(db);

  res.json(attendance);
});

export default handler;

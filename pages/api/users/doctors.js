import { findUsers } from '@/api-lib/db';
import { getMongoDb } from '@/api-lib/mongodb';
import { isDoctor } from '@/lib/utils';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';

const handler = nc(ncOpts);

handler.get(async (req, res) => {
  const db = await getMongoDb();

  const users = await findUsers(db);

  const doctors = users.filter((user) => isDoctor(user.role));

  res.json(doctors);
});

export default handler;

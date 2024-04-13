import { auths } from '@/api-lib/middlewares';
import { getMongoDb } from '@/api-lib/mongodb';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';
import { timeIn } from '@/api-lib/db/attendance';

const handler = nc(ncOpts);

handler.post(
  ...auths,

  async (req, res) => {
    if (!req.user) {
      return res.status(401).end();
    }

    const db = await getMongoDb();

    const attendance = await timeIn(db, {
      userId: req.user._id,
    });

    return res.json({ attendance });
  }
);

export default handler;

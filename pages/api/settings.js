import { auths, validateBody } from '@/api-lib/middlewares';
import { getSettings, updateSettings } from '@/api-lib/db/settings';

import { ValidateProps } from '@/api-lib/constants';
import { getMongoDb } from '@/api-lib/mongodb';
import nc from 'next-connect';
import { ncOpts } from '@/api-lib/nc';
import { userRole } from '@/lib/constants';

const handler = nc(ncOpts);

handler.get(async (req, res) => {
  const db = await getMongoDb();

  const settings = await getSettings(db);

  res.json(settings);
});

handler.patch(
  ...auths,
  validateBody({
    type: 'object',
    properties: ValidateProps.settings,
    additionalProperties: false,
  }),
  async (req, res) => {
    if (!req.user || req.user.role !== userRole.admin) {
      return res.status(401).end();
    }

    try {
      const db = await getMongoDb();

      const newSettings = await updateSettings(db, req.body);

      return res.json(newSettings);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
);

export default handler;

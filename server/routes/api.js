import express from 'express';
import timesyncServer from 'timesync/server';

const router = express.Router();

router.get('/env', function (request, response) {
  const { env } = process;
  return response.json({ env });
});

router.get('/version', function (request, response) {
  const { version } = require('../package.json');
  return response.json({ version });
});


router.post('/timesync', function (request, response) {
  return timesyncServer.requestHandler(request, response);
});

export default router

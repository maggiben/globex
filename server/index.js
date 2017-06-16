import config from 'config';
import express from 'express';
import bodyParser from 'body-parser';
import timesyncServer from 'timesync/server';
import cookieParser from 'cookie-parser'
import cors from 'cors';

var PORT = 8080;

const app = express();
// App middleware
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser())
app.use(cors()); // for parsing application/json

app.get('/', function (req, res) {
  res.json({
    env: process.env
  })
})

// handle timesync requests
app.post('/timesync', function (req, res) {
  // console.log(timesyncServer.requestHandler)
  return timesyncServer.requestHandler(req, res);
  res.json({
    env: process.env
  })
})

//app.use('/', express.static(__dirname));
//app.use('/timesync/', express.static(__dirname + '/../../../dist'));

app.post('/timesync', function (req, res) {
  const data = {
    id: (req.body && 'id' in req.body) ? req.body.id : null,
    result: Date.now()
  };
  res.json(data);
});

app.listen(PORT);
console.log('Server listening at http://localhost:' + PORT);

export default app;
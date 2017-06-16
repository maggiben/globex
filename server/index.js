const express = require('express');
const bodyParser = require('body-parser');
const timesyncServer = require('timesync/server');
const cors = require('cors');

var PORT = 8080;

var app = express();
app.use(bodyParser.json()); // for parsing application/json
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
  var data = {
    id: (req.body && 'id' in req.body) ? req.body.id : null,
    result: Date.now()
  };
  res.json(data);
});

app.listen(PORT);
console.log('Server listening at http://localhost:' + PORT);
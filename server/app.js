var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var mitmsRouter = require('./routes/mitms');

var port = process.env.SATELLITE_PORT || '1234';
var watch = require('./lib/watch');
watch();

var app = express();

app.use(
  logger('dev', {
    skip: function(_, res) {
      return res.statusCode !== 200;
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use(function(_, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type,authorization',
  );
  next();
});

app.use('/', indexRouter);
app.use('/mitms', mitmsRouter);

app.listen(port, () => {
  console.log(`App running on port http://localhost:${port}`);
});

module.exports = app;

'use strict';

require('dotenv').config({ path: '.env'})
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser')

const { PORT, CLIENT_ORIGIN } = require('./config');
// const { dbConnect } = require('./db-mongoose');
const jwt = require('_helpers/jwt');
const errorHandler = require('_helpers/error-handler');

const sendATextRouter = require('./sms/sendSms')

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(jwt())

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

// api routes
app.use('/users', require('./users/users.controller'));


// TODO: This probably won't be needed, but is there a way to forward an incoming message to the user? That would cost money though. How about putting them
// into their account to view later, somehow? 
// If this is needed, break it out to its own file.
app.post('/sms', (req, res, next) => {
  // [matt]: https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply-node-js
  // When a message comes in to the server, this Messaging Response sends this message in return
  const twiml = new MessagingResponse();
  console.log('[matt] req.body', req.body)

  if (req.body.Body.toLowerCase() === 'moo') {
    twiml.message('This is an automated message MOO')
  } else {
    twiml.message('This is an automated message');
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.use('/sendsms', sendATextRouter)


app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// global error handler
app.use(errorHandler);


function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  // dbConnect();
  runServer();
}

module.exports = { app };

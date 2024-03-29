"use strict";

require("dotenv").config({ path: ".env" });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const { PORT, CLIENT_ORIGIN } = require("./config");
const jwt = require("./_helpers/jwt");
const errorHandler = require("./_helpers/error-handler");
const MessagingResponse = require("twilio").twiml.MessagingResponse;

const sendATextRouter = require("./sms/sendSms");

const app = express();

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  morgan(process.env.NODE_ENV === "production" ? "common" : "dev", {
    skip: (req, res) => process.env.NODE_ENV === "test",
  })
);

app.post("/sms", (req, res) => {
  // [matt]: https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply-node-js
  // When a message comes in to the server, this Messaging Response sends this message in return
  const reply = new MessagingResponse();
  reply.message(
    "These messages are not monitored. Please contact Julie or Virginia by calling or texting 813-644-7282."
  );
  // console.log('[matt] req', req)

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(reply.toString());
});

app.use(jwt());

// api routes
app.use(
  "/users",
  cors({
    origin: CLIENT_ORIGIN,
  }),
  require("./users/users.controller")
);

app.use("/sendsms", sendATextRouter);

// TODO: This probably won't be needed, but is there a way to forward an incoming message to the user? That would cost money though. How about putting them
// into their account to view later, somehow?
// If this is needed, break it out to its own file.

// global error handler
app.use(errorHandler);

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on("error", (err) => {
      console.error("Express failed to start");
      console.error(err);
    });
}

if (require.main === module) {
  // dbConnect();
  runServer();
}

module.exports = { app };

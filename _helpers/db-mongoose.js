"use strict";

const mongoose = require("mongoose");
const config = require("../config");

mongoose.connect(config.DATABASE_URL, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

module.exports = {
  User: require("../users/user.model"),
};

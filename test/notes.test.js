'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const seedNotes = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

describe('what?', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
  beforeEach(function () {
    return Note.insertMany(seedNotes);
  });
  afterEach(function (done) {
    return mongoose.connection.db.dropDatabase();
  });
  after(function (done) {
    return mongoose.disconnect();
  });
});
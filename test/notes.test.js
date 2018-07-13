'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Notes API tests', function () {
  before(function() {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });
  beforeEach(function() {
    return Note.insertMany(seedNotes, seedFolders);
  });
  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });
  after(function() {
    return mongoose.disconnect();
  });

  // GET ALL
  describe('GET /api/notes', function() {
    it('should return the correct count of notes', function() {
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        .then(([data,res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  });

  // GET BY ID
  describe('GET /api/notes/:id', function() {
    it('should return the correct note by id', function() {
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId');

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    it('should return 404 status when an invalid id is provided', function() {
      let id = '000000000000000000000099';
      return chai.request(app).get(`/api/notes/${id}`)
        .then((res) => {
          expect(res).to.have.status(404);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
        });
    });
  });

  // POST/CREATE
  describe('POST /api/notes', function() {
    it('should create and return a new item when provided valid data', function () {
      const testData = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'folderId': '111111111111111111111102'
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(testData)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId');
          // 2) then call the database
          return Note.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
    it('should return a 400 error if post is sent without title', function() {
      let testData = {
        title: ''
      };
      return chai.request(app).post('/api/notes').send(testData)
        .then((res) => {
          expect(res).to.have.status(400);
        });
    });
  });

  // PUT UPDATE
  describe('PUT /api/notes/:id', function() {
    it('should update a note by id', function(){
      let data;
      const updateInfo = {
        'title': 'Homer Simpson',
        'content': 'Homer is one of the most influential characters in the history of television, and is widely considered to be an American cultural icon.',
        'folderId': '111111111111111111111102'
      };
      return Note.findOne()
        .then((_data) => {
          data = _data;
          updateInfo.id = data.id;
          return chai.request(app).put(`/api/notes/${data.id}`).send(updateInfo);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(updateInfo.title);
          expect(res.body.content).to.equal(updateInfo.content);
        });
    });
    it('should throw a 400 if note is sent without a title', function() {
      const testData = {
        'title': '',
      };
      let data;
      return Note.findOne()
        .then((_data) => {
          data = _data;
          testData.id = data.id;
          return chai.request(app).put(`/api/notes/${data.id}`).send(testData);
        })
        .then((res) => {
          expect(res).to.have.status(400);
        });
    });
  });
  // DELETE
  describe('DELETE /api/notes/:id', function() {
    it('should delete a note by id', function() {
      let data;
      return Note.findOne()
        .then((_data) => {
          data = _data;
          return chai.request(app).delete(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(204);
          return Note.findById(data.id);
        })
        .then((res) => {
          expect(res).to.be.null;
        });
    });
    it('should return 404 if id is invalid', function() {
      let testData = '';
      return chai.request(app).delete(`/api/notes/${testData}`)
        .then((res) => {
          expect(res).to.have.status(404);
        });
    });
  });
});
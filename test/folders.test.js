'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

const seedNotes = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Folders API tests', function () {
  before(function() {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });
  beforeEach(function() {
    return Folder.insertMany(seedNotes);
  });
  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });
  after(function() {
    return mongoose.disconnect();
  });

  // GET ALL
  describe('GET /api/folders', function() {
    it('should return the correct count of folders', function() {
      return Promise.all([
        Folder.find(),
        chai.request(app).get('/api/folders')
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
  describe('GET /api/folders/:id', function() {
    it('should return the correct folder by id', function() {
      let data;
      // 1) First, call the database
      return Folder.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/folders/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

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
      return chai.request(app).get(`/api/folders/${id}`)
        .then((res) => {
          expect(res).to.have.status(404);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
        });
    });
  });

  // POST/CREATE
  describe('POST /api/folders', function() {
    it('should create and return a new item when provided valid data', function () {
      const testData = {
        name: 'bacon'
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/folders')
        .send(testData)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Folder.findById(res.body.id);
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
      return chai.request(app).post('/api/folders').send(testData)
        .then((res) => {
          expect(res).to.have.status(400);
        });
    });
  });

  // PUT UPDATE
  describe('PUT /api/folders/:id', function() {
    it('should update a folder by id', function(){
      let data;
      const updateInfo = {
        name: 'Bills'
      };
      return Folder.findOne()
        .then((_data) => {
          data = _data;
          updateInfo.id = data.id;
          return chai.request(app).put(`/api/folders/${data.id}`).send(updateInfo);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(updateInfo.title);
          expect(res.body.content).to.equal(updateInfo.content);
        });
    });
    it('should throw a 400 if folder is sent without a title', function() {
      const testData = {
        'title': '',
      };
      let data;
      return Folder.findOne()
        .then((_data) => {
          data = _data;
          testData.id = data.id;
          return chai.request(app).put(`/api/folders/${data.id}`).send(testData);
        })
        .then((res) => {
          expect(res).to.have.status(400);
        });
    });
  });
  // DELETE
  describe('DELETE /api/folders/:id', function() {
    it('should delete a folder by id', function() {
      let data;
      return Folder.findOne()
        .then((_data) => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(204);
          return Folder.findById(data.id);
        })
        .then((res) => {
          expect(res).to.be.null;
        });
    });
    it('should return 404 if id is invalid', function() {
      let testData = '';
      return chai.request(app).delete(`/api/folders/${testData}`)
        .then((res) => {
          expect(res).to.have.status(404);
        });
    });
  });
});
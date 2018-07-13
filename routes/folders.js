'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const router = express.Router();

// GET ALL /FOLDERS
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  let filter = {};

  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm }}
    ];
  }

  Folder.find(filter).sort({ name: 'asc' })
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// GET /FOLDERS BY ID
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if(!(mongoose.Types.ObjectId.isValid(id))) {
    const message = 'not a valid Mongo ObjectId';
    console.error(message);
    return res.status(404).send(message);
  }

  Folder.findById(id)
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// POST /FOLDERS TO CREATE A NEW FOLDER
router.post('/', (req, res, next) => {
  const newFolder = {
    name: req.body.name
  };

  // VALIDATE USER INPUT
  if(!newFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Folder.create(newFolder)
    .then(response => {
      res.location(`http://${req.headers.host}/folders/${response.id}`).status(201).json(response);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
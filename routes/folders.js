'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const router = express.Router();

// GET ALL FOLDERS
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

// GET A SINGLE FOLDER BY ID
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if(!(mongoose.Types.ObjectId.isValid(id))) {
    const message = 'these are not the droids you are looking for';
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

module.exports = router;
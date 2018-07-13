'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const Note = require('../models/note');
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
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// POST /FOLDERS BY ID TO UPDATE A FOLDER NAME
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const updateObj = {
    name: req.body.name
  };

  // VALIDATE USER INPUT
  if(!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  if(!(mongoose.Types.ObjectId.isValid(id))) {
    const message = 'not a valid Mongo ObjectId';
    console.error(message);
    return res.status(404).send(message);
  }

  Folder.findByIdAndUpdate(id, updateObj)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// DELETE /FOLDERS BY ID WHICH DELETES THE FOLDER AND THE RELATED NOTES
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  // ON DELETE SET NULL equivalent
  const folderRemovePromise = Folder.findByIdAndRemove( id );
  // ON DELETE CASCADE equivalent
  // const noteRemovePromise = Note.deleteMany({ folderId: id });

  const noteRemovePromise = Note.updateMany(
    { folderId: id },
    { $unset: { folderId: '' } }
  );

  Promise.all([folderRemovePromise, noteRemovePromise])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
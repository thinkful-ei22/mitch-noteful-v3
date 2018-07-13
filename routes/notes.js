'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm, folderId } = req.query;
  let filter = {};

  if (searchTerm || folderId) {
    filter.$and = [];
  }

  if (searchTerm) {
    filter.$and.push(
      { $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } }
      ]}
    );
  }

  if (folderId) {
    filter.$and.push(
      { folderId: folderId }
    );
  }

  Note.find(filter).sort({ updatedAt: 'desc' })
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

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  Note.findById(id)
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

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const newNote = {
    title: req.body.title,
    content: req.body.content,
    folderId: req.body.folderId
  };

  /***** Never trust users - validate input *****/
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (req.body.folderId) {
    if (!mongoose.Types.ObjectId.isValid(req.body.folderId)) {
      const err = new Error('The `folderId` is not valid');
      err.status = 400;
      return next(err);
    }
  }

  Note.create(newNote)
    .then(response => {
      res.location(`http://${req.headers.host}/notes/${response.id}`).status(201).json(response);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const updateObj = {
    title: req.body.title,
    content: req.body.content,
    folderId: req.body.folderId
  };
  
  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (req.body.folderId) {
    if (!mongoose.Types.ObjectId.isValid(req.body.folderId)) {
      const err = new Error('The `folderId` is not valid');
      err.status = 400;
      return next(err);
    }
  }

  const options = { new: true };

  Note.findByIdAndUpdate(id, updateObj, options)
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  Note.findByIdAndRemove(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
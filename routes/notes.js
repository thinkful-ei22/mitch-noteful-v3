'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const searchTerm = req.query.searchTerm;
      let filter = {};

      if (searchTerm) {
        filter.$or = [
          { title: { $regex: searchTerm } },
          { content: { $regex: searchTerm } }
        ];
      }

      return Note.find(filter).sort({ updatedAt: 'desc' });
    })
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const id = req.params.id;

      return Note.findById(id);
    })
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const newNote = {
        title: req.body.title,
        content: req.body.content
      };

      /***** Never trust users - validate input *****/
      if (!newNote.title) {
        const err = new Error('Missing `title` in request body');
        err.status = 400;
        return next(err);
      }

      return Note.create(newNote);
    })
    .then(response => {
      res.location(`http://${req.headers.host}/notes/${response.id}`).status(201).json(response);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const id = req.params.id;
      const updateObj = {
        title: req.body.title,
        content: req.body.content
      };
      
      /***** Never trust users - validate input *****/
      if (!updateObj.title) {
        const err = new Error('Missing `title` in request body');
        err.status = 400;
        return next(err);
      }

      const options = { new: true };

      return Note.findByIdAndUpdate(id, updateObj, options);
    })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      const id = req.params.id;

      return Note.findByIdAndRemove(id);
    })
    .then(() => {
      res.sendStatus(204);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
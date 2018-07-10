'use strict';

const mongoose = require('mongoose');

// schema
const noteSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: String 
});

noteSchema.set('timestamps', true);

module.exports = mongoose.model('Note', noteSchema);
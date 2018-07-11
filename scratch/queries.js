'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// Find/Search for notes using Note.find 
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const searchTerm = 'Lady Gaga';
//     let filter = {};

//     if (searchTerm) {
//       filter.$or = [
//         { title: { $regex: searchTerm } },
//         { content: { $regex: searchTerm } }
//       ];
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Find note by id using Note.findbyId
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '000000000000000000000005';
//     let filter = {};

//     return Note.findById(id);
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Create a new note using Note.create
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const newNote = {
//       title: 'JUMANJI',
//       content: 'I\'ve seen things you\'ve only seen in your nightmares. Things you can\'t even imagine; things you can\'t even see. ' + 
//       'There are things that hunt you in the night. Then something screams. ' +
//       'Then you hear them eating, and you hope to god that you\'re not dessert. Afraid? You don\'t even know what afraid is.'
//     };

//     return Note.create(newNote);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

//Update a note by id using Note.findByIdAndUpdate
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '000000000000000000000007';
//     const updateObj = {
//       title: 'Samantha Carter',
//       content: 'Maybourne, you are an idiot every day of the week. Why couldn\'t you have taken one day off?'
//     };
//     const options = { new: true };

//     return Note.findByIdAndUpdate(id, updateObj, options);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });

// Delete a note by id using Note.findByIdAndRemove
// mongoose.connect(MONGODB_URI)
//   .then(() => {
//     const id = '000000000000000000000007';

//     return Note.findByIdAndRemove(id);
//   })
//   .then(result => {
//     console.log(result);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });
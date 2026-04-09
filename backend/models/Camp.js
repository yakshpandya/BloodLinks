const mongoose = require('mongoose');

const campSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  date: { type: String },
  time: { type: String },
  org: { type: String },
  phone: { type: String },
  desc: { type: String },
  type: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Camp', campSchema);

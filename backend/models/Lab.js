const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  phone: { type: String },
  type: { type: String, default: 'Private' },
  nabl: { type: Boolean, default: false },
  hours: { type: String },
  services: { type: String },
  desc: { type: String },
  city: { type: String },
  state: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Lab', labSchema);

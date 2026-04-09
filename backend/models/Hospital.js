const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  phone: { type: String, trim: true },
  type: { type: String, default: 'Government' },
  bloodBank: { type: Boolean, default: false },
  desc: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Hospital', hospitalSchema);

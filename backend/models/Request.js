const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  phone: { type: String },
  email: { type: String, lowercase: true },
  bloodGroup: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  urgency: { type: String, enum: ['normal', 'urgent', 'critical'], default: 'normal' },
  hospital: { type: String },
  status: { type: String, enum: ['pending', 'fulfilled', 'cancelled'], default: 'pending' },
  units: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);

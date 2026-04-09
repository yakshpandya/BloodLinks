const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bloodBankSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  license: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  location: { type: String, trim: true },
  phone: { type: mongoose.Schema.Types.Mixed },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  hours: { type: String, default: '24 Hours' },
  services: [String],
  desc: { type: String },
  verified: { type: Boolean, default: false },
  type: { type: String, default: 'bloodbank' },
  helpline: String,
  fax: String,
  nodalOfficer: {
    name: String, phone: String, email: String, designation: String,
  },
  bloodComponentAvailable: { type: Boolean, default: false },
  bloodGroups: [String],
  timings: String,
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  latitude: Number,
  longitude: Number,
}, { timestamps: true });

bloodBankSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

bloodBankSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('BloodBank', bloodBankSchema);

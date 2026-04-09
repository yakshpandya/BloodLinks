const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const donorSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  dob: { type: String },
  gender: { type: String },
  bloodGroup: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  type: { type: String, default: 'donor' },
}, { timestamps: true });

donorSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

donorSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Donor', donorSchema);

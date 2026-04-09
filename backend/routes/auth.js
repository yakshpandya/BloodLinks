const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Donor = require('../models/Donor');
const BloodBank = require('../models/BloodBank');
const { verifyToken, adminOnly } = require('../middleware/auth');

const router = express.Router();

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

/* ==================== ADMIN AUTH ==================== */

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required.' });

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) return res.status(401).json({ error: 'Invalid username or password.' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid username or password.' });

    const token = signToken({ id: admin._id, username: admin.username, role: admin.role, type: 'admin' });
    res.json({ token, user: { id: admin._id, username: admin.username, email: admin.email, role: admin.role, type: 'admin' } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Admin Register (protected — only existing admins can create new admins)
router.post('/admin/register', verifyToken, adminOnly, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields are required.' });

    const exists = await Admin.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(400).json({ error: 'Admin with this username or email already exists.' });

    const admin = await Admin.create({ username: username.toLowerCase().trim(), email, password, role: role || 'admin' });
    res.status(201).json({ message: 'Admin created.', admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ==================== DONOR AUTH ==================== */

// Donor Register
router.post('/donor/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, dob, gender, bloodGroup, city, state } = req.body;
    if (!firstName || !lastName || !email || !phone || !password || !bloodGroup || !city || !state) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const exists = await Donor.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'An account with this email already exists.' });

    const donor = await Donor.create({
      firstName, lastName, name: firstName + ' ' + lastName,
      email, phone, password, dob, gender, bloodGroup, city, state, type: 'donor'
    });

    const token = signToken({ id: donor._id, email: donor.email, type: 'donor' });
    res.status(201).json({
      token,
      user: { id: donor._id, firstName: donor.firstName, lastName: donor.lastName, name: donor.name, email: donor.email, phone: donor.phone, bloodGroup: donor.bloodGroup, city: donor.city, state: donor.state, type: 'donor', createdAt: donor.createdAt }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Donor Login
router.post('/donor/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const donor = await Donor.findOne({ email: email.toLowerCase() });
    if (!donor) return res.status(401).json({ error: 'No account found with this email.' });

    const isMatch = await donor.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password.' });

    const token = signToken({ id: donor._id, email: donor.email, type: 'donor' });
    res.json({
      token,
      user: { id: donor._id, firstName: donor.firstName, lastName: donor.lastName, name: donor.name, email: donor.email, phone: donor.phone, bloodGroup: donor.bloodGroup, city: donor.city, state: donor.state, type: 'donor', createdAt: donor.createdAt }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ==================== BLOOD BANK AUTH ==================== */

// Blood Bank Register
router.post('/bank/register', async (req, res) => {
  try {
    const { name, category, license, address, city, state, phone, email, password, hours, services, desc } = req.body;
    if (!name || !category || !license || !address || !city || !state || !phone || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const exists = await BloodBank.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'An account with this email already exists.' });

    const bank = await BloodBank.create({
      name, category, license, address, city, state, phone, email, password,
      hours: hours || '24 Hours', services: services || [], desc,
      location: city + ', ' + state, type: 'bloodbank', verified: false
    });

    const token = signToken({ id: bank._id, email: bank.email, type: 'bloodbank' });
    res.status(201).json({
      token,
      user: { id: bank._id, name: bank.name, email: bank.email, category: bank.category, city: bank.city, type: 'bloodbank', createdAt: bank.createdAt }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// Blood Bank Login
router.post('/bank/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const bank = await BloodBank.findOne({ email: email.toLowerCase() });
    if (!bank) return res.status(401).json({ error: 'No blood bank found with this email.' });

    const isMatch = await bank.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password.' });

    const token = signToken({ id: bank._id, email: bank.email, type: 'bloodbank' });
    res.json({
      token,
      user: { id: bank._id, name: bank.name, email: bank.email, category: bank.category, city: bank.city, state: bank.state, type: 'bloodbank', verified: bank.verified, createdAt: bank.createdAt }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ==================== TOKEN VERIFY ==================== */
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (req.user.type === 'admin') {
      const admin = await Admin.findById(req.user.id).select('-password');
      if (!admin) return res.status(404).json({ error: 'Admin not found.' });
      return res.json({ user: admin, type: 'admin' });
    } else if (req.user.type === 'donor') {
      const donor = await Donor.findById(req.user.id).select('-password');
      if (!donor) return res.status(404).json({ error: 'Donor not found.' });
      return res.json({ user: donor, type: 'donor' });
    } else if (req.user.type === 'bloodbank') {
      const bank = await BloodBank.findById(req.user.id).select('-password');
      if (!bank) return res.status(404).json({ error: 'Blood bank not found.' });
      return res.json({ user: bank, type: 'bloodbank' });
    }
    res.status(400).json({ error: 'Unknown user type.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;

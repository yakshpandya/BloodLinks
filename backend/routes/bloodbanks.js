const express = require('express');
const BloodBank = require('../models/BloodBank');
const { verifyToken, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET all blood banks (public) — excludes password
router.get('/', async (req, res) => {
  try {
    const banks = await BloodBank.find().select('-password').sort({ createdAt: -1 });
    res.json(banks);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// GET single blood bank by ID
router.get('/:id', async (req, res) => {
  try {
    const bank = await BloodBank.findById(req.params.id).select('-password');
    if (!bank) return res.status(404).json({ error: 'Blood bank not found.' });
    res.json(bank);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// PUT verify a blood bank (admin only)
router.put('/:id/verify', verifyToken, adminOnly, async (req, res) => {
  try {
    const bank = await BloodBank.findByIdAndUpdate(req.params.id, { verified: true }, { new: true }).select('-password');
    res.json(bank);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// DELETE blood bank (admin only)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await BloodBank.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blood bank deleted.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

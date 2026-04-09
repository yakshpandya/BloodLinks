const express = require('express');
const Hospital = require('../models/Hospital');
const { verifyToken, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET all hospitals (public)
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// POST add hospital (admin or public)
router.post('/', async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json(hospital);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// DELETE hospital (admin only)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ message: 'Hospital deleted.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

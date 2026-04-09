const express = require('express');
const Donor = require('../models/Donor');
const { verifyToken, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET all donors (admin)
router.get('/', async (req, res) => {
  try {
    const donors = await Donor.find().select('-password').sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// DELETE donor (admin)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donor deleted.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

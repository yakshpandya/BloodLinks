const express = require('express');
const Lab = require('../models/Lab');
const { verifyToken, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const labs = await Lab.find().sort({ createdAt: -1 });
    res.json(labs);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.post('/', async (req, res) => {
  try {
    const lab = await Lab.create(req.body);
    res.status(201).json(lab);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await Lab.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lab deleted.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

const express = require('express');
const Camp = require('../models/Camp');
const { verifyToken, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: -1 });
    res.json(camps);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.post('/', async (req, res) => {
  try {
    const camp = await Camp.create(req.body);
    res.status(201).json(camp);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await Camp.findByIdAndDelete(req.params.id);
    res.json({ message: 'Camp deleted.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

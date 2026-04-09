const express = require('express');
const Request = require('../models/Request');
const { verifyToken, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET all requests (admin)
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// POST create request (public)
router.post('/', async (req, res) => {
  try {
    const request = await Request.create(req.body);
    res.status(201).json(request);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// PUT update request status (admin or bank)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(request);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// DELETE request (admin)
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

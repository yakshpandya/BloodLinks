const express = require('express');
const Message = require('../models/Message');
const { verifyToken, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET all messages (admin)
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// POST send message (public)
router.post('/', async (req, res) => {
  try {
    const msg = await Message.create(req.body);
    res.status(201).json(msg);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// PUT mark as read
router.put('/:id/read', verifyToken, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
    res.json(msg);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// DELETE message
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// DELETE all messages
router.delete('/', verifyToken, adminOnly, async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ message: 'All messages cleared.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;

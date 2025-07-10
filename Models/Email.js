// server/Routes/email.js
import express from 'express';
import multer from 'multer';
import Email from '../Models/Email.js';
import path from 'path';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ✅ Send Email
router.post('/send', upload.single('attachment'), async (req, res) => {
  try {
    const { from, to, subject, body, labels } = req.body;

    if (!from || !to || !subject || !body) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newEmail = new Email({
      from,
      to,
      subject,
      body,
      labels: labels ? JSON.parse(labels) : [],
      attachment: req.file ? req.file.path : null,
    });

    await newEmail.save();
    req.app.get('io')?.emit('emailReceived', newEmail);

    res.status(201).json({ message: 'Email sent', email: newEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ✅ Inbox
router.get('/inbox/:email', async (req, res) => {
  try {
    const inbox = await Email.find({ to: req.params.email }).sort({ createdAt: -1 });
    res.json(inbox);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Sent Mails
router.get('/sent/:email', async (req, res) => {
  try {
    const sent = await Email.find({ from: req.params.email }).sort({ createdAt: -1 });
    res.json(sent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Read Email by ID
router.put('/read/:id', async (req, res) => {
  try {
    const updated = await Email.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Email by ID
router.delete('/:id', async (req, res) => {
  try {
    await Email.findByIdAndDelete(req.params.id);
    res.json({ message: 'Email deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Email by ID (for reading full message)
router.get('/:id', async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) return res.status(404).json({ error: 'Email not found' });
    res.json(email);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

// Models/Email.js
import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  labels: {
    type: [String],
    default: [], // e.g., ['Inbox', 'Starred', 'Snoozed']
  },
  attachment: {
    type: String, // stores file path like 'uploads/filename.pdf'
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // ✅ Adds createdAt and updatedAt
});

export default mongoose.model('Email', emailSchema);

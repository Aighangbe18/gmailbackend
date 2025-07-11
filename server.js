// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

import authRoutes from './Routes/auth.js';
import emailRoutes from './Routes/email.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Allowed Origins for CORS (adjust as needed)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://gmail-gamma-six.vercel.app',
  'https://your-custom-domain.com', // Optional: add your domain if needed
];

// ✅ CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ✅ Express Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Only need this once

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// ✅ Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Socket.IO not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io); // Attach io instance globally

// ✅ Socket.IO Events
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// ✅ MongoDB Connection and Server Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  server.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

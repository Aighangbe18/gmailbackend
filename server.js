// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import authRoutes from './Routes/auth.js';
import emailRoutes from './Routes/email.js';

dotenv.config(); // Load .env

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'https://gmail-gamma-six.vercel.app/',
];

// ✅ Set up Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
app.set('io', io); // Make io accessible in routes

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve attachments

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// ✅ Socket.IO Events
io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// ✅ MongoDB + Server Start
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
app.use('/uploads', express.static('uploads'));

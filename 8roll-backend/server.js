// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ngrok from 'ngrok'; // <-- Added ngrok import
dotenv.config();

import studentsRoutes from './routes/students.js';
import coursesRoutes from './routes/courses.js';
import batchesRoutes from './routes/batches.js';
import paymentsRoutes from './routes/payments.js';

const app = express();
app.use(cors({
  origin: '*', // or 'http://localhost:5173'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning']
}));
app.use(express.json());

// Health check
app.get('/', (req, res) =>
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' })
);

// API routes
app.use('/api/students', studentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/payments', paymentsRoutes);

// generic 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 5000;

// Start server and ngrok tunnel
app.listen(PORT, async () => {
  console.log(`Local server running at http://localhost:${PORT}`);

  if (process.env.USE_NGROK === 'true') {
    try {
      const url = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTH_TOKEN, // Put this in .env
      });
      console.log(`Public URL: ${url}`);
    } catch (err) {
      console.error('Error starting ngrok:', err);
    }
  }
});

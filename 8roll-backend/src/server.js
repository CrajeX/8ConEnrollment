// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import studentsRoutes from '../routes/students.js';
import coursesRoutes from '../routes/courses.js';
import batchesRoutes from '../routes/batches.js';
import paymentsRoutes from '../routes/payments.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// API routes
app.use('/api/students', studentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/payments', paymentsRoutes);

// generic 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});

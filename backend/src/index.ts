import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (to be implemented)
app.use('/api/auth', (req, res) => {
  res.json({ message: 'Auth routes coming soon' });
});

app.use('/api/robots', (req, res) => {
  res.json({ message: 'Robot routes coming soon' });
});

app.use('/api/prestamos', (req, res) => {
  res.json({ message: 'Loan routes coming soon' });
});

app.use('/api/usuarios', (req, res) => {
  res.json({ message: 'User routes coming soon' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

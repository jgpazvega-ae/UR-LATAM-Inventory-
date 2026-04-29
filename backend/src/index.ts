import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import prestamoRoutes from './routes/prestamo.routes';
import robotRoutes from './routes/robot.routes';
import configuracionRoutes from './routes/configuracion.routes';
import testRoutes from './routes/test.routes';
import regionRoutes from './routes/region.routes';
import { iniciarCronJobs } from './services/notification.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/prestamos', prestamoRoutes);
app.use('/api/robots', robotRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/regiones', regionRoutes);
app.use('/api/test', testRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, async () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);

  if (process.env.NODE_ENV !== 'test') {
    try {
      await iniciarCronJobs();
      console.log('✅ Cron jobs iniciados');
    } catch (err) {
      console.error('⚠️ Error iniciando cron jobs:', err);
    }
  }
});

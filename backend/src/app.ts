import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'success', message: 'Jivara Backend is running' });
});

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    name: 'Jivara API', 
    version: '1.0.0',
    framework: 'Express.js',
    status: 'Healthy'
  });
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST - try multiple locations
const envResult = dotenv.config({ path: path.join(__dirname, '.env') });
if (envResult.error) {
  console.log('⚠️  No .env file found in server directory, trying root...');
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
}

// Debug environment variables
console.log('🔍 Environment Debug:');
console.log('📧 EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('🔗 SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set ✅' : 'Missing ❌');
console.log('🔑 SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set ✅' : 'Missing ❌');
console.log('🔑 SUPABASE_API_KEY:', process.env.SUPABASE_API_KEY ? 'Set ✅' : 'Missing ❌');

// Import config and utils AFTER dotenv
import connectDB from './config/database.js';
import { errorHandler, notFound } from './utils/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import teamRoutes from './routes/team.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL?.split(',') || ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TaskFlow Pro API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    emailService: process.env.EMAIL_SERVICE || 'development'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  
  // Email service status
  const emailService = process.env.EMAIL_SERVICE || 'development';
  console.log(`📧 Email Service: ${emailService}`);
  
  if (emailService === 'development') {
    console.log(`📧 Email Mode: Development (emails logged to console)`);
  } else if (emailService === 'supabase') {
    const hasSupabaseUrl = !!process.env.SUPABASE_URL;
    const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (hasSupabaseUrl && hasSupabaseKey) {
      console.log(`📧 Email Mode: Supabase (configured ✅)`);
      console.log(`📧 Supabase URL: ${process.env.SUPABASE_URL}`);
    } else {
      console.log(`📧 Email Mode: Supabase (⚠️  credentials missing)`);
      console.log(`📧 Missing: ${!hasSupabaseUrl ? 'SUPABASE_URL ' : ''}${!hasSupabaseKey ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`);
    }
  } else if (emailService === 'gmail') {
    const hasGmailUser = !!process.env.EMAIL_USER;
    const hasGmailPass = !!process.env.EMAIL_PASS;
    
    if (hasGmailUser && hasGmailPass) {
      console.log(`📧 Email Mode: Gmail (configured)`);
    } else {
      console.log(`📧 Email Mode: Gmail (⚠️  credentials missing)`);
      console.log(`📧 Missing: ${!hasGmailUser ? 'EMAIL_USER ' : ''}${!hasGmailPass ? 'EMAIL_PASS' : ''}`);
    }
  }
});
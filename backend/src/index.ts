/**
 * AegisSign - Server Entry Point
 * 
 * Zero-Trust Digital Signature Platform
 * Express server with MongoDB connection.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes/index.js';

// ============================================================================
// Configuration
// ============================================================================

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aegissign';

// ============================================================================
// Express App Setup
// ============================================================================

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// Routes
// ============================================================================

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({
        name: 'AegisSign API',
        version: '1.0.0',
        description: 'Zero-Trust Digital Signature Platform',
        endpoints: {
            health: 'GET /api/health',
            signup: 'POST /api/auth/signup',
            login: 'POST /api/auth/login',
            profile: 'GET /api/auth/profile',
            sign: 'POST /api/documents/sign',
            verify: 'POST /api/documents/verify'
        }
    });
});

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[ERROR]', err);

    // Handle multer errors
    if (err.message === 'Only PDF files are allowed') {
        res.status(400).json({
            success: false,
            message: 'Only PDF files are allowed'
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ============================================================================
// Database Connection & Server Start
// ============================================================================

async function startServer(): Promise<void> {
    try {
        // Connect to MongoDB
        console.log('[DB] Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('[DB] Connected to MongoDB successfully');

        // Start the server
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════╗');
            console.log('║                                                            ║');
            console.log('║             🛡️  AEGISSIGN SERVER RUNNING  🛡️               ║');
            console.log('║                                                            ║');
            console.log('║        Zero-Trust Digital Signature Platform               ║');
            console.log('║                                                            ║');
            console.log(`║        Server: http://localhost:${PORT}                      ║`);
            console.log('║                                                            ║');
            console.log('╚════════════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('[STARTUP] Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[SHUTDOWN] Received SIGINT, shutting down gracefully...');
    await mongoose.connection.close();
    console.log('[SHUTDOWN] MongoDB connection closed');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n[SHUTDOWN] Received SIGTERM, shutting down gracefully...');
    await mongoose.connection.close();
    console.log('[SHUTDOWN] MongoDB connection closed');
    process.exit(0);
});

// Start the server
startServer();

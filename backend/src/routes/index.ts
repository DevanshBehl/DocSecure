/**
 * AegisSign - Route Definitions
 * 
 * API endpoints for authentication and document operations.
 */

import { Router } from 'express';
import multer from 'multer';
import { signup, login, getProfile } from '../controllers/authController.js';
import { signDocument, verifyDocument } from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';

// ============================================================================
// Multer Configuration (Memory Storage for Stateless Operation)
// ============================================================================

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// ============================================================================
// Router Setup
// ============================================================================

const router = Router();

// ============================================================================
// Health Check
// ============================================================================

router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'AegisSign API is running',
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// Authentication Routes
// ============================================================================

/**
 * POST /api/auth/signup
 * Register a new user with Zero-Knowledge key generation
 * Body: { email: string, password: string }
 */
router.post('/auth/signup', signup);

/**
 * POST /api/auth/login
 * Authenticate user and receive JWT token
 * Body: { email: string, password: string }
 */
router.post('/auth/login', login);

/**
 * GET /api/auth/profile
 * Get authenticated user's profile
 * Headers: Authorization: Bearer <token>
 */
router.get('/auth/profile', authenticate, getProfile);

// ============================================================================
// Document Routes
// ============================================================================

/**
 * POST /api/documents/sign
 * Sign a PDF document (requires authentication + password)
 * Headers: Authorization: Bearer <token>
 * Body: multipart/form-data
 *   - file: PDF document
 *   - password: User's password (to decrypt signing key)
 * Response: Signed PDF file download
 */
router.post(
    '/documents/sign',
    authenticate,
    upload.single('file'),
    signDocument as any
);

/**
 * POST /api/documents/verify
 * Verify a signed PDF document (requires authentication)
 * Headers: Authorization: Bearer <token>
 * Body: multipart/form-data
 *   - file: Signed PDF document
 * Response: { verified: boolean, signerPublicKey: string, signerEmail: string }
 */
router.post(
    '/documents/verify',
    authenticate,
    upload.single('file'),
    verifyDocument as any
);

// ============================================================================
// Export
// ============================================================================

export default router;

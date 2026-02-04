/**
 * AegisSign - Authentication Middleware
 * 
 * JWT-based authentication middleware for protected routes.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ============================================================================
// Type Definitions
// ============================================================================

interface JwtPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}

export interface AuthenticatedRequest extends Request {
    userId: string;
    userEmail: string;
}

// ============================================================================
// Middleware
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

/**
 * Authenticates requests using JWT Bearer token
 * 
 * Expects: Authorization: Bearer <token>
 */
export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a valid token.'
            });
            return;
        }

        // Extract token from "Bearer <token>" format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({
                success: false,
                message: 'Invalid authorization format. Use: Bearer <token>'
            });
            return;
        }

        const token = parts[1];

        // Verify and decode the token
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Attach user info to request object
        (req as AuthenticatedRequest).userId = decoded.userId;
        (req as AuthenticatedRequest).userEmail = decoded.email;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired. Please log in again.'
            });
            return;
        }

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.'
            });
            return;
        }

        console.error('[AUTH MIDDLEWARE] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
}

/**
 * Optional authentication - attaches user info if token is present
 * but doesn't reject requests without tokens
 */
export function optionalAuthenticate(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const token = parts[1];
                const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
                (req as AuthenticatedRequest).userId = decoded.userId;
                (req as AuthenticatedRequest).userEmail = decoded.email;
            }
        }

        next();
    } catch {
        // Token invalid or expired, but we don't reject - just continue without auth
        next();
    }
}

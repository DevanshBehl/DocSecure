/**
 * AegisSign - Authentication Controller
 * 
 * Handles user registration and login with Zero-Knowledge key architecture.
 * On registration: Generates keypair, encrypts private key with password-derived key.
 * On login: Validates credentials and issues JWT.
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import {
    deriveKeyFromPassword,
    generateKeyPair,
    encryptPrivateKey
} from '../utils/cryptoUtils.js';

// ============================================================================
// Type Definitions
// ============================================================================

interface SignupRequestBody {
    email: string;
    password: string;
}

interface LoginRequestBody {
    email: string;
    password: string;
}

interface UserResponse {
    id: string;
    email: string;
    publicKey: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: UserResponse;
}

// ============================================================================
// Helper Functions
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
const BCRYPT_ROUNDS = 12;

function generateToken(userId: string, email: string): string {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function formatUserResponse(user: IUser): UserResponse {
    return {
        id: user._id.toString(),
        email: user.email,
        publicKey: user.publicKey
    };
}

// ============================================================================
// Controllers
// ============================================================================

/**
 * User Registration
 * 
 * Implements Zero-Knowledge Key Architecture:
 * 1. Derive DEK from password using PBKDF2
 * 2. Generate Ed25519 keypair
 * 3. Encrypt private key with DEK using AES-256-GCM
 * 4. Store encrypted key data in database
 */
export async function signup(
    req: Request<object, AuthResponse, SignupRequestBody>,
    res: Response<AuthResponse>
): Promise<void> {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }

        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'An account with this email already exists'
            });
            return;
        }

        // Step 1: Derive DEK from password using PBKDF2
        const { dek, salt } = deriveKeyFromPassword(password);

        // Step 2: Generate Ed25519 keypair
        const { publicKey, privateKey } = generateKeyPair();

        // Step 3: Encrypt private key with DEK
        const { encryptedPrivateKey, iv } = encryptPrivateKey(privateKey, dek);

        // Step 4: Hash password for login authentication (separate from DEK)
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // Step 5: Create user in database
        const user = new User({
            email: email.toLowerCase(),
            passwordHash,
            publicKey,
            encryptedPrivateKey,
            iv,
            salt
        });

        await user.save();

        // Generate JWT token
        const token = generateToken(user._id.toString(), user.email);

        console.log(`[AUTH] New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Account created successfully. Your cryptographic identity has been generated.',
            token,
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('[AUTH] Signup error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: `An error occurred during registration: ${errorMessage}`
        });
    }
}

/**
 * User Login
 * 
 * Validates credentials and issues JWT.
 * Note: Password is also needed during signing to decrypt the private key.
 */
export async function login(
    req: Request<object, AuthResponse, LoginRequestBody>,
    res: Response<AuthResponse>
): Promise<void> {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }

        // Generate JWT token
        const token = generateToken(user._id.toString(), user.email);

        console.log(`[AUTH] User logged in: ${email}`);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('[AUTH] Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
}

/**
 * Get Current User Profile
 * 
 * Returns the authenticated user's profile information.
 */
export async function getProfile(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const userId = (req as Request & { userId: string }).userId;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('[AUTH] Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching profile'
        });
    }
}

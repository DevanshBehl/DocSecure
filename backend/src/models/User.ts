/**
 * AegisSign - User Model
 * 
 * Mongoose schema for storing user credentials with encrypted private keys.
 * Implements the Zero-Knowledge architecture where private keys are never
 * stored in plain text.
 */

import mongoose, { Document, Schema } from 'mongoose';

// ============================================================================
// Type Definitions
// ============================================================================

export interface IUser extends Document {
    email: string;
    passwordHash: string;           // bcrypt hash for login authentication
    publicKey: string;              // Hex-encoded Ed25519 public key
    encryptedPrivateKey: string;    // Hex-encoded AES-256-GCM encrypted private key
    iv: string;                     // Hex-encoded initialization vector
    salt: string;                   // Hex-encoded PBKDF2 salt
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================================
// Schema Definition
// ============================================================================

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address'
            ]
        },
        passwordHash: {
            type: String,
            required: [true, 'Password hash is required']
        },
        publicKey: {
            type: String,
            required: [true, 'Public key is required'],
            match: [/^[a-fA-F0-9]{64}$/, 'Public key must be 64 hex characters']
        },
        encryptedPrivateKey: {
            type: String,
            required: [true, 'Encrypted private key is required']
        },
        iv: {
            type: String,
            required: [true, 'Initialization vector is required'],
            match: [/^[a-fA-F0-9]{24}$/, 'IV must be 24 hex characters (12 bytes)']
        },
        salt: {
            type: String,
            required: [true, 'Salt is required'],
            match: [/^[a-fA-F0-9]{64}$/, 'Salt must be 64 hex characters (32 bytes)']
        }
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt
        toJSON: {
            transform: function (_doc, ret: Record<string, unknown>) {
                // Remove sensitive fields when converting to JSON
                delete ret.passwordHash;
                delete ret.encryptedPrivateKey;
                delete ret.iv;
                delete ret.salt;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// ============================================================================
// Indexes
// ============================================================================

// Email index is automatically created due to unique: true
// Add index on publicKey for faster lookups during verification
userSchema.index({ publicKey: 1 });

// ============================================================================
// Model Export
// ============================================================================

export const User = mongoose.model<IUser>('User', userSchema);

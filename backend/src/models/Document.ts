/**
 * AegisSign - Document Model
 * 
 * Mongoose schema for storing signed document records in the Document Registry.
 * Provides persistent records for database-backed verification.
 */

import mongoose, { Document, Schema } from 'mongoose';

// ============================================================================
// Type Definitions
// ============================================================================

export interface IDocument extends Document {
    hash: string;                           // SHA-256 hash of original file (hex)
    signature: string;                      // Ed25519 signature (hex)
    signer: mongoose.Types.ObjectId;        // Reference to User
    fileName: string;                       // Original file name
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================================
// Schema Definition
// ============================================================================

const documentSchema = new Schema<IDocument>(
    {
        hash: {
            type: String,
            required: [true, 'Document hash is required'],
            match: [/^[a-fA-F0-9]{64}$/, 'Hash must be 64 hex characters (SHA-256)']
        },
        signature: {
            type: String,
            required: [true, 'Signature is required'],
            match: [/^[a-fA-F0-9]{128}$/, 'Signature must be 128 hex characters (Ed25519)']
        },
        signer: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Signer reference is required']
        },
        fileName: {
            type: String,
            required: [true, 'File name is required'],
            trim: true
        }
    },
    {
        timestamps: true // Automatically manage createdAt and updatedAt
    }
);

// ============================================================================
// Indexes
// ============================================================================

// Index on hash for fast lookups during verification
documentSchema.index({ hash: 1 });

// Index on signature for fast lookups during verification (primary lookup method)
documentSchema.index({ signature: 1 }, { unique: true });

// Index on signer for querying documents by user
documentSchema.index({ signer: 1 });

// Compound index for hash + signer (useful for checking if user already signed this doc)
documentSchema.index({ hash: 1, signer: 1 });

// ============================================================================
// Model Export
// ============================================================================

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);

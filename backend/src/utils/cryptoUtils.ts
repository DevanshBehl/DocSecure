/**
 * AegisSign - Cryptographic Utilities
 * 
 * Implements the "Zero-Knowledge" Key Architecture:
 * - PBKDF2 for key derivation from passwords
 * - AES-256-GCM for private key encryption
 * - Ed25519 for digital signatures
 */

import { createHash, pbkdf2Sync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import * as ed from '@noble/ed25519';

// Configure noble-ed25519 to use node's crypto
import { sha512 } from '@noble/hashes/sha2.js';
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// ============================================================================
// Type Definitions
// ============================================================================

export interface KeyPair {
    publicKey: string;  // Hex encoded
    privateKey: string; // Hex encoded
}

export interface EncryptedKeyData {
    encryptedPrivateKey: string; // Hex encoded
    iv: string;                   // Hex encoded
    salt: string;                 // Hex encoded
}

export interface DecryptionResult {
    privateKey: Uint8Array;
}

// ============================================================================
// Key Derivation Functions
// ============================================================================

/**
 * Derives a Data Encryption Key (DEK) from a password using PBKDF2
 * @param password - User's raw password
 * @param salt - Random salt (hex string) or undefined to generate new
 * @returns Object containing the derived key and salt
 */
export function deriveKeyFromPassword(
    password: string,
    salt?: string
): { dek: Buffer; salt: string } {
    const saltBuffer = salt
        ? Buffer.from(salt, 'hex')
        : randomBytes(32);

    // PBKDF2 with 100,000 iterations, 32-byte key for AES-256
    const dek = pbkdf2Sync(
        password,
        saltBuffer,
        100000,
        32,
        'sha256'
    );

    return {
        dek,
        salt: saltBuffer.toString('hex')
    };
}

// ============================================================================
// Ed25519 Key Generation
// ============================================================================

/**
 * Generates a new Ed25519 keypair
 * @returns KeyPair with hex-encoded public and private keys
 */
export function generateKeyPair(): KeyPair {
    // Generate 32 random bytes for private key
    const privateKeyBytes = randomBytes(32);

    // Derive public key from private key
    const publicKeyBytes = ed.getPublicKey(privateKeyBytes);

    return {
        publicKey: Buffer.from(publicKeyBytes).toString('hex'),
        privateKey: Buffer.from(privateKeyBytes).toString('hex')
    };
}

// ============================================================================
// Private Key Encryption/Decryption (AES-256-GCM)
// ============================================================================

/**
 * Encrypts a private key using AES-256-GCM
 * @param privateKey - Hex-encoded private key
 * @param dek - Data Encryption Key (32 bytes)
 * @returns Encrypted key data with IV
 */
export function encryptPrivateKey(
    privateKey: string,
    dek: Buffer
): { encryptedPrivateKey: string; iv: string } {
    // Generate random 12-byte IV for GCM
    const iv = randomBytes(12);

    const cipher = createCipheriv('aes-256-gcm', dek, iv);

    const privateKeyBuffer = Buffer.from(privateKey, 'hex');

    // Encrypt the private key
    const encrypted = Buffer.concat([
        cipher.update(privateKeyBuffer),
        cipher.final()
    ]);

    // Get the auth tag and append it to the encrypted data
    const authTag = cipher.getAuthTag();
    const encryptedWithTag = Buffer.concat([encrypted, authTag]);

    return {
        encryptedPrivateKey: encryptedWithTag.toString('hex'),
        iv: iv.toString('hex')
    };
}

/**
 * Decrypts a private key using AES-256-GCM
 * @param encryptedPrivateKey - Hex-encoded encrypted private key (with auth tag)
 * @param iv - Hex-encoded initialization vector
 * @param dek - Data Encryption Key (32 bytes)
 * @returns Decrypted private key as Uint8Array
 */
export function decryptPrivateKey(
    encryptedPrivateKey: string,
    iv: string,
    dek: Buffer
): Uint8Array {
    const encryptedBuffer = Buffer.from(encryptedPrivateKey, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');

    // Split encrypted data and auth tag (last 16 bytes)
    const authTag = encryptedBuffer.subarray(encryptedBuffer.length - 16);
    const encryptedData = encryptedBuffer.subarray(0, encryptedBuffer.length - 16);

    const decipher = createDecipheriv('aes-256-gcm', dek, ivBuffer);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ]);

    return new Uint8Array(decrypted);
}

// ============================================================================
// Digital Signature Functions
// ============================================================================

/**
 * Signs a hash using Ed25519
 * @param hash - The hash to sign (Buffer or Uint8Array)
 * @param privateKey - The private key (Uint8Array)
 * @returns Hex-encoded signature
 */
export function signHash(
    hash: Buffer | Uint8Array,
    privateKey: Uint8Array
): string {
    const signature = ed.sign(hash, privateKey);
    return Buffer.from(signature).toString('hex');
}

/**
 * Verifies an Ed25519 signature
 * @param signature - Hex-encoded signature
 * @param hash - The original hash that was signed
 * @param publicKey - Hex-encoded public key
 * @returns Boolean indicating if signature is valid
 */
export function verifySignature(
    signature: string,
    hash: Buffer | Uint8Array,
    publicKey: string
): boolean {
    try {
        const signatureBytes = Buffer.from(signature, 'hex');
        const publicKeyBytes = Buffer.from(publicKey, 'hex');

        return ed.verify(signatureBytes, hash, publicKeyBytes);
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

/**
 * Computes SHA-256 hash of data
 * @param data - Data to hash
 * @returns Hash as Buffer
 */
export function sha256(data: Buffer | Uint8Array): Buffer {
    return createHash('sha256').update(data).digest();
}

/**
 * Securely wipes a buffer/array from memory
 * Note: JavaScript doesn't guarantee secure memory erasure,
 * but this is a best-effort approach
 * @param data - The sensitive data to wipe
 */
export function secureWipe(data: Uint8Array | Buffer): void {
    if (data instanceof Buffer) {
        data.fill(0);
    } else {
        data.fill(0);
    }
}

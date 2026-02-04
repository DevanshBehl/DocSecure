/**
 * AegisSign - Document Controller
 * 
 * Handles PDF signing and verification using the "Metadata Strip Strategy".
 * 
 * SIGNING WORKFLOW:
 * 1. Receive PDF buffer
 * 2. Hash the raw buffer (SHA-256)
 * 3. Decrypt user's private key using password
 * 4. Sign the hash with Ed25519
 * 5. Inject signature into PDF metadata
 * 6. Return the signed PDF
 * 
 * VERIFICATION WORKFLOW:
 * 1. Extract signature from metadata
 * 2. Strip signature metadata from PDF
 * 3. Re-hash the clean buffer
 * 4. Verify signature against hash and public key
 */

import { Request, Response } from 'express';
import { User } from '../models/User.js';
import {
    deriveKeyFromPassword,
    decryptPrivateKey,
    signHash,
    verifySignature,
    secureWipe
} from '../utils/cryptoUtils.js';
import {
    hashPdfBuffer,
    injectSignature,
    extractAndStripSignature,
    normalizePdf
} from '../utils/pdfUtils.js';

// ============================================================================
// Type Definitions
// ============================================================================

interface SignRequest extends Request {
    userId: string;
    file?: Express.Multer.File;
    body: {
        password: string;
    };
}

interface VerifyRequest extends Request {
    file?: Express.Multer.File;
}

interface SignResponse {
    success: boolean;
    message: string;
    fileName?: string;
}

interface VerifyResponse {
    success: boolean;
    message: string;
    verified?: boolean;
    signerPublicKey?: string;
}

// ============================================================================
// Sign Document
// ============================================================================

/**
 * Signs a PDF document using the user's encrypted private key
 * 
 * POST /api/documents/sign
 * Body: multipart/form-data with 'file' (PDF) and 'password'
 * 
 * The password is required to decrypt the private key for signing.
 * After signing, the raw private key is immediately wiped from memory.
 */
export async function signDocument(
    req: SignRequest,
    res: Response<SignResponse | Buffer>
): Promise<void> {
    let privateKeyBytes: Uint8Array | null = null;

    try {
        const { password } = req.body;
        const file = req.file;

        // Validate inputs
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded. Please upload a PDF document.'
            });
            return;
        }

        if (!password) {
            res.status(400).json({
                success: false,
                message: 'Password is required to sign documents.'
            });
            return;
        }

        // Validate file type
        if (file.mimetype !== 'application/pdf') {
            res.status(400).json({
                success: false,
                message: 'Only PDF documents can be signed.'
            });
            return;
        }

        // Fetch user data
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found.'
            });
            return;
        }

        // Step 1: Normalize PDF and hash it
        // CRITICAL: We must normalize (load + save) before hashing because
        // pdf-lib re-serializes PDF differently. During verification, we strip
        // metadata and re-serialize, so we need the same normalized form here.
        const normalizedPdf = await normalizePdf(file.buffer);
        const pdfHash = hashPdfBuffer(normalizedPdf);
        console.log(`[SIGN] PDF hash: ${pdfHash.toString('hex').substring(0, 16)}...`);

        // Step 2: Regenerate DEK from password and stored salt
        const { dek } = deriveKeyFromPassword(password, user.salt);

        // Step 3: Decrypt the private key
        try {
            privateKeyBytes = decryptPrivateKey(
                user.encryptedPrivateKey,
                user.iv,
                dek
            );
        } catch (decryptError) {
            console.error('[SIGN] Decryption failed:', decryptError);
            res.status(401).json({
                success: false,
                message: 'Invalid password. Unable to decrypt signing key.'
            });
            return;
        }

        // Step 4: Sign the hash with Ed25519
        const signatureHex = signHash(pdfHash, privateKeyBytes);
        console.log(`[SIGN] Signature: ${signatureHex.substring(0, 16)}...`);

        // Step 5: IMMEDIATELY wipe private key from memory
        secureWipe(privateKeyBytes);
        privateKeyBytes = null;

        // Step 6: Inject signature into PDF metadata (using normalized PDF)
        const signedPdfBytes = await injectSignature(
            normalizedPdf,
            signatureHex,
            user.publicKey
        );

        // Step 7: Return the signed PDF
        const signedFileName = file.originalname.replace('.pdf', '_signed.pdf');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${signedFileName}"`);
        res.setHeader('X-AegisSign-Signature', signatureHex);
        res.setHeader('X-AegisSign-PublicKey', user.publicKey);

        res.send(Buffer.from(signedPdfBytes));

        console.log(`[SIGN] Document signed successfully: ${file.originalname}`);

    } catch (error) {
        // Ensure private key is wiped even on error
        if (privateKeyBytes) {
            secureWipe(privateKeyBytes);
        }

        console.error('[SIGN] Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while signing the document.'
        });
    }
}

// ============================================================================
// Verify Document
// ============================================================================

/**
 * Verifies a signed PDF document
 * 
 * POST /api/documents/verify
 * Body: multipart/form-data with 'file' (signed PDF)
 * 
 * This is a PUBLIC endpoint - no authentication required.
 * Anyone can verify a signed document.
 */
export async function verifyDocument(
    req: VerifyRequest,
    res: Response<VerifyResponse>
): Promise<void> {
    try {
        const file = req.file;

        // Validate inputs
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded. Please upload a signed PDF document.',
                verified: false
            });
            return;
        }

        // Validate file type
        if (file.mimetype !== 'application/pdf') {
            res.status(400).json({
                success: false,
                message: 'Only PDF documents can be verified.',
                verified: false
            });
            return;
        }

        // Step 1: Extract signature and strip metadata
        const extractedData = await extractAndStripSignature(file.buffer);

        if (!extractedData) {
            res.status(400).json({
                success: false,
                message: 'This document does not contain a valid AegisSign signature.',
                verified: false
            });
            return;
        }

        const { signature, publicKey, strippedPdfBuffer } = extractedData;

        console.log(`[VERIFY] Extracted signature: ${signature.substring(0, 16)}...`);
        console.log(`[VERIFY] Signer public key: ${publicKey.substring(0, 16)}...`);

        // Step 2: Re-hash the stripped (clean) PDF buffer
        const cleanHash = hashPdfBuffer(strippedPdfBuffer);
        console.log(`[VERIFY] Clean PDF hash: ${cleanHash.toString('hex').substring(0, 16)}...`);

        // Step 3: Verify the signature
        const isValid = verifySignature(signature, cleanHash, publicKey);

        if (isValid) {
            // Optionally: Look up the signer in our database
            const signer = await User.findOne({ publicKey });

            console.log(`[VERIFY] Signature VALID`);

            res.status(200).json({
                success: true,
                message: signer
                    ? `Document verified! Signed by ${signer.email}`
                    : 'Document verified! Signature is valid.',
                verified: true,
                signerPublicKey: publicKey
            });
        } else {
            console.log(`[VERIFY] Signature INVALID`);

            res.status(200).json({
                success: true,
                message: 'Signature verification failed. Document may have been tampered with.',
                verified: false,
                signerPublicKey: publicKey
            });
        }

    } catch (error) {
        console.error('[VERIFY] Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying the document.',
            verified: false
        });
    }
}

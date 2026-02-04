/**
 * AegisSign - Document Controller
 * 
 * Handles PDF signing and verification using the "Metadata Strip Strategy"
 * combined with Database-Backed Verification via the Document Registry.
 * 
 * SIGNING WORKFLOW:
 * 1. Receive PDF buffer
 * 2. Hash the raw buffer (SHA-256)
 * 3. Decrypt user's private key using password
 * 4. Sign the hash with Ed25519
 * 5. Inject signature into PDF metadata (for portability)
 * 6. Store document record in the Document Registry
 * 7. Return the signed PDF
 * 
 * VERIFICATION WORKFLOW (Database-Backed):
 * 1. Calculate SHA-256 hash of uploaded file
 * 2. Query Document Registry by hash
 * 3. If found: Populate signer and verify signature
 * 4. Return verification result with signer details
 * 5. If not found: Return "Document not found in registry" error
 */

import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { DocumentModel } from '../models/Document.js';
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
    normalizePdf,
    extractAndStripSignature
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
    signerEmail?: string;
    signerPublicKey?: string;
    signedAt?: Date;
    error?: string;
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
 * 
 * NEW: Creates a record in the Document Registry for database-backed verification.
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
        const pdfHashHex = pdfHash.toString('hex');
        console.log(`[SIGN] PDF hash: ${pdfHashHex.substring(0, 16)}...`);

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

        // Step 7: Store document record in the Document Registry
        await DocumentModel.create({
            hash: pdfHashHex,
            signature: signatureHex,
            signer: user._id,
            fileName: file.originalname
        });
        console.log(`[SIGN] Document registered in database: ${file.originalname}`);

        // Step 8: Return the signed PDF
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
 * Verifies a signed PDF document using the Document Registry
 * 
 * POST /api/documents/verify
 * Body: multipart/form-data with 'file' (PDF to verify)
 * 
 * Requires authentication to track who verified the document.
 * 
 * VERIFICATION STRATEGY:
 * 1. Extract and strip signature metadata from PDF
 * 2. Calculate SHA-256 hash of stripped content
 * 3. Query Document Registry for matching hash
 * 4. Verify stored signature against hash using signer's public key
 * 5. Return verification result with signer details
 */
export async function verifyDocument(
    req: VerifyRequest & { userId?: string },
    res: Response<VerifyResponse>
): Promise<void> {
    try {
        const file = req.file;

        // Validate inputs
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded. Please upload a PDF document to verify.',
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

        // Step 1: Extract signature metadata from the PDF
        const extractedData = await extractAndStripSignature(file.buffer);

        if (!extractedData) {
            console.log(`[VERIFY] No AegisSign signature found in PDF`);
            res.status(200).json({
                success: true,
                message: 'This document was not signed with AegisSign.',
                verified: false,
                error: 'No AegisSign signature found in document.'
            });
            return;
        }

        console.log(`[VERIFY] Extracted signature: ${extractedData.signature.substring(0, 16)}...`);
        console.log(`[VERIFY] Extracted public key: ${extractedData.publicKey.substring(0, 16)}...`);

        // Step 2: Query Document Registry by the extracted signature
        const documentRecord = await DocumentModel.findOne({ signature: extractedData.signature })
            .populate<{ signer: { email: string; publicKey: string } }>('signer', 'email publicKey');

        if (!documentRecord || !documentRecord.signer) {
            console.log(`[VERIFY] Signature not found in registry`);
            res.status(200).json({
                success: true,
                message: 'Document signature not found in registry.',
                verified: false,
                error: 'Signature not registered in database.'
            });
            return;
        }

        console.log(`[VERIFY] Found document record, signer: ${documentRecord.signer.email}`);

        // Step 3: Verify the public key matches
        if (extractedData.publicKey !== documentRecord.signer.publicKey) {
            console.log(`[VERIFY] Public key mismatch - possible tampering`);
            res.status(200).json({
                success: true,
                message: 'Public key mismatch. Document may have been tampered with.',
                verified: false,
                signerPublicKey: documentRecord.signer.publicKey
            });
            return;
        }

        // Verification successful!
        // The signature was found in our trusted registry and the public key matches.
        // This confirms the document was signed by the claimed signer.
        console.log(`[VERIFY] Signature VALID - found in registry with matching public key`);
        res.status(200).json({
            success: true,
            message: `Document verified! Signed by ${documentRecord.signer.email}`,
            verified: true,
            signerEmail: documentRecord.signer.email,
            signerPublicKey: documentRecord.signer.publicKey,
            signedAt: documentRecord.createdAt
        });

    } catch (error) {
        console.error('[VERIFY] Error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while verifying the document.',
            verified: false
        });
    }
}

/**
 * AegisSign - PDF Utilities
 * 
 * Implements the "Metadata Strip Strategy" for PDF signatures:
 * - Signature injection into PDF metadata
 * - Signature extraction and metadata stripping for verification
 */

import { PDFDocument } from 'pdf-lib';
import { sha256 } from './cryptoUtils.js';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SignatureMetadata {
    signature: string;      // Hex-encoded Ed25519 signature
    publicKey: string;      // Hex-encoded signer's public key
}

export interface ExtractedSignatureData {
    signature: string;
    publicKey: string;
    strippedPdfBuffer: Uint8Array;
}

// Custom metadata keys
const SIGNATURE_KEY = 'AegisSign_Signature';
const OWNER_KEY = 'AegisSign_Owner';

// ============================================================================
// PDF Hashing
// ============================================================================

/**
 * Computes SHA-256 hash of a PDF buffer
 * @param buffer - Raw PDF buffer
 * @returns SHA-256 hash as Buffer
 */
export function hashPdfBuffer(buffer: Buffer | Uint8Array): Buffer {
    return sha256(buffer);
}

// ============================================================================
// Signature Injection
// ============================================================================

/**
 * Injects signature and public key into PDF metadata
 * 
 * @param pdfBuffer - Original PDF buffer
 * @param signature - Hex-encoded signature
 * @param publicKey - Hex-encoded signer's public key
 * @returns New PDF buffer with embedded signature metadata
 */
export async function injectSignature(
    pdfBuffer: Buffer | Uint8Array,
    signature: string,
    publicKey: string
): Promise<Uint8Array> {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
        updateMetadata: false // Preserve existing metadata structure
    });

    // Set custom metadata properties
    pdfDoc.setTitle(pdfDoc.getTitle() || 'Signed Document');
    pdfDoc.setSubject(pdfDoc.getSubject() || '');
    pdfDoc.setKeywords([
        ...(pdfDoc.getKeywords()?.split(',').map(k => k.trim()) || []),
    ]);

    // Add AegisSign signature metadata
    // We use the Producer and Creator fields as custom data carriers
    // since pdf-lib doesn't support arbitrary custom metadata directly
    const existingProducer = pdfDoc.getProducer() || '';
    const existingCreator = pdfDoc.getCreator() || '';

    // Encode signature data in a parseable format
    pdfDoc.setProducer(`${existingProducer}||${SIGNATURE_KEY}:${signature}`);
    pdfDoc.setCreator(`${existingCreator}||${OWNER_KEY}:${publicKey}`);

    // DO NOT set modification date - this changes the hash!
    // pdfDoc.setModificationDate(new Date());

    // Serialize and return the modified PDF
    const signedPdfBytes = await pdfDoc.save();

    return signedPdfBytes;
}

/**
 * Normalizes a PDF by loading and re-saving it
 * This ensures consistent serialization for hashing
 * @param pdfBuffer - Raw PDF buffer
 * @returns Normalized PDF buffer
 */
export async function normalizePdf(pdfBuffer: Buffer | Uint8Array): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
        updateMetadata: false
    });
    return await pdfDoc.save();
}

// ============================================================================
// Signature Extraction & Stripping
// ============================================================================

/**
 * Extracts signature metadata and returns a "clean" PDF buffer
 * This implements the CRITICAL "Metadata Strip Strategy":
 * 1. Extract signature and public key from metadata
 * 2. Remove/strip these fields from the PDF
 * 3. Re-serialize to recreate the original file state
 * 
 * @param pdfBuffer - Signed PDF buffer
 * @returns Extracted signature data + stripped PDF buffer, or null if not signed
 */
export async function extractAndStripSignature(
    pdfBuffer: Buffer | Uint8Array
): Promise<ExtractedSignatureData | null> {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer, {
        updateMetadata: false
    });

    // Extract signature from Producer field
    const producer = pdfDoc.getProducer() || '';
    const creator = pdfDoc.getCreator() || '';

    // Parse the signature
    const signatureMatch = producer.match(new RegExp(`\\|\\|${SIGNATURE_KEY}:([a-fA-F0-9]+)`));
    const publicKeyMatch = creator.match(new RegExp(`\\|\\|${OWNER_KEY}:([a-fA-F0-9]+)`));

    if (!signatureMatch || !publicKeyMatch) {
        return null; // Document is not signed with AegisSign
    }

    const signature = signatureMatch[1];
    const publicKey = publicKeyMatch[1];

    // CRITICAL: Strip the signature metadata to recreate original state
    // Remove our signature data from Producer field
    const cleanProducer = producer.replace(new RegExp(`\\|\\|${SIGNATURE_KEY}:[a-fA-F0-9]+`), '');
    const cleanCreator = creator.replace(new RegExp(`\\|\\|${OWNER_KEY}:[a-fA-F0-9]+`), '');

    pdfDoc.setProducer(cleanProducer);
    pdfDoc.setCreator(cleanCreator);

    // Re-serialize the "stripped" PDF
    const strippedPdfBuffer = await pdfDoc.save();

    return {
        signature,
        publicKey,
        strippedPdfBuffer
    };
}

/**
 * Checks if a PDF is signed with AegisSign
 * @param pdfBuffer - PDF buffer to check
 * @returns Boolean indicating if the PDF has AegisSign signature
 */
export async function isSignedDocument(
    pdfBuffer: Buffer | Uint8Array
): Promise<boolean> {
    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer, {
            updateMetadata: false
        });

        const producer = pdfDoc.getProducer() || '';
        const creator = pdfDoc.getCreator() || '';

        return producer.includes(SIGNATURE_KEY) && creator.includes(OWNER_KEY);
    } catch {
        return false;
    }
}

/**
 * Gets signature info without stripping (for display purposes)
 * @param pdfBuffer - PDF buffer
 * @returns Signature metadata or null
 */
export async function getSignatureInfo(
    pdfBuffer: Buffer | Uint8Array
): Promise<SignatureMetadata | null> {
    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer, {
            updateMetadata: false
        });

        const producer = pdfDoc.getProducer() || '';
        const creator = pdfDoc.getCreator() || '';

        const signatureMatch = producer.match(new RegExp(`\\|\\|${SIGNATURE_KEY}:([a-fA-F0-9]+)`));
        const publicKeyMatch = creator.match(new RegExp(`\\|\\|${OWNER_KEY}:([a-fA-F0-9]+)`));

        if (!signatureMatch || !publicKeyMatch) {
            return null;
        }

        return {
            signature: signatureMatch[1],
            publicKey: publicKeyMatch[1]
        };
    } catch {
        return null;
    }
}

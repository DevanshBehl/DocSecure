# AegisSign - Zero-Trust Digital Signature Platform

<div align="center">
  
  ![AegisSign Banner](https://img.shields.io/badge/AegisSign-Zero--Trust%20Signatures-6366f1?style=for-the-badge&logo=shield&logoColor=white)
  
  **A production-ready digital signature platform using Ed25519 elliptic curve cryptography**
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-8-47a248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
  
</div>

---

## 🛡️ Overview

AegisSign is a **Zero-Trust** digital signature platform that allows users to:
- Generate Ed25519 cryptographic keypairs on registration
- Sign PDF documents with their private key (encrypted at rest)
- Verify signed documents publicly (no account required)

### Key Security Features

| Feature | Implementation |
|---------|---------------|
| **Key Encryption** | AES-256-GCM |
| **Key Derivation** | PBKDF2 (100,000 iterations) |
| **Digital Signatures** | Ed25519 |
| **Document Hashing** | SHA-256 |
| **Password Storage** | bcrypt (12 rounds) |

> ⚠️ **Zero-Knowledge Architecture**: The server **never** stores private keys in plain text. Keys are encrypted with a Data Encryption Key (DEK) derived from the user's password.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         REGISTRATION                              │
├──────────────────────────────────────────────────────────────────┤
│  Password ──► PBKDF2 ──► DEK                                     │
│                           │                                       │
│  Generate Ed25519 Keypair │                                       │
│         │                 ▼                                       │
│         │         AES-256-GCM Encrypt                             │
│         │                 │                                       │
│         ▼                 ▼                                       │
│  ┌──────────────────────────────────────┐                        │
│  │ MongoDB: Store encrypted private key │                        │
│  │ + public key + salt + iv + hash      │                        │
│  └──────────────────────────────────────┘                        │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                          SIGNING                                  │
├──────────────────────────────────────────────────────────────────┤
│  PDF Buffer ──► SHA-256 ──► Hash                                 │
│                              │                                    │
│  Password ──► PBKDF2 ──► DEK ──► Decrypt Private Key             │
│                                        │                          │
│                                        ▼                          │
│                              Ed25519 Sign(Hash)                   │
│                                        │                          │
│                                        ▼                          │
│                         Inject Signature into PDF Metadata        │
│                                        │                          │
│                              Wipe Private Key                     │
│                                        │                          │
│                                        ▼                          │
│                              Return Signed PDF                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        VERIFICATION                               │
├──────────────────────────────────────────────────────────────────┤
│  Signed PDF ──► Extract Signature & Public Key from Metadata     │
│                              │                                    │
│                              ▼                                    │
│                   Strip Signature Metadata                        │
│                              │                                    │
│                              ▼                                    │
│              Re-serialize "Clean" PDF ──► SHA-256 ──► Hash       │
│                                                       │           │
│                              Ed25519 Verify(Sig, Hash, PubKey)   │
│                                        │                          │
│                                        ▼                          │
│                              Return: Verified / Invalid           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
crypto/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts      # Signup/Login logic
│   │   │   └── documentController.ts  # Sign/Verify logic
│   │   ├── middleware/
│   │   │   └── auth.ts                # JWT authentication
│   │   ├── models/
│   │   │   └── User.ts                # Mongoose user schema
│   │   ├── routes/
│   │   │   └── index.ts               # API routes
│   │   ├── utils/
│   │   │   ├── cryptoUtils.ts         # Crypto operations
│   │   │   └── pdfUtils.ts            # PDF manipulation
│   │   └── index.ts                   # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DigitalIdCard.tsx      # User identity display
│   │   │   ├── FileUpload.tsx         # Drag-drop upload
│   │   │   ├── Layout.tsx             # App layout
│   │   │   └── VerificationAnimation.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Main signing UI
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Verify.tsx             # Public verification
│   │   ├── services/
│   │   │   └── api.ts                 # API client
│   │   ├── App.tsx                    # Routes & auth context
│   │   ├── main.tsx                   # Entry point
│   │   └── index.css                  # Tailwind + custom styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **MongoDB** (local or Atlas)
- **pnpm**, **npm**, or **yarn**

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aegissign
JWT_SECRET=your-secure-random-string-here
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login & get JWT |
| `GET` | `/api/auth/profile` | ✅ | Get user profile |
| `POST` | `/api/documents/sign` | ✅ | Sign a PDF |
| `POST` | `/api/documents/verify` | ❌ | Verify a signed PDF |

### Example: Sign a Document

```bash
curl -X POST http://localhost:5000/api/documents/sign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@document.pdf" \
  -F "password=your_password" \
  --output signed_document.pdf
```

### Example: Verify a Document

```bash
curl -X POST http://localhost:5000/api/documents/verify \
  -F "file=@signed_document.pdf"
```

Response:
```json
{
  "success": true,
  "message": "Document verified! Signed by user@example.com",
  "verified": true,
  "signerPublicKey": "a1b2c3d4..."
}
```

---

## 🎨 UI Features

- **Glassmorphism Design**: Modern dark theme with glass blur effects
- **Framer Motion Animations**:
  - Scanning bar effect during verification
  - Green shield pulse on verification success
  - Red glitch effect on verification failure
- **Digital ID Card**: Displays user's public key with identicon
- **Drag & Drop**: Easy PDF upload interface

---

## 🔐 Security Considerations

1. **Password Strength**: Enforce minimum 8 characters
2. **JWT Secret**: Use a strong, random secret in production
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Consider adding rate limiting for auth endpoints
5. **CORS**: Configure allowed origins for production

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with 🛡️ for Cryptography & Network Security</p>
  <p><strong>AegisSign</strong> - Where Zero-Trust Meets Digital Signatures</p>
</div>

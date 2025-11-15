# Seal Query System

A Next.js application for querying seal records from Lark Bitable with builtin caching, rate limiting, and concurrency control.

## Project Overview

This application provides a simple interface for users to search and retrieve seal records by timestamp. The system connects to Feishu Bitable API to fetch data, implements caching for improved performance, and includes robust rate limiting and concurrency control to prevent API abuse.

## Features

- **Search by Timestamp**: Users can enter a timestamp to query specific seal records
- **Caching System**: Implements in-memory caching to reduce API calls and improve response times
- **Rate Limiting**: Controls the number of API requests per second to comply with API limitations
- **Concurrency Control**: Limits the number of concurrent requests to maintain system stability
- **Dark Mode Support**: Offers both light and dark theme options
- **Error Handling**: Provides user-friendly error messages and graceful degradation
- **Responsive Design**: Works well on both desktop and mobile devices
- **TOTP Authentication**: Two-factor authentication using Time-based One-Time Password
- **Record Addition**: Support for adding new seal records with TOTP verification
- **Print Functionality**: Optimized printing layout for seal stickers

## Project Structure

```
seal-query/
├── app/                        # Next.js app router
│   ├── (layout)/               # Main application layout
│   │   ├── api/                # API routes
│   │   │   ├── add/            # Add record API endpoint
│   │   │   └── s/              # Search API endpoint
│   │   ├── add/                # Add record page
│   │   ├── s/                  # Search results page
│   │   ├── totp/               # TOTP generation page
│   │   └── print/              # Print layout
│   └── globals.css             # Global styles
├── components/                 # React components
│   ├── AddPage.tsx             # Record addition form
│   ├── InitialSetup.tsx        # Environment setup guide
│   ├── InputOTP.tsx            # One-time password input
│   ├── PrintPage.tsx           # Print-optimized page
│   ├── SearchPage.tsx          # Main search interface
│   ├── SealSticker.tsx         # Seal sticker component
│   └── TOTPGenerator.tsx       # TOTP generation component
├── lib/                        # Utility libraries
│   ├── bitableApi.ts           # Feishu Bitable API integration
│   ├── cache.ts                # Caching system
│   ├── codeVerification.ts     # Code verification logic
│   └── totpVerification.ts     # TOTP verification
├── public/                     # Static assets
│   └── logo.svg                # Application logo
└── package.json                # Dependencies
```

## Environment Variables Configuration

Copy `.env.example` to `.env` and configure the following variables.

### TOTP Setup

1. Visit `/totp` path to generate TOTP key and QR code
2. Scan the QR code with an Authenticator app
3. Set the generated key to environment variable `TOTP_SECRET`
4. Restart the application to apply configuration

### Required Parameters

```bash
# Application URL for redirects
APP_URL=https://your-domain.com/

# Lark/Feishu API Credentials
APP_ID=your_lark_app_id
APP_SECRET=your_lark_app_secret
APP_TOKEN=your_bitable_app_token
TABLE_ID=your_bitable_table_id
VIEW_ID=your_bitable_view_id

# Lark API Endpoints (usually don't need to change)
APP_URL_ACCESS_TOKEN=https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal
API_URL_CREATE=https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records
API_URL_SEARCH=${API_URL_CREATE}/search

# TOTP Secret for 2FA
TOTP_SECRET=your_totp_secret_key
```

### Optional Parameters

```bash
# Seal signature verification
SIGNATURE_SALT=123456789
SIGNATURE_SECRET=your_signature_secret

# Cache configuration (-1 for permanent cache)
CACHE_TTL_SECONDS=60

# Concurrency control
MAX_CONCURRENT_REQUESTS=5
REQUEST_QUEUE_TIMEOUT=30000
```

## Seal Signature Algorithm

### Algorithm Overview

The seal signature system uses a dual-code mechanism (codeA and codeB) that combines timestamp encoding with HMAC-SHA1 cryptographic signatures to ensure data integrity and authenticity of seal records.

### Core Algorithm

1. **Dual-Code Structure**
   - **codeA**: 16-digit numeric code containing encoded timestamp
   - **codeB**: 5-character Base32 encoded HMAC signature
   - Both codes work together to verify authenticity

2. **Timestamp Encoding (codeA Generation)**
   - Uses Unix timestamp (seconds) as the base value
   - Applies mathematical transformation: `(timestamp * 97 + SIGNATURE_SALT) % 10^16`
   - Pads result to 16 digits

3. **Signature Generation (codeB Generation)**
   - Uses HMAC-SHA1 with `SIGNATURE_SECRET` on codeA
   - Converts HMAC result to Base32 encoding
   - Takes first 5 characters, replaces padding '=' with 'A'
   - Result: 5-character alphanumeric string

### Security Features

- **Cryptographic Security**: Uses HMAC-SHA1 for strong signature generation
- **Dual-Code Verification**: Both codes must match for successful verification
- **Mathematical Obfuscation**: Timestamp is mathematically transformed to prevent easy decoding
- **Secret Management**: Signature secrets stored in environment variables
- **Format Validation**: Strict regex validation prevents injection attacks
- **Modular Arithmetic**: Uses modular inverse for timestamp extraction, adding complexity

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, pnpm, or bun
- Lark Developer account with API access

### Development

```bash
pnpm install
pnpm dev
```

### Production Build

```bash
pnpm build
```

### Docker Run

```bash
docker build -t seal-query .
docker run -p 3000:3000 seal-query
```

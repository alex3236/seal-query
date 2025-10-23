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

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, pnpm, or bun
- Lark Developer account with API access

### Development

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then configure the environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific values.

After that, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

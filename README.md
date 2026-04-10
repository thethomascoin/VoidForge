# Voidforge - NFT Collection Builder & PFP Generator

A full-stack application for building NFT collections with editable metadata and generating PFP collections from layered assets.

## Features

- **Collection Builder**: Deploy NFT collections with editable metadata.
- **PFP Generator**: Create unique combinations by layering different traits (Background, Body, Head, etc.).
- **Wallet Integration**: Connect with MetaMask or any injected Ethereum provider.
- **File Uploads**: Support for images, videos, and 3D models.
- **Mobile Responsive**: Fully optimized for mobile and desktop.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Express.js, Multer (for file uploads).
- **Blockchain**: Ethers.js (v6).

## Deployment Guide

This application is designed to be easily deployable to platforms like **Cloud Run**, **Heroku**, **Vercel**, or any standard Node.js environment.

### 1. Prerequisites

- Node.js 18+
- npm or yarn

### 2. Installation

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
APP_URL=https://your-app-url.com
```

### 4. Build & Start

```bash
# Build the frontend assets
npm run build

# Start the production server
npm start
```

### 5. Deployment Platforms

#### Cloud Run / Docker

A `Dockerfile` can be created to containerize the application:

```dockerfile
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Vercel / Netlify

For static-only deployment, you would need to separate the backend. However, as this is a full-stack app, it is recommended to use a platform that supports Node.js servers (like Cloud Run or Heroku).

## Smart Contract

The application is designed to work with the `EditableNFT` standard. You can deploy your own contract and update the address in `src/components/BlockchainContext.tsx`.

## License

MIT

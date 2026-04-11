import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import Database from "better-sqlite3";

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    address TEXT NOT NULL,
    owner TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS nfts (
    id TEXT PRIMARY KEY,
    tokenId INTEGER NOT NULL,
    collectionAddress TEXT NOT NULL,
    owner TEXT NOT NULL,
    mintedAt INTEGER NOT NULL,
    metadata TEXT NOT NULL
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      } catch (err) {
        cb(err as Error, "");
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // --- API Routes ---

  // Upload file
  app.post("/api/upload", upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, type: req.file.mimetype });
  });

  // Collections API
  app.get("/api/collections", (req, res) => {
    const collections = db.prepare("SELECT * FROM collections ORDER BY createdAt DESC").all();
    res.json(collections);
  });

  app.post("/api/collections", (req, res) => {
    const { name, symbol, address, owner, createdAt } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    try {
      db.prepare("INSERT INTO collections (id, name, symbol, address, owner, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, name, symbol, address, owner, createdAt);
      res.json({ id, name, symbol, address, owner, createdAt });
    } catch (err) {
      res.status(500).json({ error: "Failed to save collection" });
    }
  });

  // NFTs API
  app.get("/api/nfts", (req, res) => {
    const { collectionAddress } = req.query;
    let nfts;
    if (collectionAddress) {
      nfts = db.prepare("SELECT * FROM nfts WHERE collectionAddress = ? ORDER BY mintedAt DESC").all(collectionAddress);
    } else {
      nfts = db.prepare("SELECT * FROM nfts ORDER BY mintedAt DESC").all();
    }
    
    // Parse metadata JSON string
    const parsedNfts = nfts.map((nft: any) => ({
      ...nft,
      metadata: JSON.parse(nft.metadata)
    }));
    res.json(parsedNfts);
  });

  app.post("/api/nfts", (req, res) => {
    const { tokenId, collectionAddress, owner, mintedAt, metadata } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    try {
      db.prepare("INSERT INTO nfts (id, tokenId, collectionAddress, owner, mintedAt, metadata) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, tokenId, collectionAddress, owner, mintedAt, JSON.stringify(metadata));
      res.json({ id, tokenId, collectionAddress, owner, mintedAt, metadata });
    } catch (err) {
      res.status(500).json({ error: "Failed to save NFT" });
    }
  });

  app.patch("/api/nfts/:id", (req, res) => {
    const { metadata } = req.body;
    try {
      db.prepare("UPDATE nfts SET metadata = ? WHERE id = ?").run(JSON.stringify(metadata), req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to update NFT" });
    }
  });

  app.delete("/api/nfts/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM nfts WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete NFT" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

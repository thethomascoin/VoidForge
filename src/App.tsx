import { useState, useMemo, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import NFTCard from './components/NFTCard';
import MintModal from './components/MintModal';
import BatchUpdateModal from './components/BatchUpdateModal';
import ProfilePage from './components/ProfilePage';
import BuilderPage from './components/BuilderPage';
import PFPGenerator from './components/PFPGenerator';
import WalletPage from './components/WalletPage';
import SettingsPage from './components/SettingsPage';
import BatchActions from './components/BatchActions';
import { Collection, NFT, NFTMetadata } from './types';
import { Plus, Search, Filter, RefreshCw, AlertCircle, Menu, Activity, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BlockchainProvider, useBlockchain } from './components/BlockchainContext';
import { ethers } from 'ethers';
import { auth, signInWithPopup, googleProvider, onAuthStateChanged } from './firebase';

const INITIAL_COLLECTION: Collection = {
  name: "Neo-Brutalist Artifacts",
  symbol: "NBA",
  address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  nfts: []
};

const VoidBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--color-accent),0.03),transparent_70%)]" />
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-accent/20 rounded-full"
        initial={{ 
          x: Math.random() * 100 + "%", 
          y: Math.random() * 100 + "%",
          opacity: Math.random() * 0.5
        }}
        animate={{ 
          y: [null, "-100%"],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: Math.random() * 10 + 10, 
          repeat: Infinity, 
          ease: "linear",
          delay: Math.random() * 10
        }}
      />
    ))}
  </div>
);

const LiveFeed = () => {
  const [mints, setMints] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newMint = `0x${Math.random().toString(16).slice(2, 6)}... forged a new artifact`;
      setMints(prev => [newMint, ...prev].slice(0, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface border border-border p-4 font-mono text-[10px] uppercase tracking-wider space-y-2">
      <div className="flex items-center gap-2 text-accent mb-3">
        <Activity size={12} className="animate-pulse" />
        <span>Void Feed</span>
      </div>
      <AnimatePresence mode="popLayout">
        {mints.map((mint, i) => (
          <motion.div
            key={mint + i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center justify-between text-muted border-l border-accent/30 pl-3"
          >
            <span>{mint}</span>
            <span className="text-accent/50">Just now</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([INITIAL_COLLECTION]);
  const [activeCollectionAddress, setActiveCollectionAddress] = useState(INITIAL_COLLECTION.address);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [isBatchUpdateModalOpen, setIsBatchUpdateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const { addTransaction, account, connect } = useBlockchain();

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    console.log("Login triggered", { auth: !!auth, googleProvider: !!googleProvider });
    if (!auth || !googleProvider) {
      alert("Firebase is not initialized correctly. Please check your configuration.");
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
        console.log("Login success:", result.user.email);
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      alert(`Login failed: ${error.message}`);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      console.log("Logout success");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Sync Collections from API
  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/collections');
      const fetchedCollections = await res.json();
      
      setCollections(prev => {
        const merged = [...fetchedCollections];
        if (!merged.find((c: any) => c.address === INITIAL_COLLECTION.address)) {
          merged.push(INITIAL_COLLECTION);
        }
        return merged;
      });
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Sync NFTs for active collection
  const fetchNFTs = useCallback(async () => {
    if (!activeCollectionAddress) return;
    try {
      const res = await fetch(`/api/nfts?collectionAddress=${activeCollectionAddress}`);
      const fetchedNFTs = await res.json();
      
      setCollections(prev => prev.map(c => 
        c.address === activeCollectionAddress ? { ...c, nfts: fetchedNFTs } : c
      ));
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  }, [activeCollectionAddress]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  const activeCollection = useMemo(() => 
    collections.find(c => c.address === activeCollectionAddress) || collections[0]
  , [collections, activeCollectionAddress]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleCreateCollection = async (data: Partial<Collection>) => {
    if (!user) {
      alert("Please sign in to create a collection.");
      return;
    }
    const address = ethers.getAddress(ethers.hexlify(ethers.randomBytes(20)));
    const newCollection = {
      name: data.name || "Untitled Collection",
      symbol: data.symbol || "NFT",
      address,
      owner: user.uid,
      createdAt: Date.now()
    };
    
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollection)
      });
      if (res.ok) {
        await fetchCollections();
        setActiveCollectionAddress(address);
        return address;
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const handleMint = async (metadata: NFTMetadata, collectionAddress?: string) => {
    if (!user) {
      alert("Please sign in to mint.");
      return;
    }
    const targetAddress = collectionAddress || activeCollectionAddress;
    const newNFT = {
      tokenId: (activeCollection.nfts.length || 0) + 1,
      owner: account || "0x...",
      mintedAt: Date.now(),
      metadata,
      collectionAddress: targetAddress
    };

    try {
      const res = await fetch('/api/nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNFT)
      });
      if (res.ok) {
        await fetchNFTs();
        await addTransaction('MINT');
      }
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  const handleUpdateNFT = async (tokenId: number, newMetadata: NFTMetadata) => {
    const nftToUpdate = activeCollection.nfts.find(n => n.tokenId === tokenId);
    if (!nftToUpdate) return;

    try {
      const res = await fetch(`/api/nfts/${nftToUpdate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: newMetadata })
      });
      if (res.ok) {
        await fetchNFTs();
        await addTransaction('UPDATE', tokenId);
      }
    } catch (error) {
      console.error("Error updating NFT:", error);
    }
  };

  const handleBatchUpdate = async (metadata: Partial<NFTMetadata>) => {
    const selectedNFTs = activeCollection.nfts.filter(n => n.isSelected);
    
    try {
      await Promise.all(selectedNFTs.map(async (nft) => {
        const updatedMetadata = { ...nft.metadata };
        if (metadata.description) updatedMetadata.description = metadata.description;
        if (metadata.attributes && metadata.attributes.length > 0) {
          updatedMetadata.attributes = [...(updatedMetadata.attributes || []), ...metadata.attributes];
        }
        
        return fetch(`/api/nfts/${nft.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metadata: updatedMetadata })
        });
      }));
      
      await fetchNFTs();
      setIsBatchUpdateModalOpen(false);
      handleClearSelection();
    } catch (error) {
      console.error("Error in batch update:", error);
    }
  };

  const handleToggleSelect = (id: string) => {
    setCollections(prev => prev.map(c => 
      c.address === activeCollectionAddress ? {
        ...c,
        nfts: c.nfts.map(nft => nft.id === id ? { ...nft, isSelected: !nft.isSelected } : nft)
      } : c
    ));
  };

  const handleDeleteNFT = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this artifact?")) {
      try {
        const res = await fetch(`/api/nfts/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          await fetchNFTs();
        }
      } catch (error) {
        console.error("Error deleting NFT:", error);
      }
    }
  };

  const handleClearSelection = () => {
    setCollections(prev => prev.map(c => 
      c.address === activeCollectionAddress ? {
        ...c,
        nfts: c.nfts.map(nft => ({ ...nft, isSelected: false }))
      } : c
    ));
  };

  const handleBatchDelete = async () => {
    const selectedNFTs = activeCollection.nfts.filter(n => n.isSelected);
    if (window.confirm(`Are you sure you want to delete ${selectedNFTs.length} artifacts?`)) {
      try {
        await Promise.all(selectedNFTs.map(async (nft) => {
          return fetch(`/api/nfts/${nft.id}`, {
            method: 'DELETE'
          });
        }));
        await fetchNFTs();
        handleClearSelection();
      } catch (error) {
        console.error("Error in batch delete:", error);
      }
    }
  };

  const handleBatchUpdateTrigger = async () => {
    setIsBatchUpdateModalOpen(true);
  };

  const filteredNFTs = activeCollection.nfts.filter(nft => 
    nft.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.metadata.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = useMemo(() => activeCollection.nfts.filter(n => n.isSelected).length, [activeCollection.nfts]);

  return (
    <div className="flex min-h-screen bg-bg text-ink selection:bg-accent selection:text-bg relative">
      <VoidBackground />
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        account={account}
        connect={connect}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogin={login}
        onLogout={logout}
      />
      
      <main className="flex-1 overflow-y-auto relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-sm">
              <img 
                src="/logo.png" 
                alt="Voidforge Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src.endsWith('.png')) {
                    img.src = "/logo.svg";
                  } else if (img.src.endsWith('.svg')) {
                    img.src = "https://picsum.photos/seed/voidforge/200/200";
                  }
                }}
              />
            </div>
            <span className="font-mono font-bold text-lg tracking-tighter">VOIDFORGE</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-bg rounded-sm transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12"
            >
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Collection</span>
                    <div className="h-[1px] w-8 bg-border" />
                  </div>
                  <h1 className="text-3xl md:text-5xl font-mono font-bold uppercase tracking-tighter mb-4">
                    {activeCollection.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
                    <span className="text-muted">Symbol: <span className="text-ink">{activeCollection.symbol}</span></span>
                    <span className="text-muted">Address: <span className="text-accent">{activeCollection.address.slice(0, 6)}...{activeCollection.address.slice(-4)}</span></span>
                    {collections.length > 1 && (
                      <select 
                        value={activeCollectionAddress}
                        onChange={(e) => setActiveCollectionAddress(e.target.value)}
                        className="bg-surface border border-border px-2 py-1 text-[10px] uppercase font-mono focus:ring-1 focus:ring-accent outline-none"
                      >
                        {collections.map(c => (
                          <option key={c.address} value={c.address}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => setIsMintModalOpen(true)}
                    className="btn-primary h-14 px-8 flex items-center justify-center gap-3 w-full md:w-auto"
                  >
                    <Plus size={20} />
                    Mint New NFT
                  </button>
                </div>
              </header>

              <div className="bg-surface border border-border p-8 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input 
                          type="text" 
                          placeholder="Search collection..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="input-field w-full pl-12 h-12"
                        />
                      </div>
                      <div className="flex gap-4 w-full md:w-auto">
                        <button className="btn-outline h-12 px-6 flex items-center gap-2 flex-1 md:flex-none">
                          <Filter size={18} />
                          Filter
                        </button>
                        <button className="btn-outline h-12 w-12 flex items-center justify-center">
                          <RefreshCw size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <LiveFeed />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredNFTs.map((nft, index) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NFTCard 
                      nft={nft} 
                      onUpdate={handleUpdateNFT} 
                      onSelect={handleToggleSelect}
                    />
                  </motion.div>
                ))}
              </div>

              {filteredNFTs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border">
                  <AlertCircle size={48} className="text-muted mb-4" />
                  <p className="font-mono text-muted uppercase tracking-widest">No artifacts found</p>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProfilePage nfts={activeCollection.nfts} onDeleteNFT={handleDeleteNFT} />
            </motion.div>
          ) : activeTab === 'builder' ? (
            <motion.div
              key="builder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BuilderPage 
                onCreateCollection={handleCreateCollection} 
                onLogin={login}
                user={user}
              />
            </motion.div>
          ) : activeTab === 'pfp' ? (
            <motion.div
              key="pfp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PFPGenerator />
            </motion.div>
          ) : activeTab === 'wallet' ? (
            <motion.div
              key="wallet"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WalletPage />
            </motion.div>
          ) : activeTab === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SettingsPage />
            </motion.div>
          ) : (
            <motion.div
              key="other"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 flex items-center justify-center h-full"
            >
              <p className="font-mono text-muted uppercase tracking-widest">Tab under construction</p>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="p-6 md:p-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[10px] text-muted uppercase tracking-widest">
          <span>&copy; 2026 Voidforge Protocol</span>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <a href="#" className="hover:text-accent transition-colors">Smart Contract</a>
            <a href="#" className="hover:text-accent transition-colors">Documentation</a>
            <a href="#" className="hover:text-accent transition-colors">Audit Report</a>
          </div>
        </footer>
      </main>

      <BatchActions 
        selectedCount={selectedCount}
        onClear={handleClearSelection}
        onDelete={handleBatchDelete}
        onUpdate={handleBatchUpdateTrigger}
      />

      <MintModal 
        isOpen={isMintModalOpen} 
        onClose={() => setIsMintModalOpen(false)} 
        onMint={handleMint}
        collections={collections}
        activeCollectionAddress={activeCollectionAddress}
      />

      <BatchUpdateModal
        isOpen={isBatchUpdateModalOpen}
        onClose={() => setIsBatchUpdateModalOpen(false)}
        onUpdate={handleBatchUpdate}
        selectedCount={selectedCount}
      />
    </div>
  );
}

export default function App() {
  return (
    <BlockchainProvider>
      <AppContent />
    </BlockchainProvider>
  );
}

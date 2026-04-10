import { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import NFTCard from './components/NFTCard';
import MintModal from './components/MintModal';
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

const INITIAL_COLLECTION: Collection = {
  name: "Neo-Brutalist Artifacts",
  symbol: "NBA",
  address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  nfts: [
    {
      id: "1",
      tokenId: 1,
      owner: "0xhalvsiebobb...productions",
      mintedAt: Date.now() - 86400000,
      metadata: {
        name: "Cyber Monolith",
        description: "A digital relic from the early 21st century, preserved in the silicon wastes.",
        image: "https://picsum.photos/seed/cyber1/800/800"
      }
    },
    {
      id: "2",
      tokenId: 2,
      owner: "0xhalvsiebobb...productions",
      mintedAt: Date.now() - 43200000,
      metadata: {
        name: "Void Fragment",
        description: "A piece of the architectural void, manifesting as a geometric anomaly.",
        image: "https://picsum.photos/seed/void2/800/800"
      }
    }
  ]
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collection, setCollection] = useState<Collection>(INITIAL_COLLECTION);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addTransaction, account, connect } = useBlockchain();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleMint = (metadata: NFTMetadata) => {
    const newNFT: NFT = {
      id: Math.random().toString(36).substr(2, 9),
      tokenId: collection.nfts.length + 1,
      owner: "0xhalvsiebobb...productions",
      mintedAt: Date.now(),
      metadata,
      isSelected: false
    };
    setCollection({
      ...collection,
      nfts: [newNFT, ...collection.nfts]
    });
  };

  const handleUpdateNFT = (tokenId: number, newMetadata: NFTMetadata) => {
    setCollection({
      ...collection,
      nfts: collection.nfts.map(nft => 
        nft.tokenId === tokenId ? { ...nft, metadata: newMetadata } : nft
      )
    });
  };

  const handleToggleSelect = (id: string) => {
    setCollection({
      ...collection,
      nfts: collection.nfts.map(nft => 
        nft.id === id ? { ...nft, isSelected: !nft.isSelected } : nft
      )
    });
  };

  const handleDeleteNFT = (id: string) => {
    if (confirm("Are you sure you want to delete this artifact?")) {
      setCollection({
        ...collection,
        nfts: collection.nfts.filter(nft => nft.id !== id)
      });
    }
  };

  const handleClearSelection = () => {
    setCollection({
      ...collection,
      nfts: collection.nfts.map(nft => ({ ...nft, isSelected: false }))
    });
  };

  const handleBatchDelete = async () => {
    const selectedIds = collection.nfts.filter(n => n.isSelected).map(n => n.id);
    if (confirm(`Are you sure you want to delete ${selectedIds.length} artifacts?`)) {
      setCollection({
        ...collection,
        nfts: collection.nfts.filter(nft => !nft.isSelected)
      });
    }
  };

  const handleBatchUpdate = async () => {
    const selectedCount = collection.nfts.filter(n => n.isSelected).length;
    await addTransaction('UPDATE');
    alert(`Batch update simulation for ${selectedCount} artifacts triggered.`);
    handleClearSelection();
  };

  const filteredNFTs = collection.nfts.filter(nft => 
    nft.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.metadata.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = useMemo(() => collection.nfts.filter(n => n.isSelected).length, [collection.nfts]);

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
      />
      
      <main className="flex-1 overflow-y-auto relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-sm">
              <img 
                src="https://picsum.photos/seed/voidforge/200/200" 
                alt="Voidforge Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
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
                    {collection.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
                    <span className="text-muted">Symbol: <span className="text-ink">{collection.symbol}</span></span>
                    <span className="text-muted">Address: <span className="text-accent">{collection.address.slice(0, 6)}...{collection.address.slice(-4)}</span></span>
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
              <ProfilePage nfts={collection.nfts} onDeleteNFT={handleDeleteNFT} />
            </motion.div>
          ) : activeTab === 'builder' ? (
            <motion.div
              key="builder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BuilderPage />
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
        onUpdate={handleBatchUpdate}
      />

      <MintModal 
        isOpen={isMintModalOpen} 
        onClose={() => setIsMintModalOpen(false)} 
        onMint={handleMint}
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

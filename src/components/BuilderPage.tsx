import React, { useState } from 'react';
import { Plus, Rocket, Shield, Info, Loader2, CheckCircle2, Settings2, ExternalLink, Globe, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBlockchain } from './BlockchainContext';
import { GoogleGenAI } from "@google/genai";

export default function BuilderPage() {
  const { addTransaction, account, connect, getBlockExplorerUrl } = useBlockchain();
  const [step, setStep] = useState<'form' | 'deploying' | 'success'>('form');
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState('');
  const [collectionData, setCollectionData] = useState({
    name: '',
    symbol: '',
    description: '',
    externalUrl: '',
    royaltyFee: '5',
  });

  const generateLore = async () => {
    if (!collectionData.name) {
      alert("Please enter a collection name first.");
      return;
    }

    setIsGeneratingLore(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a compelling, high-concept backstory and description for an NFT collection named "${collectionData.name}". The tone should be mysterious, futuristic, and slightly dark (Voidforge theme). Keep it under 150 words.`,
      });
      
      if (response.text) {
        setCollectionData(prev => ({ ...prev, description: response.text }));
      }
    } catch (error) {
      console.error("Lore generation failed:", error);
    } finally {
      setIsGeneratingLore(false);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      connect();
      return;
    }
    setStep('deploying');
    const hash = await addTransaction('MINT'); // Simulate deployment transaction
    const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
    setDeployedAddress(mockAddress);
    setStep('success');
  };

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
        <div className="w-20 h-20 bg-surface border border-border flex items-center justify-center rounded-sm">
          <Rocket size={40} className="text-muted" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="font-mono font-bold text-2xl uppercase">Builder Locked</h2>
          <p className="text-muted font-mono text-sm max-w-xs">Connect your wallet to deploy new NFT collections to the blockchain.</p>
        </div>
        <button onClick={connect} className="btn-primary px-8 py-3">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Factory</span>
          <div className="h-[1px] w-8 bg-border" />
        </div>
        <h1 className="text-4xl font-mono font-bold uppercase tracking-tighter">Collection Builder</h1>
      </header>

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleDeploy} 
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-mono text-muted uppercase block mb-2">Collection Name</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. Galactic Voyagers"
                    value={collectionData.name}
                    onChange={(e) => setCollectionData({ ...collectionData, name: e.target.value })}
                    className="input-field w-full h-12"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted uppercase block mb-2">Symbol</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. GVOY"
                    value={collectionData.symbol}
                    onChange={(e) => setCollectionData({ ...collectionData, symbol: e.target.value })}
                    className="input-field w-full h-12"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono text-muted uppercase block">Description</label>
                    <button 
                      type="button"
                      onClick={generateLore}
                      disabled={isGeneratingLore}
                      className="text-[10px] font-mono text-accent hover:text-ink flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingLore ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Sparkles size={10} />
                      )}
                      AI Lore Architect
                    </button>
                  </div>
                  <textarea 
                    required
                    placeholder="Describe your collection..."
                    value={collectionData.description}
                    onChange={(e) => setCollectionData({ ...collectionData, description: e.target.value })}
                    className="input-field w-full h-32 resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-mono font-bold text-[10px] uppercase text-accent mb-4 flex items-center gap-2">
                    <Settings2 size={12} />
                    Advanced Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono text-muted uppercase block mb-2">External URL (Optional)</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                        <input 
                          type="url"
                          placeholder="https://yourproject.com"
                          value={collectionData.externalUrl}
                          onChange={(e) => setCollectionData({ ...collectionData, externalUrl: e.target.value })}
                          className="input-field w-full pl-10 h-10 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-muted uppercase block mb-2">Royalty Fee (%)</label>
                      <input 
                        type="number"
                        min="0"
                        max="10"
                        value={collectionData.royaltyFee}
                        onChange={(e) => setCollectionData({ ...collectionData, royaltyFee: e.target.value })}
                        className="input-field w-full h-10 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-6 flex items-start gap-4">
              <div className="p-2 bg-accent/10 text-accent rounded-sm">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="font-mono font-bold text-sm uppercase mb-1">Editable Metadata Enabled</h4>
                <p className="text-xs text-muted leading-relaxed">
                  This collection will be deployed using the <span className="text-accent">EditableNFT</span> standard. 
                  You will retain the ability to update metadata URIs after minting.
                </p>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-3">
              <Plus size={20} />
              Deploy Collection
            </button>
          </motion.form>
        ) : step === 'deploying' ? (
          <motion.div 
            key="deploying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center space-y-6 border border-border bg-surface"
          >
            <Loader2 size={48} className="text-accent animate-spin" />
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-xl uppercase">Deploying Smart Contract</h3>
              <p className="text-sm text-muted max-w-xs mx-auto">
                Initializing the EditableNFT factory and broadcasting your contract to the network.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center space-y-8 border border-accent bg-accent/5"
          >
            <div className="w-20 h-20 bg-accent text-bg rounded-full flex items-center justify-center">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="font-mono font-bold text-2xl uppercase">Collection Deployed</h3>
              <p className="text-sm text-muted max-w-xs mx-auto">
                Your new collection is live. You can now begin minting artifacts.
              </p>
            </div>
            <div className="bg-bg border border-border p-4 w-full max-w-md text-left">
              <p className="text-[10px] font-mono text-muted uppercase mb-1">Contract Address</p>
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-xs text-accent break-all">{deployedAddress}</p>
                <a 
                  href={getBlockExplorerUrl(deployedAddress, 'address')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-surface rounded-sm transition-colors text-muted hover:text-ink"
                  title="View on Etherscan"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setStep('form')} 
                className="btn-outline px-8 py-3 flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Build Another
              </button>
              <button className="btn-primary px-8 py-3 flex items-center justify-center gap-2">
                <Share2 size={16} />
                Share Collection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

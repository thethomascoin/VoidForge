import React, { useState } from 'react';
import { X, Plus, Image as ImageIcon, Loader2, CheckCircle2, Upload, File as FileIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NFTMetadata } from '@/src/types';
import { useBlockchain } from './BlockchainContext';

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMint: (metadata: NFTMetadata) => void;
}

export default function MintModal({ isOpen, onClose, onMint }: MintModalProps) {
  const [metadata, setMetadata] = useState<NFTMetadata>({
    name: '',
    description: '',
    image: 'https://picsum.photos/seed/nft/800/800',
  });
  const [step, setStep] = useState<'form' | 'minting' | 'success'>('form');
  const [txHash, setTxHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { addTransaction } = useBlockchain();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        setMetadata(prev => ({ ...prev, image: data.url }));
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('minting');
    
    try {
      // 1. Save metadata to backend
      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });
      const { url } = await response.json();

      // 2. Mint on chain with the metadata URL
      // In a real app, we'd pass 'url' to the contract's mint function
      const hash = await addTransaction('MINT');
      
      setTxHash(hash);
      onMint(metadata);
      setStep('success');
    } catch (error) {
      console.error(error);
      setStep('form');
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('form');
      setMetadata({ name: '', description: '', image: 'https://picsum.photos/seed/nft/800/800' });
      setTxHash('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-surface border border-border w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-border bg-bg">
              <h2 className="font-mono font-bold text-lg md:text-xl uppercase tracking-tighter">
                {step === 'form' ? 'Mint New NFT' : step === 'minting' ? 'Transaction Pending' : 'Mint Successful'}
              </h2>
              <button onClick={handleClose} className="text-muted hover:text-ink p-1">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 'form' ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSubmit} 
                    className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
                  >
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-mono text-muted uppercase block mb-2">NFT Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Cyber Punk #001"
                        value={metadata.name}
                        onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                        className="input-field w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-mono text-muted uppercase block mb-2">Description</label>
                      <textarea 
                        required
                        placeholder="Tell the story of this NFT..."
                        value={metadata.description}
                        onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                        className="input-field w-full h-32 resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-muted uppercase block mb-2">Asset File</label>
                      <div className="flex flex-col gap-4">
                        <div className="relative group">
                          <input 
                            type="file"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            accept="image/*,video/*,audio/*,.glb,.gltf"
                          />
                          <div className="btn-outline w-full py-3 flex items-center justify-center gap-3 group-hover:border-accent transition-colors">
                            {isUploading ? (
                              <Loader2 size={18} className="animate-spin text-accent" />
                            ) : (
                              <Upload size={18} />
                            )}
                            <span className="text-xs font-mono uppercase">
                              {isUploading ? "Uploading..." : "Upload from Device"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="h-[1px] flex-1 bg-border" />
                          <span className="text-[10px] font-mono text-muted uppercase">or</span>
                          <div className="h-[1px] flex-1 bg-border" />
                        </div>

                        <div>
                          <input 
                            required
                            type="text"
                            placeholder="Paste asset URL..."
                            value={metadata.image}
                            onChange={(e) => setMetadata({ ...metadata, image: e.target.value })}
                            className="input-field w-full text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-xs font-mono text-muted uppercase block mb-2">Preview</label>
                    <div className="aspect-square bg-black border border-border flex items-center justify-center overflow-hidden relative group">
                      {metadata.image ? (
                        metadata.image.match(/\.(mp4|webm|ogg)$/i) || metadata.image.includes('video') ? (
                          <video 
                            src={metadata.image} 
                            className="w-full h-full object-cover"
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                          />
                        ) : (
                          <img 
                            src={metadata.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )
                      ) : (
                        <ImageIcon size={48} className="text-border" />
                      )}
                      <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>

                    <button 
                      type="submit"
                      className="btn-primary w-full py-4 flex items-center justify-center gap-3"
                    >
                      <Plus size={20} />
                      Mint NFT
                    </button>
                    
                    <p className="text-[10px] font-mono text-muted text-center leading-relaxed">
                      By minting, you are interacting with the <span className="text-accent">EditableNFT</span> smart contract. 
                      Metadata can be updated by the owner at any time.
                    </p>
                  </div>
                </motion.form>
              ) : step === 'minting' ? (
                <motion.div 
                  key="minting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-12 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-accent/20 rounded-full" />
                    <div className="absolute inset-0 w-24 h-24 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-mono font-bold text-lg uppercase">Broadcasting to Ethereum</h3>
                    <p className="text-sm text-muted max-w-xs mx-auto">
                      Your transaction is being processed by the network. This usually takes a few seconds.
                    </p>
                  </div>
                  <div className="bg-surface border border-border px-4 py-2 font-mono text-[10px] text-muted">
                    WAITING FOR CONFIRMATION...
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-24 h-24 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-mono font-bold text-2xl uppercase">NFT Minted Successfully</h3>
                    <p className="text-sm text-muted max-w-xs mx-auto">
                      Your artifact has been permanently etched onto the blockchain.
                    </p>
                  </div>
                  
                  <div className="w-full max-w-sm space-y-3">
                    <div className="bg-surface border border-border p-4 text-left">
                      <p className="text-[8px] font-mono text-muted uppercase mb-1">Transaction Hash</p>
                      <p className="font-mono text-[10px] text-accent break-all">{txHash}</p>
                    </div>
                    <button 
                      onClick={handleClose}
                      className="btn-primary w-full py-3"
                    >
                      View in Collection
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
}

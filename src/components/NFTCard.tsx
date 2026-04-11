import React, { useState } from 'react';
import { Edit2, Save, X, ExternalLink, User, Check, Upload, Loader2, Plus, Trash2, Layout } from 'lucide-react';
import { NFT, NFTMetadata } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useBlockchain } from './BlockchainContext';

interface NFTCardProps {
  nft: NFT;
  onUpdate: (tokenId: number, newMetadata: NFTMetadata) => void;
  onSelect: (id: string) => void;
}

export default function NFTCard({ nft, onUpdate, onSelect }: NFTCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<NFTMetadata>({
    ...nft.metadata,
    attributes: nft.metadata.attributes || []
  });
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.url) {
        setEditedMetadata(prev => ({ ...prev, image: data.url }));
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddAttribute = () => {
    setEditedMetadata(prev => ({
      ...prev,
      attributes: [...(prev.attributes || []), { trait_type: '', value: '' }]
    }));
  };

  const handleRemoveAttribute = (index: number) => {
    setEditedMetadata(prev => ({
      ...prev,
      attributes: (prev.attributes || []).filter((_, i) => i !== index)
    }));
  };

  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    setEditedMetadata(prev => ({
      ...prev,
      attributes: (prev.attributes || []).map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const handleSave = async () => {
    await addTransaction('UPDATE', nft.tokenId);
    onUpdate(nft.tokenId, editedMetadata);
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditedMetadata({
      ...nft.metadata,
      attributes: nft.metadata.attributes || []
    });
  };

  return (
    <div className={cn(
      "card group relative overflow-hidden transition-all duration-300 flex flex-col",
      nft.isSelected ? "border-accent ring-1 ring-accent" : "hover:border-muted",
      isEditing ? "min-h-[500px]" : ""
    )}>
      {/* Void Pulse Effect */}
      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Selection Overlay */}
      <button 
        onClick={() => onSelect(nft.id)}
        className={cn(
          "absolute top-3 left-3 z-20 w-6 h-6 border-2 transition-all flex items-center justify-center rounded-sm",
          nft.isSelected ? "bg-accent border-accent text-bg" : "bg-bg/50 border-border opacity-0 group-hover:opacity-100"
        )}
      >
        {nft.isSelected && <Check size={14} strokeWidth={3} />}
      </button>

      <div className={cn(
        "aspect-square bg-black overflow-hidden border border-border relative shrink-0",
        isEditing ? "h-48 w-48 mx-auto mt-4" : "mb-4"
      )}>
        {/* Rarity Badge */}
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 items-end">
          <div className="bg-accent text-bg px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            {Math.floor(Math.random() * 100)} Rarity
          </div>
          <div className="bg-bg/80 backdrop-blur-sm border border-border px-2 py-0.5 font-mono text-[8px] text-muted uppercase">
            Editable
          </div>
        </div>

        {nft.metadata.image.match(/\.(mp4|webm|ogg)$/i) || nft.metadata.image.includes('video') ? (
          <video 
            src={nft.metadata.image} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            autoPlay 
            loop 
            muted 
            playsInline
          />
        ) : (
          <img 
            src={nft.metadata.image} 
            alt={nft.metadata.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        )}
        {nft.isSelected && <div className="absolute inset-0 bg-accent/10 pointer-events-none" />}
      </div>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-mono font-bold text-lg uppercase tracking-tight">{nft.metadata.name}</h3>
                <span className="font-mono text-xs text-muted">#{nft.tokenId}</span>
              </div>
              <p className="text-sm text-muted mb-4 line-clamp-2 h-10">{nft.metadata.description}</p>
              
              {/* Attributes Preview */}
              {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {nft.metadata.attributes.slice(0, 3).map((attr, i) => (
                    <div key={i} className="bg-surface border border-border px-1.5 py-0.5 rounded-sm">
                      <span className="text-[8px] font-mono text-muted uppercase block leading-none">{attr.trait_type}</span>
                      <span className="text-[10px] font-mono text-ink font-bold block leading-tight">{attr.value}</span>
                    </div>
                  ))}
                  {nft.metadata.attributes.length > 3 && (
                    <div className="bg-surface border border-border px-1.5 py-0.5 rounded-sm flex items-center">
                      <span className="text-[8px] font-mono text-muted">+{nft.metadata.attributes.length - 3}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-border rounded-full flex items-center justify-center">
                    <User size={12} className="text-muted" />
                  </div>
                  <span className="text-[10px] font-mono text-muted truncate max-w-[120px]">
                    {nft.owner}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="btn-outline flex-1 py-1.5 text-[10px] flex items-center justify-center gap-2"
                  >
                    <Edit2 size={12} />
                    Edit Metadata
                  </button>
                  <button className="btn-outline w-10 py-1.5 flex items-center justify-center">
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 flex flex-col h-full"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">Name</label>
                  <input 
                    type="text"
                    value={editedMetadata.name}
                    onChange={(e) => setEditedMetadata({ ...editedMetadata, name: e.target.value })}
                    className="input-field w-full py-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">Description</label>
                  <textarea 
                    value={editedMetadata.description}
                    onChange={(e) => setEditedMetadata({ ...editedMetadata, description: e.target.value })}
                    className="input-field w-full py-1 h-16 resize-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-muted uppercase block mb-1">Asset URL / Upload</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={editedMetadata.image}
                      onChange={(e) => setEditedMetadata({ ...editedMetadata, image: e.target.value })}
                      className="input-field flex-1 py-1 h-8 text-[10px]"
                    />
                    <div className="relative">
                      <input 
                        type="file"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        accept="image/*,video/*,audio/*,.glb,.gltf"
                      />
                      <button className="btn-outline h-8 w-8 flex items-center justify-center">
                        {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Attributes Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-muted uppercase block">Attributes</label>
                    <button 
                      onClick={handleAddAttribute}
                      className="text-[8px] font-mono text-accent hover:text-ink flex items-center gap-1 uppercase"
                    >
                      <Plus size={10} />
                      Add
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {editedMetadata.attributes?.map((attr, index) => (
                      <div key={index} className="flex gap-1 items-center">
                        <input 
                          type="text"
                          placeholder="Trait"
                          value={attr.trait_type}
                          onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                          className="input-field flex-1 h-7 text-[10px] px-2"
                        />
                        <input 
                          type="text"
                          placeholder="Value"
                          value={attr.value}
                          onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                          className="input-field flex-1 h-7 text-[10px] px-2"
                        />
                        <button 
                          onClick={() => handleRemoveAttribute(index)}
                          className="p-1 text-muted hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {(!editedMetadata.attributes || editedMetadata.attributes.length === 0) && (
                      <p className="text-[8px] font-mono text-muted italic text-center py-2 border border-dashed border-border">
                        No attributes
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    className="btn-primary flex-1 py-2 text-[10px] flex items-center justify-center gap-2"
                  >
                    <Save size={12} />
                    Save Changes
                  </button>
                  <button 
                    onClick={handleReset}
                    className="btn-outline w-10 py-2 flex items-center justify-center"
                    title="Reset Changes"
                  >
                    <Layout size={12} />
                  </button>
                </div>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedMetadata({
                      ...nft.metadata,
                      attributes: nft.metadata.attributes || []
                    });
                  }}
                  className="btn-outline w-full py-1.5 text-[10px] flex items-center justify-center gap-2"
                >
                  <X size={12} />
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

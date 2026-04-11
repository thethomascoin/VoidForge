import React, { useState } from 'react';
import { X, Save, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NFTMetadata } from '@/src/types';
import { useBlockchain } from './BlockchainContext';

interface BatchUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (metadata: Partial<NFTMetadata>) => void;
  selectedCount: number;
}

export default function BatchUpdateModal({ isOpen, onClose, onUpdate, selectedCount }: BatchUpdateModalProps) {
  const [step, setStep] = useState<'form' | 'updating' | 'success'>('form');
  const [updateData, setUpdateData] = useState<Partial<NFTMetadata>>({
    description: '',
    attributes: []
  });
  const { addTransaction } = useBlockchain();

  const handleAddAttribute = () => {
    setUpdateData(prev => ({
      ...prev,
      attributes: [...(prev.attributes || []), { trait_type: '', value: '' }]
    }));
  };

  const handleRemoveAttribute = (index: number) => {
    setUpdateData(prev => ({
      ...prev,
      attributes: (prev.attributes || []).filter((_, i) => i !== index)
    }));
  };

  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    setUpdateData(prev => ({
      ...prev,
      attributes: (prev.attributes || []).map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('updating');
    
    try {
      // The actual update happens in App.tsx via onUpdate
      await onUpdate(updateData);
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
      setUpdateData({ description: '', attributes: [] });
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
            className="relative bg-surface border border-border w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-border bg-bg">
              <h2 className="font-mono font-bold text-lg md:text-xl uppercase tracking-tighter">
                {step === 'form' ? `Batch Update (${selectedCount})` : step === 'updating' ? 'Updating Artifacts' : 'Update Successful'}
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
                    className="p-6 md:p-8 space-y-6"
                  >
                    <div className="bg-accent/5 border border-accent/20 p-4 flex items-start gap-3">
                      <AlertCircle size={18} className="text-accent shrink-0 mt-0.5" />
                      <p className="text-xs font-mono text-muted leading-relaxed">
                        You are about to update <span className="text-accent font-bold">{selectedCount}</span> artifacts. 
                        Only fields you modify will be updated. Empty fields will remain unchanged on the artifacts.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-muted uppercase block mb-2">Common Description</label>
                      <textarea 
                        placeholder="Enter a new description for all selected artifacts..."
                        value={updateData.description}
                        onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
                        className="input-field w-full h-24 resize-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono text-muted uppercase block">Common Attributes</label>
                        <button 
                          type="button"
                          onClick={handleAddAttribute}
                          className="text-[10px] font-mono text-accent hover:text-ink flex items-center gap-1 uppercase"
                        >
                          <Plus size={12} />
                          Add Attribute
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {updateData.attributes?.map((attr, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input 
                              type="text"
                              placeholder="Trait"
                              value={attr.trait_type}
                              onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                              className="input-field flex-1 h-9 text-xs"
                            />
                            <input 
                              type="text"
                              placeholder="Value"
                              value={attr.value}
                              onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                              className="input-field flex-1 h-9 text-xs"
                            />
                            <button 
                              type="button"
                              onClick={() => handleRemoveAttribute(index)}
                              className="p-2 text-muted hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {(!updateData.attributes || updateData.attributes.length === 0) && (
                          <p className="text-[10px] font-mono text-muted italic text-center py-4 border border-dashed border-border">
                            No common attributes added
                          </p>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="btn-primary w-full py-4 flex items-center justify-center gap-3"
                    >
                      <Save size={20} />
                      Apply Batch Update
                    </button>
                  </motion.form>
                ) : step === 'updating' ? (
                  <motion.div 
                    key="updating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 flex flex-col items-center justify-center text-center space-y-6"
                  >
                    <Loader2 size={48} className="text-accent animate-spin" />
                    <div className="space-y-2">
                      <h3 className="font-mono font-bold text-lg uppercase">Forging Metadata</h3>
                      <p className="text-sm text-muted max-w-xs mx-auto">
                        Updating {selectedCount} artifacts on the blockchain. Please wait...
                      </p>
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
                      <h3 className="font-mono font-bold text-2xl uppercase">Batch Update Success</h3>
                      <p className="text-sm text-muted max-w-xs mx-auto">
                        All {selectedCount} artifacts have been successfully updated.
                      </p>
                    </div>
                    <button 
                      onClick={handleClose}
                      className="btn-primary w-full max-w-xs py-3"
                    >
                      Return to Dashboard
                    </button>
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

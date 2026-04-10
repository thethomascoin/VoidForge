import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Download, Layers, Image as ImageIcon, RefreshCw, ChevronRight, ChevronDown, Wand2, Sparkles, BarChart3, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PFPLayer, PFPLayerVariation } from '@/src/types';
import { cn } from '@/src/lib/utils';

export default function PFPGenerator() {
  const [layers, setLayers] = useState<PFPLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [combinations, setCombinations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addLayer = () => {
    const newLayer: PFPLayer = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Layer ${layers.length + 1}`,
      variations: [],
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (activeLayerId === id) setActiveLayerId(null);
  };

  const addVariation = (layerId: string) => {
    setLayers(layers.map(layer => {
      if (layer.id === layerId) {
        return {
          ...layer,
          variations: [
            ...layer.variations,
            {
              id: Math.random().toString(36).substr(2, 9),
              name: `Variation ${layer.variations.length + 1}`,
              image: 'https://picsum.photos/seed/' + Math.random() + '/400/400',
            }
          ]
        };
      }
      return layer;
    }));
  };

  const updateVariation = (layerId: string, variationId: string, updates: Partial<PFPLayerVariation>) => {
    setLayers(layers.map(layer => {
      if (layer.id === layerId) {
        return {
          ...layer,
          variations: layer.variations.map(v => v.id === variationId ? { ...v, ...updates } : v)
        };
      }
      return layer;
    }));
  };

  const removeVariation = (layerId: string, variationId: string) => {
    setLayers(layers.map(layer => {
      if (layer.id === layerId) {
        return { ...layer, variations: layer.variations.filter(v => v.id !== variationId) };
      }
      return layer;
    }));
  };

  const generateCombinations = () => {
    if (layers.length === 0 || layers.some(l => l.variations.length === 0)) {
      alert("Please add at least one variation to each layer.");
      return;
    }

    setIsGenerating(true);
    
    // Cartesian product of variations
    const result: any[] = [[]];
    layers.forEach(layer => {
      const temp: any[] = [];
      result.forEach(acc => {
        layer.variations.forEach(variation => {
          temp.push([...acc, { layerName: layer.name, ...variation }]);
        });
      });
      result.length = 0;
      result.push(...temp);
    });

    // Simulate "Forging" delay for dramatic effect
    setTimeout(() => {
      setCombinations(result);
      setPreviewIndex(0);
      setIsGenerating(false);
    }, 1500);
  };

  useEffect(() => {
    if (combinations.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentCombination = combinations[previewIndex];
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const images = currentCombination.map((v: any) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = v.image;
        return img;
      });

      let loadedCount = 0;
      images.forEach((img: HTMLImageElement) => {
        img.onload = () => {
          loadedCount++;
          if (loadedCount === images.length) {
            images.forEach((i: HTMLImageElement) => ctx.drawImage(i, 0, 0, canvas.width, canvas.height));
          }
        };
      });
    }
  }, [combinations, previewIndex]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Generator</span>
          <div className="h-[1px] w-8 bg-border" />
        </div>
        <h1 className="text-4xl font-mono font-bold uppercase tracking-tighter">PFP Collection Generator</h1>
        <p className="text-muted font-mono text-sm mt-2">Create unique combinations by layering different traits.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Layers Management */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <Layers size={16} className="text-accent" />
              Layers
            </h2>
            <button onClick={addLayer} className="btn-outline p-2 text-xs flex items-center gap-2">
              <Plus size={14} />
              Add Layer
            </button>
          </div>

          <div className="space-y-2">
            {layers.map((layer) => (
              <div key={layer.id} className="border border-border bg-surface overflow-hidden">
                <div 
                  className={cn(
                    "p-4 flex items-center justify-between cursor-pointer transition-colors",
                    activeLayerId === layer.id ? "bg-accent/10" : "hover:bg-bg"
                  )}
                  onClick={() => setActiveLayerId(activeLayerId === layer.id ? null : layer.id)}
                >
                  <div className="flex items-center gap-3">
                    {activeLayerId === layer.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="font-mono font-bold text-sm uppercase">{layer.name}</span>
                    <span className="text-[10px] font-mono text-muted">({layer.variations.length} variations)</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                    className="text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <AnimatePresence>
                  {activeLayerId === layer.id && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="border-t border-border p-4 bg-bg/50 space-y-4"
                    >
                      {layer.variations.map((v) => (
                        <div key={v.id} className="flex gap-3 items-start">
                          <div className="w-12 h-12 bg-black border border-border shrink-0 overflow-hidden">
                            <img src={v.image} alt={v.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text" 
                              value={v.name}
                              onChange={(e) => updateVariation(layer.id, v.id, { name: e.target.value })}
                              className="input-field w-full py-1 h-8 text-[10px]"
                            />
                            <input 
                              type="text" 
                              value={v.image}
                              onChange={(e) => updateVariation(layer.id, v.id, { image: e.target.value })}
                              className="input-field w-full py-1 h-8 text-[10px]"
                            />
                          </div>
                          <button 
                            onClick={() => removeVariation(layer.id, v.id)}
                            className="text-muted hover:text-red-500 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => addVariation(layer.id)}
                        className="btn-outline w-full py-2 text-[10px] flex items-center justify-center gap-2"
                      >
                        <Plus size={14} />
                        Add Variation
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {layers.length > 0 && (
            <button 
              onClick={generateCombinations}
              disabled={isGenerating}
              className="btn-primary w-full py-4 flex items-center justify-center gap-3"
            >
              {isGenerating ? <RefreshCw size={20} className="animate-spin" /> : <Wand2 size={20} />}
              Generate Combinations
            </button>
          )}
        </div>

        {/* Right: Preview & Results */}
        <div className="lg:col-span-8 space-y-8">
          {combinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="font-mono font-bold text-sm uppercase tracking-widest text-accent flex items-center gap-2">
                  <Zap size={16} />
                  Artifact Preview
                </h3>
                <div className="aspect-square bg-black border-4 border-accent shadow-[12px_12px_0px_0px_rgba(var(--color-accent),0.2)] relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center gap-4"
                      >
                        <div className="relative">
                          <div className="w-20 h-20 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent" size={32} />
                        </div>
                        <p className="font-mono text-xs text-accent uppercase tracking-[0.4em] animate-pulse">Forging Realities...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <canvas 
                    ref={canvasRef} 
                    width={800} 
                    height={800} 
                    className="w-full h-full"
                  />
                  <div className="absolute bottom-4 left-4 bg-bg/80 backdrop-blur-sm border border-border p-2 font-mono text-[10px] uppercase">
                    Combination #{previewIndex + 1}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setPreviewIndex(prev => Math.max(0, prev - 1))}
                    disabled={previewIndex === 0}
                    className="btn-outline px-4 py-2 text-xs disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="font-mono text-xs text-muted">{previewIndex + 1} / {combinations.length}</span>
                  <button 
                    onClick={() => setPreviewIndex(prev => Math.min(combinations.length - 1, prev + 1))}
                    disabled={previewIndex === combinations.length - 1}
                    className="btn-outline px-4 py-2 text-xs disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-mono font-bold text-sm uppercase tracking-widest text-accent flex items-center gap-2">
                  <BarChart3 size={16} />
                  Rarity Analytics
                </h3>
                <div className="space-y-4">
                  {combinations[previewIndex].map((trait: any, i: number) => {
                    const layer = layers.find(l => l.name === trait.layerName);
                    const rarity = layer ? (1 / layer.variations.length * 100).toFixed(1) : '0';
                    return (
                      <div key={i} className="bg-surface border border-border p-4 flex justify-between items-center group hover:border-accent transition-colors">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-muted uppercase">{trait.layerName}</span>
                          <span className="text-xs font-mono font-bold uppercase">{trait.name}</span>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            "text-[10px] font-mono px-2 py-1 rounded-sm border",
                            parseFloat(rarity) < 15 ? "bg-accent/10 border-accent text-accent" : "bg-bg border-border text-muted"
                          )}>
                            {rarity}% Rarity
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs">
                  <Download size={16} />
                  Download Collection (.zip)
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="w-20 h-20 bg-surface border border-border flex items-center justify-center rounded-sm rotate-3">
                <ImageIcon size={40} className="text-muted -rotate-3" />
              </div>
              <div className="space-y-2">
                <h3 className="font-mono font-bold text-xl uppercase">No Combinations Generated</h3>
                <p className="text-muted font-mono text-sm max-w-xs mx-auto">
                  Add layers and variations on the left, then click generate to see all possible combinations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

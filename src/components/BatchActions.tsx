import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Edit3, Share2, X, CheckSquare } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface BatchActionsProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}

export default function BatchActions({ selectedCount, onClear, onDelete, onUpdate }: BatchActionsProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] md:w-auto"
        >
          <div className="bg-bg border-2 border-accent p-2 flex flex-col sm:flex-row items-center gap-2 shadow-[0_0_30px_rgba(0,255,0,0.15)]">
            <div className="bg-accent text-bg px-4 py-2 flex items-center gap-3 w-full sm:w-auto justify-center">
              <CheckSquare size={18} />
              <span className="font-mono font-bold text-sm uppercase tracking-tighter">
                {selectedCount} Selected
              </span>
            </div>

            <div className="flex items-center gap-1 px-2 w-full sm:w-auto justify-around sm:justify-start">
              <button 
                onClick={onUpdate}
                className="p-3 text-muted hover:text-accent hover:bg-surface transition-all group relative"
              >
                <Edit3 size={18} />
                <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border px-2 py-1 text-[8px] uppercase font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Batch Edit
                </span>
              </button>
              <button 
                className="p-3 text-muted hover:text-accent hover:bg-surface transition-all group relative"
              >
                <Share2 size={18} />
                <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border px-2 py-1 text-[8px] uppercase font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Batch Share
                </span>
              </button>
              <div className="w-[1px] h-6 bg-border mx-2" />
              <button 
                onClick={onDelete}
                className="p-3 text-muted hover:text-red-500 hover:bg-red-500/10 transition-all group relative"
              >
                <Trash2 size={18} />
                <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border px-2 py-1 text-[8px] uppercase font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Batch Delete
                </span>
              </button>
              
              <div className="sm:hidden w-[1px] h-6 bg-border mx-2" />
              <button 
                onClick={onClear}
                className="sm:hidden p-3 text-muted hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <button 
              onClick={onClear}
              className="hidden sm:block p-3 text-muted hover:text-ink transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

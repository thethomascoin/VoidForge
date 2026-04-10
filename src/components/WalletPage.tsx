import { Wallet, ArrowUpRight, ArrowDownLeft, ExternalLink, Coins, Layers } from 'lucide-react';
import { useBlockchain } from './BlockchainContext';
import { cn } from '@/src/lib/utils';

export default function WalletPage() {
  const { account, connect, transactions, getBlockExplorerUrl } = useBlockchain();

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
        <div className="w-20 h-20 bg-surface border border-border flex items-center justify-center rounded-sm">
          <Wallet size={40} className="text-muted" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="font-mono font-bold text-2xl uppercase">Wallet Disconnected</h2>
          <p className="text-muted font-mono text-sm max-w-xs">Connect your Ethereum wallet to manage your assets and view balances.</p>
        </div>
        <button onClick={connect} className="btn-primary px-8 py-3">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Assets</span>
          <div className="h-[1px] w-8 bg-border" />
        </div>
        <h1 className="text-4xl font-mono font-bold uppercase tracking-tighter">My Wallet</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-surface border border-border p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Coins size={120} />
          </div>
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">Total Balance</p>
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-5xl font-mono font-bold">12.45</span>
            <span className="text-xl font-mono text-accent">ETH</span>
          </div>
          <div className="flex gap-4">
            <button className="btn-primary px-6 py-2 flex items-center gap-2 text-xs">
              <ArrowUpRight size={14} />
              Send
            </button>
            <button className="btn-outline px-6 py-2 flex items-center gap-2 text-xs">
              <ArrowDownLeft size={14} />
              Receive
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border p-8">
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-6">Portfolio Distribution</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-xs font-mono uppercase">NFTs</span>
              </div>
              <span className="text-xs font-mono">85%</span>
            </div>
            <div className="w-full bg-border h-1 rounded-full overflow-hidden">
              <div className="bg-accent h-full w-[85%]" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted rounded-full" />
                <span className="text-xs font-mono uppercase">Liquidity</span>
              </div>
              <span className="text-xs font-mono">15%</span>
            </div>
            <div className="w-full bg-border h-1 rounded-full overflow-hidden">
              <div className="bg-muted h-full w-[15%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="font-mono font-bold text-xl uppercase tracking-tight flex items-center gap-3">
          <Layers size={20} className="text-accent" />
          Asset Inventory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-border p-4 flex items-center justify-between group hover:border-muted transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black border border-border overflow-hidden">
                  <img src={`https://picsum.photos/seed/asset${i}/100/100`} alt="Asset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="font-mono font-bold text-sm uppercase">Neo Artifact #{i}04</p>
                  <p className="text-[10px] font-mono text-muted uppercase tracking-tighter">Neo-Brutalist Artifacts</p>
                </div>
              </div>
              <button 
                onClick={() => window.open(getBlockExplorerUrl(account, 'address'), '_blank')}
                className="text-muted hover:text-accent transition-colors"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

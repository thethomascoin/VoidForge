import { useBlockchain } from './BlockchainContext';
import { motion } from 'motion/react';
import { Calendar, Hash, Shield, Activity, ExternalLink, CheckCircle2, Clock, AlertCircle, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function ProfilePage() {
  const { user, transactions, connect } = useBlockchain();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="w-20 h-20 bg-surface border border-border flex items-center justify-center rounded-sm">
          <User size={40} className="text-muted" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="font-mono font-bold text-2xl uppercase">Wallet Not Connected</h2>
          <p className="text-muted font-mono text-sm">Connect your wallet to view your profile and activity.</p>
        </div>
        <button onClick={connect} className="btn-primary px-8 py-3">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <header className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-16">
        <div className="relative">
          <div className="w-32 h-32 border-2 border-accent p-1 rounded-sm rotate-3">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-full h-full object-cover -rotate-3 border border-border"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-accent text-bg p-1.5 rounded-full">
            <Shield size={16} />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-mono font-bold uppercase tracking-tighter mb-2">{user.name}</h1>
          <p className="text-muted font-mono text-sm mb-4 max-w-xl">{user.bio}</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase">
              <Hash size={12} className="text-accent" />
              {user.address}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase">
              <Calendar size={12} className="text-accent" />
              Joined {new Date(user.joinedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="btn-primary px-6 py-3">Edit Profile</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-mono font-bold text-xl uppercase tracking-tight flex items-center gap-3">
              <Activity size={20} className="text-accent" />
              Recent Activity
            </h2>
          </div>

          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={tx.hash}
                  className="bg-surface border border-border p-4 flex items-center justify-between group hover:border-muted transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-sm",
                      tx.status === 'SUCCESS' ? "bg-accent/10 text-accent" : 
                      tx.status === 'PENDING' ? "bg-yellow-500/10 text-yellow-500" : 
                      "bg-red-500/10 text-red-500"
                    )}>
                      {tx.status === 'SUCCESS' ? <CheckCircle2 size={20} /> : 
                       tx.status === 'PENDING' ? <Clock size={20} className="animate-spin" /> : 
                       <AlertCircle size={20} />}
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm uppercase">
                        {tx.type} NFT {tx.tokenId ? `#${tx.tokenId}` : ''}
                      </p>
                      <p className="text-[10px] font-mono text-muted uppercase">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-muted hidden md:block">
                      {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                    </span>
                    <button className="text-muted hover:text-accent transition-colors">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center border border-dashed border-border rounded-sm">
                <p className="font-mono text-muted uppercase tracking-widest text-sm">No recent transactions</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="font-mono font-bold text-xl uppercase tracking-tight">Stats</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-surface border border-border p-6">
              <p className="text-[10px] font-mono text-muted uppercase mb-1">Total Minted</p>
              <p className="text-3xl font-mono font-bold text-accent">12</p>
            </div>
            <div className="bg-surface border border-border p-6">
              <p className="text-[10px] font-mono text-muted uppercase mb-1">Collections</p>
              <p className="text-3xl font-mono font-bold">3</p>
            </div>
            <div className="bg-surface border border-border p-6">
              <p className="text-[10px] font-mono text-muted uppercase mb-1">Success Rate</p>
              <p className="text-3xl font-mono font-bold">100%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

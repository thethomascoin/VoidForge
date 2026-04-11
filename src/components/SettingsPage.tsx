import { Settings, Shield, Globe, Bell, Cpu, Database, Key, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useBlockchain } from './BlockchainContext';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { account, chainId } = useBlockchain();
  const [dbStatus, setDbStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const checkConnection = async () => {
    setDbStatus('checking');
    try {
      const res = await fetch('/api/collections');
      if (res.ok) {
        setDbStatus('online');
      } else {
        setDbStatus('offline');
      }
    } catch (error) {
      setDbStatus('offline');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const sections = [
    {
      title: "Local Infrastructure",
      icon: Database,
      items: [
        { 
          label: "Database Status", 
          value: (
            <div className="flex items-center gap-2">
              {dbStatus === 'checking' && <RefreshCw size={14} className="animate-spin text-muted" />}
              {dbStatus === 'online' && <CheckCircle2 size={14} className="text-accent" />}
              {dbStatus === 'offline' && <XCircle size={14} className="text-red-500" />}
              <span className={
                dbStatus === 'online' ? "text-accent" : 
                dbStatus === 'offline' ? "text-red-500" : 
                "text-muted"
              }>
                {dbStatus.toUpperCase()}
              </span>
              <button 
                onClick={checkConnection}
                className="ml-2 p-1 hover:bg-border rounded-sm transition-colors"
                title="Retry Connection"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          )
        },
        { label: "Engine", value: "SQLite 3 (Persistent)" },
        { label: "Storage", value: "Local File System" },
      ]
    },
    {
      title: "Network Configuration",
      icon: Globe,
      items: [
        { label: "Current Network", value: chainId === '0xaa36a7' ? "Ethereum Sepolia" : "Unknown Network" },
        { label: "Chain ID", value: chainId || "Not Connected" },
        { label: "RPC Endpoint", value: "https://sepolia.infura.io/v3/..." },
      ]
    },
    {
      title: "Security & Access",
      icon: Shield,
      items: [
        { label: "Connected Account", value: account || "None" },
        { label: "Permissions", value: "Admin / Owner" },
        { label: "Contract Version", value: "v1.0.4-stable" },
      ]
    },
    {
      title: "System Preferences",
      icon: Cpu,
      items: [
        { label: "Theme", value: "Neo-Brutalist Dark" },
        { label: "Notifications", value: "Enabled" },
        { label: "Auto-Refresh", value: "30s" },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">System</span>
          <div className="h-[1px] w-8 bg-border" />
        </div>
        <h1 className="text-4xl font-mono font-bold uppercase tracking-tighter">Settings</h1>
      </header>

      <div className="space-y-12">
        {sections.map((section, idx) => (
          <section key={idx} className="space-y-6">
            <h2 className="font-mono font-bold text-sm uppercase tracking-widest flex items-center gap-3 text-accent">
              <section.icon size={16} />
              {section.title}
            </h2>
            <div className="grid grid-cols-1 gap-[1px] bg-border border border-border">
              {section.items.map((item, i) => (
                <div key={i} className="bg-surface p-6 flex justify-between items-center group hover:bg-bg transition-colors">
                  <span className="text-xs font-mono text-muted uppercase tracking-tighter">{item.label}</span>
                  <span className="text-sm font-mono font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="pt-8 space-y-4">
          <button className="btn-outline w-full py-4 flex items-center justify-center gap-3 text-red-500 border-red-500/20 hover:bg-red-500/10">
            <Key size={18} />
            Revoke All Permissions
          </button>
          <p className="text-[10px] font-mono text-muted text-center uppercase tracking-widest leading-relaxed">
            Changes to network settings may require a page refresh to take effect.
          </p>
        </div>
      </div>
    </div>
  );
}

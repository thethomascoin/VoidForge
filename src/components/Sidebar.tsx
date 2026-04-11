import { LayoutDashboard, PlusCircle, Wallet, Settings, User, X, Wand2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  account: string | null;
  connect: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  user?: any;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, account, connect, isOpen, onClose, user, onLogin, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'builder', label: 'Collection Builder', icon: PlusCircle },
    { id: 'pfp', label: 'PFP Generator', icon: Wand2 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 w-64 border-r border-border h-screen flex flex-col bg-bg z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-sm">
              <img 
                src="/logo.png" 
                alt="Voidforge Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback to SVG if logo.png is not found, then to picsum
                  const img = e.target as HTMLImageElement;
                  if (img.src.endsWith('.png')) {
                    img.src = "/logo.svg";
                  } else if (img.src.endsWith('.svg')) {
                    img.src = "https://picsum.photos/seed/voidforge/200/200";
                  }
                }}
              />
            </div>
            <span className="font-mono font-bold text-xl tracking-tighter">VOIDFORGE</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-surface rounded-sm transition-colors">
            <X size={20} />
          </button>
        </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 font-mono text-sm uppercase tracking-wider transition-all rounded-sm",
              activeTab === item.id 
                ? "bg-accent text-bg font-bold" 
                : "text-muted hover:text-ink hover:bg-surface"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-border">
        <div className="bg-surface p-4 rounded-sm border border-border">
          <p className="text-[10px] font-mono text-muted uppercase mb-1">Network</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-xs font-mono font-medium">Ethereum Sepolia</span>
          </div>
          
          <button 
            onClick={connect}
            className={cn(
              "w-full py-2 font-mono text-[10px] uppercase tracking-wider border transition-all mb-2",
              account ? "border-accent text-accent" : "border-muted text-muted hover:border-ink hover:text-ink"
            )}
          >
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
          </button>

          {!user && onLogin && (
            <button 
              onClick={onLogin}
              className="w-full py-2 font-mono text-[10px] uppercase tracking-wider border border-accent bg-accent text-bg hover:bg-ink hover:text-accent transition-all"
            >
              Sign In with Google
            </button>
          )}
          {user && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2">
                <img src={user.photoURL} alt="User" className="w-6 h-6 rounded-full" />
                <span className="text-[10px] font-mono text-muted truncate">{user.displayName}</span>
              </div>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="w-full py-1 font-mono text-[8px] uppercase tracking-wider border border-border text-muted hover:text-red-500 hover:border-red-500 transition-all"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  </>
);
}

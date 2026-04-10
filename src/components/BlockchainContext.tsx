import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, UserProfile } from '@/src/types';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

interface BlockchainContextType {
  transactions: Transaction[];
  isProcessing: boolean;
  user: UserProfile | null;
  account: string | null;
  chainId: string | null;
  connect: () => Promise<void>;
  addTransaction: (type: Transaction['type'], tokenId?: number) => Promise<string>;
  updateTransactionStatus: (hash: string, status: Transaction['status']) => void;
  getBlockExplorerUrl: (hashOrAddress: string, type?: 'tx' | 'address') => string;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const connect = useCallback(async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        // Request accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Request chainId
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setChainId(chainId);
          
          setUser({
            address: accounts[0],
            name: "Web3 User",
            bio: "Connected via Ethereum Wallet",
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${accounts[0]}`,
            joinedAt: Date.now(),
          });
        }
      } catch (error: any) {
        console.error("Connection error:", error);
        if (error.code === 4001) {
          alert("Please connect to MetaMask.");
        } else {
          alert(error.message || "Failed to connect wallet.");
        }
      }
    } else {
      window.open('https://metamask.io/download/', '_blank');
      alert("Please install MetaMask or another Web3 wallet.");
    }
  }, []);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setUser(prev => prev ? { ...prev, address: accounts[0], avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${accounts[0]}` } : null);
        } else {
          setAccount(null);
          setUser(null);
        }
      });

      window.ethereum.on('chainChanged', (id: string) => {
        setChainId(id);
      });
    }
  }, []);

  const addTransaction = useCallback(async (type: Transaction['type'], tokenId?: number): Promise<string> => {
    // This is still a simulation for the "hash" part if we don't have a contract,
    // but the context is now ready for real ethers calls.
    const hash = '0x' + Math.random().toString(16).slice(2, 66);
    const newTx: Transaction = {
      hash,
      type,
      status: 'PENDING',
      timestamp: Date.now(),
      tokenId,
    };

    setTransactions(prev => [newTx, ...prev]);
    setIsProcessing(true);

    // In a real app with a contract:
    // const provider = new ethers.BrowserProvider(window.ethereum);
    // const signer = await provider.getSigner();
    // const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    // const tx = await contract.mint(...);
    // await tx.wait();

    return new Promise((resolve) => {
      setTimeout(() => {
        setTransactions(prev => 
          prev.map(tx => tx.hash === hash ? { ...tx, status: 'SUCCESS' } : tx)
        );
        setIsProcessing(false);
        resolve(hash);
      }, 2500);
    });
  }, []);

  const updateTransactionStatus = useCallback((hash: string, status: Transaction['status']) => {
    setTransactions(prev => 
      prev.map(tx => tx.hash === hash ? { ...tx, status: status } : tx)
    );
  }, []);

  const getBlockExplorerUrl = useCallback((hashOrAddress: string, type: 'tx' | 'address' = 'tx') => {
    const baseUrl = chainId === '0x1' 
      ? 'https://etherscan.io' 
      : 'https://sepolia.etherscan.io';
    return `${baseUrl}/${type}/${hashOrAddress}`;
  }, [chainId]);

  return (
    <BlockchainContext.Provider value={{ 
      transactions, 
      isProcessing, 
      user, 
      account, 
      chainId, 
      connect, 
      addTransaction, 
      updateTransactionStatus,
      getBlockExplorerUrl
    }}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
}

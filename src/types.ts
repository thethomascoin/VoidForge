export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

export interface NFT {
  id: string;
  tokenId: number;
  metadata: NFTMetadata;
  owner: string;
  mintedAt: number;
  isSelected?: boolean;
}

export interface Collection {
  name: string;
  symbol: string;
  address: string;
  nfts: NFT[];
}

export interface Transaction {
  hash: string;
  type: 'MINT' | 'UPDATE' | 'TRANSFER';
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  timestamp: number;
  tokenId?: number;
}

export interface UserProfile {
  address: string;
  name: string;
  bio: string;
  avatar: string;
  joinedAt: number;
}

export interface PFPLayerVariation {
  id: string;
  name: string;
  image: string;
}

export interface PFPLayer {
  id: string;
  name: string;
  variations: PFPLayerVariation[];
}

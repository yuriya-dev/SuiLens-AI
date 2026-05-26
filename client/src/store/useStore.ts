import { create } from 'zustand';
import { 
  WalletData, 
  WhaleFeedItem, 
  SavedAnalysis
} from '@/lib/mockData';

const BACKEND_URL = 'http://localhost:3001';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  charts?: any;
}

interface AppState {
  connectedWallet: string | null;
  isWalletVerified: boolean;
  isVerifyingWallet: boolean;
  searchAddress: string;
  currentWalletData: WalletData | null;
  whaleFeed: WhaleFeedItem[];
  savedAnalyses: SavedAnalysis[];
  chatThreads: Record<string, ChatMessage[]>;
  isAnalyzing: boolean;
  
  // Settings API Configurations
  simulateMode: boolean;
  tatumApiKey: string;
  walrusPublisher: string;
  openaiApiKey: string;

  // Actions
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
  verifyWallet: (
    address: string, 
    signFn: (params: { message: Uint8Array }) => Promise<{ signature: string; bytes: string }>
  ) => Promise<void>;
  setSearchAddress: (address: string) => void;
  analyzeWallet: (address: string) => Promise<WalletData>;
  fetchWhales: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  addWhaleTx: (tx: WhaleFeedItem) => void;
  addChatMessage: (walletAddress: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  updateSettings: (settings: Partial<{ simulateMode: boolean; tatumApiKey: string; walrusPublisher: string; openaiApiKey: string }>) => void;
  clearChat: (walletAddress: string) => void;
  
  // Mobile responsive states
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  connectedWallet: null,
  isWalletVerified: false,
  isVerifyingWallet: false,
  searchAddress: '',
  currentWalletData: null,
  whaleFeed: [],
  savedAnalyses: [],
  chatThreads: {},
  isAnalyzing: false,
  
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  // Default API configuration (loaded from localStorage dynamically with Next.js SSR safeguard)
  simulateMode: typeof window !== 'undefined' ? (localStorage.getItem('suilens_simulateMode') === 'true') : false,
  tatumApiKey: typeof window !== 'undefined' ? (localStorage.getItem('suilens_tatumApiKey') || '') : '',
  walrusPublisher: typeof window !== 'undefined' ? (localStorage.getItem('suilens_walrusPublisher') || 'https://publisher.walrus-testnet.walrus.space') : 'https://publisher.walrus-testnet.walrus.space',
  openaiApiKey: typeof window !== 'undefined' ? (localStorage.getItem('suilens_openaiApiKey') || '') : '',

  connectWallet: (address) => {
    set({ connectedWallet: address });
    // Automatically trigger user-restricted history fetch upon connection
    get().fetchHistory();
  },
  
  disconnectWallet: () => set({ connectedWallet: null, isWalletVerified: false, savedAnalyses: [] }),

  verifyWallet: async (address, signFn) => {
    set({ isVerifyingWallet: true });
    try {
      // 1. Get challenge nonce from backend
      const nonceRes = await fetch(`${BACKEND_URL}/api/auth/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      if (!nonceRes.ok) throw new Error('Failed to retrieve authentication nonce challenge.');
      
      const { nonce } = await nonceRes.json();
      
      // 2. Trigger wallet signing popup
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(nonce);
      const { signature, bytes } = await signFn({ message: messageBytes });

      // 3. Submit signature for cryptographic verification on backend
      const verifyRes = await fetch(`${BACKEND_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signature, bytes })
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || 'Cryptographic signature verification failed.');
      }

      const verifyData = await verifyRes.json();
      if (verifyData.verified) {
        set({ isWalletVerified: true, isVerifyingWallet: false });
      } else {
        throw new Error('Verification completed but returned unauthenticated.');
      }
    } catch (err) {
      console.error(err);
      set({ isWalletVerified: false, isVerifyingWallet: false });
      throw err;
    }
  },

  setSearchAddress: (address) => set({ searchAddress: address }),

  analyzeWallet: async (address) => {
    set({ isAnalyzing: true });
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          settings: {
            simulateMode: get().simulateMode,
            tatumApiKey: get().tatumApiKey,
            walrusPublisher: get().walrusPublisher,
            openaiApiKey: get().openaiApiKey
          }
        })
      });

      if (!response.ok) {
        throw new Error('API server returned an error during analysis.');
      }

      const walletData: WalletData = await response.json();
      
      set({ 
        currentWalletData: walletData,
        isAnalyzing: false,
        searchAddress: walletData.address
      });

      // Refresh Walrus history list from server automatically
      get().fetchHistory();

      return walletData;
    } catch (err) {
      console.error(err);
      set({ isAnalyzing: false });
      throw err;
    }
  },

  fetchWhales: async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/whales`);
      if (response.ok) {
        const data = await response.json();
        set({ whaleFeed: data });
      }
    } catch (err) {
      console.error('Failed to fetch whale feed:', err);
    }
  },

  fetchHistory: async () => {
    try {
      const connected = get().connectedWallet;
      if (!connected) {
        set({ savedAnalyses: [] });
        return;
      }
      
      const response = await fetch(`${BACKEND_URL}/api/history?address=${encodeURIComponent(connected)}`);
      if (response.ok) {
        const data = await response.json();
        set({ savedAnalyses: data });
      }
    } catch (err) {
      console.error('Failed to fetch storage history:', err);
    }
  },

  addWhaleTx: (tx) => set((state) => ({ 
    whaleFeed: [tx, ...state.whaleFeed].slice(0, 50)
  })),

  addChatMessage: async (walletAddress, message) => {
    const thread = get().chatThreads[walletAddress] || [];
    
    // Add User Message locally first
    const userMsg: ChatMessage = {
      ...message,
      id: `user-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    set((state) => ({
      chatThreads: {
        ...state.chatThreads,
        [walletAddress]: [...thread, userMsg]
      }
    }));

    try {
      // Fetch AI response from backend
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletAddress,
          prompt: message.content,
          settings: {
            simulateMode: get().simulateMode,
            tatumApiKey: get().tatumApiKey,
            walrusPublisher: get().walrusPublisher,
            openaiApiKey: get().openaiApiKey
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to communicate with the SuiLens AI backend server.');
      }

      const replyData = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `ai-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: replyData.content,
        timestamp: new Date().toISOString()
      };

      set((state) => ({
        chatThreads: {
          ...state.chatThreads,
          [walletAddress]: [...(state.chatThreads[walletAddress] || []), assistantMsg]
        }
      }));

    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || '⚠️ Connection error: Failed to communicate with the SuiLens AI backend server. Make sure the backend server is running on port 3001.');
    }
  },

  clearChat: (walletAddress) => set((state) => {
    const threads = { ...state.chatThreads };
    delete threads[walletAddress];
    return { chatThreads: threads };
  }),

  updateSettings: (newSettings) => set((state) => {
    if (typeof window !== 'undefined') {
      if (newSettings.simulateMode !== undefined) {
        localStorage.setItem('suilens_simulateMode', String(newSettings.simulateMode));
      }
      if (newSettings.tatumApiKey !== undefined) {
        localStorage.setItem('suilens_tatumApiKey', newSettings.tatumApiKey);
      }
      if (newSettings.walrusPublisher !== undefined) {
        localStorage.setItem('suilens_walrusPublisher', newSettings.walrusPublisher);
      }
      if (newSettings.openaiApiKey !== undefined) {
        localStorage.setItem('suilens_openaiApiKey', newSettings.openaiApiKey);
      }
    }
    return {
      ...state,
      ...newSettings
    };
  })
}));

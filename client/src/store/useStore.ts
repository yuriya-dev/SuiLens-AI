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
  setSearchAddress: (address: string) => void;
  analyzeWallet: (address: string) => Promise<WalletData>;
  fetchWhales: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  addWhaleTx: (tx: WhaleFeedItem) => void;
  addChatMessage: (walletAddress: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  updateSettings: (settings: Partial<{ simulateMode: boolean; tatumApiKey: string; walrusPublisher: string; openaiApiKey: string }>) => void;
  clearChat: (walletAddress: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  connectedWallet: null,
  searchAddress: '',
  currentWalletData: null,
  whaleFeed: [],
  savedAnalyses: [],
  chatThreads: {},
  isAnalyzing: false,

  // Default API configuration
  simulateMode: true,
  tatumApiKey: '',
  walrusPublisher: 'https://publisher.walrus.storage',
  openaiApiKey: '',

  connectWallet: (address) => set({ connectedWallet: address }),
  
  disconnectWallet: () => set({ connectedWallet: null }),

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
      const response = await fetch(`${BACKEND_URL}/api/history`);
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
        throw new Error('API server returned error during chat.');
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

    } catch (err) {
      console.error(err);
      // Append a fallback connection error message
      const errorMsg: ChatMessage = {
        id: `ai-err-${Math.random().toString(36).substring(2, 9)}`,
        role: 'assistant',
        content: '⚠️ Connection error: Failed to communicate with the SuiLens AI backend server. Make sure the backend server is running on port 3001.',
        timestamp: new Date().toISOString()
      };
      set((state) => ({
        chatThreads: {
          ...state.chatThreads,
          [walletAddress]: [...(state.chatThreads[walletAddress] || []), errorMsg]
        }
      }));
    }
  },

  clearChat: (walletAddress) => set((state) => {
    const threads = { ...state.chatThreads };
    delete threads[walletAddress];
    return { chatThreads: threads };
  }),

  updateSettings: (newSettings) => set((state) => ({
    ...state,
    ...newSettings
  }))
}));

import { Response } from 'express';
import { WhaleFeedItem, generateRandomWhaleTx, serverWhaleFeed } from './mockDb';

class WhaleStreamService {
  private clients: Response[] = [];
  private isSimulationRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  registerClient(res: Response) {
    this.clients.push(res);
    console.log(`[Whale Stream Service] Client connected. Total active clients: ${this.clients.length}`);
    
    // Start background simulation loop if not running and we have clients
    if (!this.isSimulationRunning) {
      this.startSimulationLoop();
    }
  }

  unregisterClient(res: Response) {
    this.clients = this.clients.filter(c => c !== res);
    console.log(`[Whale Stream Service] Client disconnected. Total active clients: ${this.clients.length}`);
    
    // Stop background simulation loop if no active clients are connected
    if (this.clients.length === 0 && this.isSimulationRunning) {
      this.stopSimulationLoop();
    }
  }

  broadcastTransaction(tx: WhaleFeedItem) {
    console.log(`[Whale Stream Service] Broadcasting live whale transfer: $${tx.amountUSD.toLocaleString()} USD`);
    const dataString = `data: ${JSON.stringify(tx)}\n\n`;
    
    this.clients.forEach(res => {
      try {
        res.write(dataString);
      } catch (err) {
        console.error('[Whale Stream Service] Fail writing to client stream connection:', err);
      }
    });
  }

  private startSimulationLoop() {
    this.isSimulationRunning = true;
    console.log('[Whale Stream Service] Starting background SUI transaction pool simulation loop...');
    
    // Stream a new simulated transaction every 10 seconds to keep the UI active
    this.intervalId = setInterval(() => {
      try {
        const newTx = generateRandomWhaleTx();
        
        // Push to memory history list
        serverWhaleFeed.unshift(newTx);
        if (serverWhaleFeed.length > 50) {
          serverWhaleFeed.pop();
        }
        
        // Push to active clients
        this.broadcastTransaction(newTx);
      } catch (err) {
        console.error('[Whale Stream Service Error] Fail in transaction loop step:', err);
      }
    }, 10000);
  }

  private stopSimulationLoop() {
    this.isSimulationRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[Whale Stream Service] Suspended background SUI transaction pool loop (idle, no connected clients).');
  }
}

export const whaleStreamService = new WhaleStreamService();

import { Response } from 'express';
import { WhaleFeedItem } from './types';
import { serverWhaleFeed } from './mockDb';

class WhaleStreamService {
  private clients: Response[] = [];
  private isPollerRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private broadcastedHashes: Set<string> = new Set();

  registerClient(res: Response) {
    this.clients.push(res);
    console.log(`[Whale Stream Service] Client connected. Total active clients: ${this.clients.length}`);
    
    // Start background live transaction poller if not running and we have clients
    if (!this.isPollerRunning) {
      this.startPollerLoop();
    }
  }

  unregisterClient(res: Response) {
    this.clients = this.clients.filter(c => c !== res);
    console.log(`[Whale Stream Service] Client disconnected. Total active clients: ${this.clients.length}`);
    
    // Stop background poller if no active clients are connected
    if (this.clients.length === 0 && this.isPollerRunning) {
      this.stopPollerLoop();
    }
  }

  broadcastTransaction(tx: WhaleFeedItem) {
    console.log(`[Whale Stream Service] Broadcasting live mainnet whale transfer: $${tx.amountUSD.toLocaleString()} USD (${tx.amount.toLocaleString()} SUI)`);
    const dataString = `data: ${JSON.stringify(tx)}\n\n`;
    
    this.clients.forEach(res => {
      try {
        res.write(dataString);
      } catch (err) {
        console.error('[Whale Stream Service] Fail writing to client stream connection:', err);
      }
    });
  }

  private startPollerLoop() {
    this.isPollerRunning = true;
    console.log('[Whale Stream Service] Starting live mainnet SUI transaction poller loop...');
    
    // Run an immediate poll on connection
    this.pollRealTransactions();

    // Poll new transactions from Sui Mainnet every 10 seconds
    this.intervalId = setInterval(() => {
      this.pollRealTransactions();
    }, 10000);
  }

  private stopPollerLoop() {
    this.isPollerRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[Whale Stream Service] Suspended mainnet SUI transaction poller (idle, no connected clients).');
  }

  private async pollRealTransactions() {
    try {
      const rpcUrl = 'https://fullnode.mainnet.sui.io:443';
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'suix_queryTransactionBlocks',
          params: [
            {
              options: {
                showInput: true,
                showEffects: true,
                showBalanceChanges: true
              }
            },
            null,
            20,
            true
          ]
        })
      });

      if (!response.ok) return;

      const data = await response.json();
      const txs = data?.result?.data || [];

      for (const tx of txs) {
        const hash = tx.digest;
        // Skip duplicate broadcasts
        if (this.broadcastedHashes.has(hash)) continue;

        const sender = tx.transaction?.data?.sender || 'Unknown';
        const timestampMs = parseInt(tx.timestampMs) || Date.now();
        const balanceChanges = tx.balanceChanges || [];

        // Check if there are any major SUI movements
        for (const change of balanceChanges) {
          const coinType = change.coinType;
          if (coinType === '0x2::sui::SUI') {
            const rawAmount = parseFloat(change.amount) || 0;
            const amountSUI = Math.abs(rawAmount) / 1000000000;

            // Whale Alert threshold set to SUI transfers exceeding 1,000 SUI
            if (amountSUI >= 1000) {
              const amountUSD = amountSUI * 2.10; // Use average SUI market spot rate
              const isSuspicious = amountSUI > 25000;
              const type = rawAmount < 0 ? 'transfer' : 'swap';

              const feedItem: WhaleFeedItem = {
                id: `w-real-${hash.slice(0, 8)}-${Math.random().toString(36).slice(2, 6)}`,
                sender: rawAmount < 0 ? sender : 'Sui DeFi Router',
                senderName: rawAmount < 0 ? `${sender.slice(0, 6)}...${sender.slice(-4)}` : 'Sui DEX Pool',
                receiver: change.owner?.AddressOwner || 'Lending Contract',
                receiverName: change.owner?.AddressOwner 
                  ? `${change.owner.AddressOwner.slice(0, 6)}...${change.owner.AddressOwner.slice(-4)}` 
                  : 'Sui Vault Object',
                amount: parseFloat(amountSUI.toFixed(2)),
                token: 'SUI',
                amountUSD: Math.round(amountUSD * 100) / 100,
                type,
                timestamp: new Date(timestampMs).toISOString(),
                hash,
                isSuspicious
              };

              // Prepend to server in-memory feed
              serverWhaleFeed.unshift(feedItem);
              if (serverWhaleFeed.length > 50) {
                serverWhaleFeed.pop();
              }

              // Broadcast event
              this.broadcastTransaction(feedItem);
              this.broadcastedHashes.add(hash);

              // Limit local set size
              if (this.broadcastedHashes.size > 200) {
                const firstKey = this.broadcastedHashes.keys().next().value;
                if (firstKey) this.broadcastedHashes.delete(firstKey);
              }
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error('[Whale Stream Service Error] Failed to poll mainnet transactions:', err);
    }
  }
}

export const whaleStreamService = new WhaleStreamService();

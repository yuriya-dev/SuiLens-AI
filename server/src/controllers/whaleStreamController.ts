import { Request, Response } from 'express';
import { whaleStreamService } from '../services/whaleStreamService';

/**
 * Express SSE handler establishing a real-time event stream subscription.
 */
export const getWhaleStreamController = (req: Request, res: Response) => {
  // Set SSE standard headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // CORS SSE headers to support cross-origin streaming
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  
  // Flush the headers to establish the stream link immediately
  res.flushHeaders();

  // Register the client in our broadcast hub
  whaleStreamService.registerClient(res);

  // Send an initial connection handshake event
  res.write(': connected\n\n');

  // Heartbeat comment event every 25 seconds to prevent browser/reverse proxy timeouts
  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (err) {
      // Swallowed: Connection has likely been closed
    }
  }, 25000);

  // Clean up when client connection closes
  req.on('close', () => {
    clearInterval(keepAliveInterval);
    whaleStreamService.unregisterClient(res);
  });
};

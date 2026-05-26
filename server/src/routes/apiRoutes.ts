import { Router } from 'express';
import { 
  analyzeWalletController, 
  historyController, 
  whalesController, 
  chatController,
  pricesController,
  insightsController
} from '../controllers/apiControllers';
import { 
  getNonceController, 
  verifySignatureController 
} from '../controllers/authController';
import { 
  getWalrusBlobController 
} from '../controllers/walrusController';
import { 
  getWhaleStreamController 
} from '../controllers/whaleStreamController';

const router = Router();

router.post('/analyze', analyzeWalletController);
router.get('/history', historyController);
router.get('/whales', whalesController);
router.get('/whales/stream', getWhaleStreamController);
router.post('/chat', chatController);
router.get('/prices', pricesController);
router.post('/insights', insightsController);

// Cryptographic Wallet Authentication
router.post('/auth/nonce', getNonceController);
router.post('/auth/verify', verifySignatureController);

// Walrus Storage Gateway Proxy
router.get('/walrus/blob/:blobId', getWalrusBlobController);

export default router;

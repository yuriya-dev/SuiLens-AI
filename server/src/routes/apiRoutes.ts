import { Router } from 'express';
import { 
  analyzeWalletController, 
  historyController, 
  whalesController, 
  chatController 
} from '../controllers/apiControllers';

const router = Router();

router.post('/analyze', analyzeWalletController);
router.get('/history', historyController);
router.get('/whales', whalesController);
router.post('/chat', chatController);

export default router;

/**
 * ルーティングAPI
 */

import * as express from 'express';
import * as purchase from '../controllers/purchase/purchase.controller';
const router = express.Router();

router.get('/getSeatState', purchase.getSeatState);
router.post('/mvtkTicketcode', purchase.mvtkTicketcode);
router.post('/mvtkPurchaseNumberAuth', purchase.mvtkPurchaseNumberAuth);
router.post('/mvtksSatInfoSync', purchase.mvtksSatInfoSync);
router.post('/getSchedule', purchase.getSchedule);

export default router;

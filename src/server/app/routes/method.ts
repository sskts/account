/**
 * ルーティングAPI
 */

import * as express from 'express';
const router = express.Router();

// 発券方法説明
router.get('/ticketing', (_, res) => {
    res.render('method/ticketing');
});

export default router;

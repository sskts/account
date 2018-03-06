/**
 * ルーティングAPI
 */

import * as express from 'express';
import * as inquiry from '../controllers/inquiry/inquiry.controller';
const router = express.Router();

// チケット照会ログイン
router.get('/login', inquiry.login);

// チケット照会ログイン（認証）
router.post('/login', inquiry.auth);

// チケット照会
router.get('/confirm/:orderNumber/', inquiry.confirm);

export default router;

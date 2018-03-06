/**
 * ルーティングAPI
 */

import * as express from 'express';
import * as authorize from '../controllers/authorize/authorize.controller';
const router = express.Router();

router.get('/getCredentials', authorize.getCredentials);

export default router;

/**
 * ルーター
 */

import * as express from 'express';
import { BAD_REQUEST } from 'http-status';
const router = express.Router();

import * as AuthController from '../controllers/auth';
import * as TokenController from '../controllers/token';
import * as UserController from '../controllers/user';

router.get('/', (__: express.Request, res: express.Response) => {
    res.render('index', { title: 'Authorize server' });
});

router.get('/authorize', AuthController.authorize);
router.all('/login', AuthController.login);
router.get('/logout', AuthController.logout);
router.post('/token', TokenController.generate);
router.all('/signup', UserController.signup);
router.all('/confirm', UserController.confirm);
router.get('/error', (req, res) => {
    res.status(BAD_REQUEST).render('error', {
        message: req.query.error
    });
});

export default router;

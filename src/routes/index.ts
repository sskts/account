/**
 * ルーター
 */

import * as express from 'express';
import { BAD_REQUEST } from 'http-status';
const router = express.Router();

import * as AuthController from '../controllers/auth';
import * as TokenController from '../controllers/token';
import * as UserController from '../controllers/user';
// import * as WellKnownController from '../controllers/wellKnown';

// router.get('/.well-known/openid-configuration', WellKnownController.openidConfiguration);
// router.get('/.well-known/jwks.json', WellKnownController.jwks);
// router.get('/userInfo', AuthController.userInfo);
router.get('/authorize', AuthController.authorize);
router.all('/login', AuthController.login);
router.post('/checkLogin', AuthController.checkLogin);
router.get('/logout', AuthController.logout);
router.post('/token', TokenController.generate);
router.all('/signup', UserController.signup);
router.all('/confirm', UserController.confirm);
router.all('/forgotPassword', UserController.forgotPassword);
router.all('/confirmForgotPassword', UserController.confirmForgotPassword);
router.get('/error', (req, res) => {
    res.status(BAD_REQUEST)
        .render('error', {
            message: req.query.error,
            REDIRECT_URI: req.query.redirect_uri
        });
});

export default router;

"use strict";
/**
 * ルーター
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http_status_1 = require("http-status");
const router = express.Router();
const AuthController = require("../controllers/auth");
const TokenController = require("../controllers/token");
const UserController = require("../controllers/user");
router.get('/', (__, res) => {
    res.render('index', { title: 'Authorize server' });
});
router.get('/authorize', AuthController.authorize);
router.all('/login', AuthController.login);
router.get('/logout', AuthController.logout);
router.post('/token', TokenController.generate);
router.all('/signup', UserController.signup);
router.all('/confirm', UserController.confirm);
router.get('/error', (req, res) => {
    res.status(http_status_1.BAD_REQUEST).render('error', {
        message: req.query.error
    });
});
exports.default = router;

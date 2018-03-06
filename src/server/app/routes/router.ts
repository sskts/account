/**
 * ルーティング
 */
import * as express from 'express';
import { getSchedule } from '../controllers/purchase/purchase.controller';
import authorizeRouter from './authorize';
import inquiryRouter from './inquiry';
import masterRouter from './master';
import methodRouter from './method';
import purchaseRouter from './purchase';

export default (app: express.Application) => {
    app.set('layout', 'layouts/layout');
    app.use((req, res, next) => {
        res.locals.NODE_ENV = process.env.NODE_ENV;
        res.locals.PORTAL_SITE_URL = process.env.PORTAL_SITE_URL;
        res.locals.APP_SITE_URL = process.env.APP_SITE_URL;
        res.locals.isApp = ((<Express.Session>req.session).awsCognitoIdentityId !== undefined);
        next();
    });
    app.use('/api/purchase', purchaseRouter);
    app.use('/api/master', masterRouter);
    app.use('/api/authorize', authorizeRouter);
    app.use('/inquiry', inquiryRouter);
    app.use('/method', methodRouter);
    app.get('/purchase/performances/getSchedule', getSchedule);
    app.get('/purchase/transaction', (req, res, _next) => {
        let params = `performanceId=${req.query.performanceId}&passportToken=${req.query.passportToken}`;
        if (req.query.identityId !== undefined) {
            params += `&identityId=${req.query.identityId}`;
        }
        res.redirect(`/?${params}`);
    });
    app.get('/', (_req, res, _next) => {
        res.locals.GMO_ENDPOINT = process.env.GMO_ENDPOINT;
        res.render('purchase/index', { layout: false });
    });

    app.use((_req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.render('notfound/index');
    });
    app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.locals.error = err;
        res.render('error/index');
    });
};

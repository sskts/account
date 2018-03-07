/**
 * ルーティング
 */
import * as express from 'express';
import * as user from '../controllers/user/user.controller';

export default (app: express.Application) => {
    app.set('layout', 'layouts/layout');
    app.use((_req, res, next) => {
        res.locals.NODE_ENV = process.env.NODE_ENV;
        next();
    });

    app.post('/api/user/register', user.register);

    app.use((_req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.render('notfound/index');
    });

    app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.locals.error = err;
        res.render('error/index');
    });
};

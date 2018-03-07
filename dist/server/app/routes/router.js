"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app) => {
    app.set('layout', 'layouts/layout');
    app.use((_req, res, next) => {
        res.locals.NODE_ENV = process.env.NODE_ENV;
        next();
    });
    app.post('/api/user/register', user.register);
    app.use((_req, res, _next) => {
        res.render('notfound/index');
    });
    app.use((err, _req, res, _next) => {
        res.locals.error = err;
        res.render('error/index');
    });
};

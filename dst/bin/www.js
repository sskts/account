#!/usr/bin/env node
"use strict";
/**
 * Module dependencies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const http = require("http");
const app = require("../app");
const debug = createDebug('sskts-account:server');
/**
 * Get port from environment and store in Express.
 */
const port = normalizePort((process.env.PORT === undefined) ? '8081' : process.env.PORT);
app.set('port', port);
/**
 * Create HTTP server.
 */
const server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const normalizedPort = parseInt(val, 10);
    if (isNaN(normalizedPort)) {
        // named pipe
        return val;
    }
    if (normalizedPort >= 0) {
        // port number
        return normalizedPort;
    }
    return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string'
        ? `Pipe ${port}`
        : `Port ${port.toString()}`;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            // tslint:disable-next-line:no-console
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
        case 'EADDRINUSE':
            // tslint:disable-next-line:no-console
            console.error(`${bind} is already in use`);
            process.exit(1);
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? `pipe ${addr}`
        : `port ${addr.port.toString()}`;
    debug(`Listening on ${bind}`);
}

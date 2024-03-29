/**
 * Module dependencies.
 */

import * as createDebug from 'debug';
import * as fs from 'fs';
import * as https from 'https';
import * as app from '../app';

const debug = createDebug('sskts-account:server');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort((process.env.PORT === undefined) ? '44301' : process.env.PORT);
app.set('port', port);

/**
 * Create HTTP server.
 */

const options = {
    // tslint:disable-next-line:non-literal-fs-path
    key: fs.readFileSync(`${__dirname}/../../ssl/server.key`),
    // tslint:disable-next-line:non-literal-fs-path
    cert: fs.readFileSync(`${__dirname}/../../ssl/server.crt`)
};
const server = https.createServer(options, app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
    // tslint:disable-next-line:no-magic-numbers
    const portNumber = parseInt(val, 10);

    if (isNaN(portNumber)) {
        // named pipe
        return val;
    }

    if (portNumber >= 0) {
        // port number
        return portNumber;
    }

    return false;
}

/**
 * Event listener for HTTP server 'error' event.
 */

function onError(error: any) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? `Pipe ${port}`
        : `Port ${(<number>port).toString()}`;

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
 * Event listener for HTTP server 'listening' event.
 */

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? `pipe ${addr}`
        : `port ${addr.port.toString()}`;
    debug(`Listening on ${bind}`);
}

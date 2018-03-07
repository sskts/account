import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as expressLayouts from 'express-ejs-layouts';
// tslint:disable-next-line:no-require-imports
import expressValidator = require('express-validator');
import * as helmet from 'helmet';
import basicAuth from './middlewares/basicAuth/basic-auth.middleware';
import benchmarks from './middlewares/benchmarks/benchmarks.middleware';
import ipFilter from './middlewares/ipFilter/ip-filter.middleware';
import * as locales from './middlewares/locales/locales.middleware';
import session from './middlewares/session/session.middleware';
import whiteList from './middlewares/whiteList/white-list.middleware';
import router from './routes/router';

/**
 * express設定
 */

const app = express();

app.use(ipFilter); // IP制限
app.use(basicAuth); // ベーシック認証
app.use(helmet()); // セキュリティー対策
app.use(whiteList); // 許可設定
app.use(benchmarks); // ベンチマーク的な
app.use(session); // セッション
app.use(locales.setLocale); // 言語
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator()); // バリデーション
app.set('views', `${__dirname}/views`); // view設定
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static(`${__dirname}/../public`)); // server
app.use(express.static(`${__dirname}/../../client/${process.env.NODE_ENV}`)); // client
router(app);

export = app;

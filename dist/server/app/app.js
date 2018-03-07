"use strict";
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
// tslint:disable-next-line:no-require-imports
const expressValidator = require("express-validator");
const helmet = require("helmet");
const basic_auth_middleware_1 = require("./middlewares/basicAuth/basic-auth.middleware");
const benchmarks_middleware_1 = require("./middlewares/benchmarks/benchmarks.middleware");
const ip_filter_middleware_1 = require("./middlewares/ipFilter/ip-filter.middleware");
const locales = require("./middlewares/locales/locales.middleware");
const session_middleware_1 = require("./middlewares/session/session.middleware");
const white_list_middleware_1 = require("./middlewares/whiteList/white-list.middleware");
const router_1 = require("./routes/router");
/**
 * express設定
 */
const app = express();
app.use(ip_filter_middleware_1.default); // IP制限
app.use(basic_auth_middleware_1.default); // ベーシック認証
app.use(helmet()); // セキュリティー対策
app.use(white_list_middleware_1.default); // 許可設定
app.use(benchmarks_middleware_1.default); // ベンチマーク的な
app.use(session_middleware_1.default); // セッション
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
router_1.default(app);
module.exports = app;

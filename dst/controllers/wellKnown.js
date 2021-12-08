"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const OPENID_ENDPOINT = String(process.env.OPENID_ENDPOINT);
const OPENID_KID1 = String(process.env.OPENID_KID1);
const OPENID_N1 = String(process.env.OPENID_N1);
const OPENID_KID2 = String(process.env.OPENID_KID2);
const OPENID_N2 = String(process.env.OPENID_N2);
const OPENID_ISSUER = String(process.env.OPENID_ISSUER);
function openidConfiguration(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json({
                authorization_endpoint: `${OPENID_ENDPOINT}/authorize`,
                id_token_signing_alg_values_supported: ['RS256'],
                issuer: OPENID_ISSUER,
                jwks_uri: `${OPENID_ENDPOINT}/.well-known/jwks.json`,
                response_types_supported: ['code', 'token'],
                scopes_supported: ['openid', 'email', 'phone', 'profile'],
                subject_types_supported: ['public'],
                token_endpoint: `${OPENID_ENDPOINT}/token`,
                // token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
                token_endpoint_auth_methods_supported: ['client_secret_basic'],
                userinfo_endpoint: `${OPENID_ENDPOINT}/userInfo`
            });
        }
        catch (error) {
            res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
        }
    });
}
exports.openidConfiguration = openidConfiguration;
function jwks(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.json({
                keys: [
                    { alg: 'RS256', e: 'AQAB', kid: OPENID_KID1, kty: 'RSA', n: OPENID_N1, use: 'sig' },
                    { alg: 'RS256', e: 'AQAB', kid: OPENID_KID2, kty: 'RSA', n: OPENID_N2, use: 'sig' }
                ]
            });
        }
        catch (error) {
            res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
        }
    });
}
exports.jwks = jwks;

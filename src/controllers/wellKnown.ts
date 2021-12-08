/**
 * openid設定コントローラー
 */
import * as express from 'express';

const OPENID_ENDPOINT = String(process.env.OPENID_ENDPOINT);
const OPENID_KID1 = String(process.env.OPENID_KID1);
const OPENID_N1 = String(process.env.OPENID_N1);
const OPENID_KID2 = String(process.env.OPENID_KID2);
const OPENID_N2 = String(process.env.OPENID_N2);

export async function openidConfiguration(req: express.Request, res: express.Response) {
    try {
        res.json({
            authorization_endpoint: `${OPENID_ENDPOINT}/authorize`,
            id_token_signing_alg_values_supported: ['RS256'],
            issuer: `${OPENID_ENDPOINT}`,
            jwks_uri: `${OPENID_ENDPOINT}/.well-known/jwks.json`,
            response_types_supported: ['code', 'token'],
            scopes_supported: ['openid', 'email', 'phone', 'profile'],
            subject_types_supported: ['public'],
            token_endpoint: `${OPENID_ENDPOINT}/token`,
            // token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
            token_endpoint_auth_methods_supported: ['client_secret_basic'],
            userinfo_endpoint: `${OPENID_ENDPOINT}/userInfo`
        });
    } catch (error) {
        res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
    }
}

export async function jwks(req: express.Request, res: express.Response) {
    try {
        res.json({
            keys: [
                { alg: 'RS256', e: 'AQAB', kid: OPENID_KID1, kty: 'RSA', n: OPENID_N1, use: 'sig' },
                { alg: 'RS256', e: 'AQAB', kid: OPENID_KID2, kty: 'RSA', n: OPENID_N2, use: 'sig' }
            ]
        });
    } catch (error) {
        res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
    }
}

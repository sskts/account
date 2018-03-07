"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
const amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
const AWS = require("aws-sdk/global");
let CognitoUtil = CognitoUtil_1 = class CognitoUtil {
    getUserPool() {
        return new amazon_cognito_identity_js_1.CognitoUserPool(CognitoUtil_1.POOL_DATA);
    }
    getCurrentUser() {
        return this.getUserPool().getCurrentUser();
    }
    // AWS Stores Credentials in many ways, and with TypeScript this means that
    // getting the base credentials we authenticated with from the AWS globals gets really murky,
    // having to get around both class extension and unions. Therefore, we're going to give
    // developers direct access to the raw, unadulterated CognitoIdentityCredentials
    // object at all times.
    setCognitoCreds(creds) {
        this.cognitoCreds = creds;
    }
    getCognitoCreds() {
        return this.cognitoCreds;
    }
    // This method takes in a raw jwtToken and uses the global AWS config options to build a
    // CognitoIdentityCredentials object and store it for us. It also returns the object to the caller
    // to avoid unnecessary calls to setCognitoCreds.
    buildCognitoCreds(idTokenJwt) {
        let url = 'cognito-idp.' + CognitoUtil_1.REGION.toLowerCase() + '.amazonaws.com/' + CognitoUtil_1.USER_POOL_ID;
        // if (environment.cognito_idp_endpoint) {
        //     url = environment.cognito_idp_endpoint + '/' + CognitoUtil.USER_POOL_ID;
        // }
        let logins = {};
        logins[url] = idTokenJwt;
        let params = {
            IdentityPoolId: CognitoUtil_1.IDENTITY_POOL_ID,
            Logins: logins
        };
        let serviceConfigs = {};
        // if (environment.cognito_identity_endpoint) {
        //     serviceConfigs.endpoint = environment.cognito_identity_endpoint;
        // }
        let creds = new AWS.CognitoIdentityCredentials(params, serviceConfigs);
        this.setCognitoCreds(creds);
        return creds;
    }
    getCognitoIdentity() {
        return this.cognitoCreds.identityId;
    }
    getAccessToken(callback) {
        if (callback == null) {
            throw ("CognitoUtil: callback in getAccessToken is null...returning");
        }
        const currentUser = this.getCurrentUser();
        if (currentUser !== null) {
            currentUser.getSession((err, session) => {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }
                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getAccessToken().getJwtToken());
                    }
                }
            });
        }
        else {
            callback.callbackWithParam(null);
        }
    }
    getIdToken(callback) {
        if (callback == null) {
            throw ("CognitoUtil: callback in getIdToken is null...returning");
        }
        const currentUser = this.getCurrentUser();
        if (currentUser !== null) {
            currentUser.getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }
                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getIdToken().getJwtToken());
                    }
                    else {
                        console.log("CognitoUtil: Got the id token, but the session isn't valid");
                    }
                }
            });
        }
        else {
            callback.callbackWithParam(null);
        }
    }
    getRefreshToken(callback) {
        if (callback == null) {
            throw ("CognitoUtil: callback in getRefreshToken is null...returning");
        }
        const currentUser = this.getCurrentUser();
        if (currentUser !== null) {
            currentUser.getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }
                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getRefreshToken());
                    }
                }
            });
        }
        else {
            callback.callbackWithParam(null);
        }
    }
    refresh() {
        const currentUser = this.getCurrentUser();
        if (currentUser !== null) {
            currentUser.getSession(function (err, session) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                }
                else {
                    if (session.isValid()) {
                        console.log("CognitoUtil: refreshed successfully");
                    }
                    else {
                        console.log("CognitoUtil: refreshed but session is still not valid");
                    }
                }
            });
        }
    }
};
CognitoUtil.REGION = process.env.REGION;
CognitoUtil.IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;
CognitoUtil.USER_POOL_ID = process.env.USER_POOL_ID;
CognitoUtil.CLIENT_ID = process.env.CLIENT_ID;
CognitoUtil.POOL_DATA = {
    UserPoolId: CognitoUtil_1.USER_POOL_ID,
    ClientId: CognitoUtil_1.CLIENT_ID
};
CognitoUtil = CognitoUtil_1 = __decorate([
    core_1.Injectable()
], CognitoUtil);
exports.CognitoUtil = CognitoUtil;
var CognitoUtil_1;

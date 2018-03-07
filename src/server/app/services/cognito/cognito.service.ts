import { Injectable } from "@angular/core";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import * as AWS from "aws-sdk/global";
import * as awsservice from "aws-sdk/lib/service";
import * as CognitoIdentity from "aws-sdk/clients/cognitoidentity";


/**
 * Created by Vladimir Budilov
 */

export interface CognitoCallback {
    cognitoCallback(message: string | null, result: any): void;

    handleMFAStep?(challengeName: string, challengeParameters: ChallengeParameters, callback: (confirmationCode: string) => any): void;
}

export interface LoggedInCallback {
    isLoggedIn(message: string, loggedIn: boolean): void;
}

export interface ChallengeParameters {
    CODE_DELIVERY_DELIVERY_MEDIUM: string;

    CODE_DELIVERY_DESTINATION: string;
}

export interface Callback {
    callback(): void;

    callbackWithParam(result: any): void;
}

@Injectable()
export class CognitoUtil {

    public static REGION = <string>process.env.REGION;

    public static IDENTITY_POOL_ID = <string>process.env.IDENTITY_POOL_ID;
    public static USER_POOL_ID = <string>process.env.USER_POOL_ID;
    public static CLIENT_ID = <string>process.env.CLIENT_ID;

    public static POOL_DATA: any = {
        UserPoolId: CognitoUtil.USER_POOL_ID,
        ClientId: CognitoUtil.CLIENT_ID
    };

    public cognitoCreds: AWS.CognitoIdentityCredentials;

    getUserPool() {
        return new CognitoUserPool(CognitoUtil.POOL_DATA);
    }

    getCurrentUser() {
        return this.getUserPool().getCurrentUser();
    }

    // AWS Stores Credentials in many ways, and with TypeScript this means that
    // getting the base credentials we authenticated with from the AWS globals gets really murky,
    // having to get around both class extension and unions. Therefore, we're going to give
    // developers direct access to the raw, unadulterated CognitoIdentityCredentials
    // object at all times.
    setCognitoCreds(creds: AWS.CognitoIdentityCredentials) {
        this.cognitoCreds = creds;
    }

    getCognitoCreds() {
        return this.cognitoCreds;
    }

    // This method takes in a raw jwtToken and uses the global AWS config options to build a
    // CognitoIdentityCredentials object and store it for us. It also returns the object to the caller
    // to avoid unnecessary calls to setCognitoCreds.

    buildCognitoCreds(idTokenJwt: string) {
        let url = 'cognito-idp.' + CognitoUtil.REGION.toLowerCase() + '.amazonaws.com/' + CognitoUtil.USER_POOL_ID;
        // if (environment.cognito_idp_endpoint) {
        //     url = environment.cognito_idp_endpoint + '/' + CognitoUtil.USER_POOL_ID;
        // }
        let logins: CognitoIdentity.LoginsMap = {};
        logins[url] = idTokenJwt;
        let params = {
            IdentityPoolId: CognitoUtil.IDENTITY_POOL_ID, /* required */
            Logins: logins
        };
        let serviceConfigs = <awsservice.ServiceConfigurationOptions>{};
        // if (environment.cognito_identity_endpoint) {
        //     serviceConfigs.endpoint = environment.cognito_identity_endpoint;
        // }
        let creds = new AWS.CognitoIdentityCredentials(params, serviceConfigs);
        this.setCognitoCreds(creds);
        return creds;
    }


    getCognitoIdentity(): string {
        return this.cognitoCreds.identityId;
    }

    getAccessToken(callback: Callback): void {
        if (callback == null) {
            throw ("CognitoUtil: callback in getAccessToken is null...returning");
        }
        const currentUser = this.getCurrentUser();
        if (currentUser !== null) {
            currentUser.getSession((err: any, session: any) => {
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
        } else {
            callback.callbackWithParam(null);
        }
    }

    getIdToken(callback: Callback): void {
        if (callback == null) {
            throw ("CognitoUtil: callback in getIdToken is null...returning");
        }
        const currentUser = this.getCurrentUser();
        if (currentUser !== null) {
            currentUser.getSession(function (err: any, session: any) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                    callback.callbackWithParam(null);
                }
                else {
                    if (session.isValid()) {
                        callback.callbackWithParam(session.getIdToken().getJwtToken());
                    } else {
                        console.log("CognitoUtil: Got the id token, but the session isn't valid");
                    }
                }
            });
        } else {
            callback.callbackWithParam(null);
        }

    }

    getRefreshToken(callback: Callback): void {
        if (callback == null) {
            throw ("CognitoUtil: callback in getRefreshToken is null...returning");
        }
        const currentUser = this.getCurrentUser();
        if (currentUser !== null) {
            currentUser.getSession(function (err: any, session: any) {
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
        } else {
            callback.callbackWithParam(null);
        }

    }

    refresh(): void {
        const currentUser = this.getCurrentUser();
        if (currentUser !== null) {
            currentUser.getSession(function (err: any, session: any) {
                if (err) {
                    console.log("CognitoUtil: Can't set the credentials:" + err);
                } else {
                    if (session.isValid()) {
                        console.log("CognitoUtil: refreshed successfully");
                    } else {
                        console.log("CognitoUtil: refreshed but session is still not valid");
                    }
                }
            });
        }
    }
}

import { Injectable } from "@angular/core";
import { Callback, CognitoUtil } from "../cognito/cognito.service";
import { CognitoUser } from "amazon-cognito-identity-js";

@Injectable()
export class UserParametersService {
    public cognitoUtil: CognitoUtil;

    constructor() {
        this.cognitoUtil = new CognitoUtil();
    }

    getParameters(callback: Callback) {
        let cognitoUser = this.cognitoUtil.getCurrentUser();

        if (cognitoUser !== null) {
            cognitoUser.getSession(function (err: any, _session: any) {
                if (err)
                    console.log("UserParametersService: Couldn't retrieve the user");
                else {
                    (<CognitoUser>cognitoUser).getUserAttributes(function (err, result) {
                        if (err) {
                            console.log("UserParametersService: in getParameters: " + err);
                        } else {
                            callback.callbackWithParam(result);
                        }
                    });
                }

            });
        } else {
            callback.callbackWithParam(null);
        }
    }
}
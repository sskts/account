"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
const cognito_service_1 = require("../cognito/cognito.service");
const amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
const AWS = require("aws-sdk/global");
let UserRegistrationService = class UserRegistrationService {
    constructor(cognitoUtil) {
        this.cognitoUtil = cognitoUtil;
    }
    register(user, callback) {
        console.log("UserRegistrationService: user is " + user);
        let attributeList = [];
        let dataEmail = {
            Name: 'email',
            Value: user.email
        };
        let dataNickname = {
            Name: 'nickname',
            Value: user.name
        };
        attributeList.push(new amazon_cognito_identity_js_1.CognitoUserAttribute(dataEmail));
        attributeList.push(new amazon_cognito_identity_js_1.CognitoUserAttribute(dataNickname));
        attributeList.push(new amazon_cognito_identity_js_1.CognitoUserAttribute({
            Name: 'phone_number',
            Value: user.phone_number
        }));
        this.cognitoUtil.getUserPool().signUp(user.email, user.password, attributeList, [], function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            }
            else {
                console.log("UserRegistrationService: registered user is " + result);
                callback.cognitoCallback(null, result);
            }
        });
    }
    confirmRegistration(username, confirmationCode, callback) {
        let userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };
        let cognitoUser = new amazon_cognito_identity_js_1.CognitoUser(userData);
        cognitoUser.confirmRegistration(confirmationCode, true, function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            }
            else {
                callback.cognitoCallback(null, result);
            }
        });
    }
    resendCode(username, callback) {
        let userData = {
            Username: username,
            Pool: this.cognitoUtil.getUserPool()
        };
        let cognitoUser = new amazon_cognito_identity_js_1.CognitoUser(userData);
        cognitoUser.resendConfirmationCode(function (err, result) {
            if (err) {
                callback.cognitoCallback(err.message, null);
            }
            else {
                callback.cognitoCallback(null, result);
            }
        });
    }
    newPassword(newPasswordUser, callback) {
        console.log(newPasswordUser);
        // Get these details and call
        //cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, this);
        let authenticationData = {
            Username: newPasswordUser.username,
            Password: newPasswordUser.existingPassword,
        };
        let authenticationDetails = new amazon_cognito_identity_js_1.AuthenticationDetails(authenticationData);
        let userData = {
            Username: newPasswordUser.username,
            Pool: this.cognitoUtil.getUserPool()
        };
        console.log("UserLoginService: Params set...Authenticating the user");
        let cognitoUser = new amazon_cognito_identity_js_1.CognitoUser(userData);
        console.log("UserLoginService: config is " + AWS.config);
        cognitoUser.authenticateUser(authenticationDetails, {
            newPasswordRequired: function (userAttributes, requiredAttributes) {
                // User was signed up by an admin and must provide new
                // password and required attributes, if any, to complete
                // authentication.
                // the api doesn't accept this field back
                delete userAttributes.email_verified;
                cognitoUser.completeNewPasswordChallenge(newPasswordUser.password, requiredAttributes, {
                    onSuccess: function (_result) {
                        callback.cognitoCallback(null, userAttributes);
                    },
                    onFailure: function (err) {
                        callback.cognitoCallback(err, null);
                    }
                });
            },
            onSuccess: function (result) {
                callback.cognitoCallback(null, result);
            },
            onFailure: function (err) {
                callback.cognitoCallback(err, null);
            }
        });
    }
};
UserRegistrationService = __decorate([
    core_1.Injectable(),
    __param(0, core_1.Inject(cognito_service_1.CognitoUtil)),
    __metadata("design:paramtypes", [cognito_service_1.CognitoUtil])
], UserRegistrationService);
exports.UserRegistrationService = UserRegistrationService;

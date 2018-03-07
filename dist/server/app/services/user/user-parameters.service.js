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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
const cognito_service_1 = require("../cognito/cognito.service");
let UserParametersService = class UserParametersService {
    constructor() {
        this.cognitoUtil = new cognito_service_1.CognitoUtil();
    }
    getParameters(callback) {
        let cognitoUser = this.cognitoUtil.getCurrentUser();
        if (cognitoUser !== null) {
            cognitoUser.getSession(function (err, _session) {
                if (err)
                    console.log("UserParametersService: Couldn't retrieve the user");
                else {
                    cognitoUser.getUserAttributes(function (err, result) {
                        if (err) {
                            console.log("UserParametersService: in getParameters: " + err);
                        }
                        else {
                            callback.callbackWithParam(result);
                        }
                    });
                }
            });
        }
        else {
            callback.callbackWithParam(null);
        }
    }
};
UserParametersService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], UserParametersService);
exports.UserParametersService = UserParametersService;

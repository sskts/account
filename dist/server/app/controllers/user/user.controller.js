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
const amazon_cognito_identity_js_1 = require("amazon-cognito-identity-js");
const cognito_service_1 = require("../../services/cognito/cognito.service");
/**
 * register
 */
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.body.user;
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
        const cognitoUtil = new cognito_service_1.CognitoUtil();
        cognitoUtil.getUserPool().signUp(user.email, user.password, attributeList, [], (err, result) => {
            if (err !== undefined) {
                res.status(400);
                res.json({ message: err.message });
            }
            else {
                res.json({ result: result });
            }
        });
    });
}
exports.register = register;

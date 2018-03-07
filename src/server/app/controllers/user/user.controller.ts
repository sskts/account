import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { RegistrationUser } from "../../models/registrationUser/registration-user.model";
import { CognitoUtil } from '../../services/cognito/cognito.service';
import { Request, Response } from 'express';

/**
 * register
 */
export async function register(req: Request, res: Response) {
    const user: RegistrationUser = req.body.user;
    console.log("UserRegistrationService: user is " + user);

    let attributeList: CognitoUserAttribute[] = [];

    let dataEmail = {
        Name: 'email',
        Value: user.email
    };
    let dataNickname = {
        Name: 'nickname',
        Value: user.name
    };
    attributeList.push(new CognitoUserAttribute(dataEmail));
    attributeList.push(new CognitoUserAttribute(dataNickname));
    attributeList.push(new CognitoUserAttribute({
        Name: 'phone_number',
        Value: user.phone_number
    }));

    const cognitoUtil = new CognitoUtil();

    cognitoUtil.getUserPool().signUp(
        user.email,
        user.password,
        attributeList,
        [],
        (err, result) => {
            if (err !== undefined) {
                res.status(400);
                res.json({ message: err.message });
            } else {
                res.json({ result: result });
            }
        }
    );

}
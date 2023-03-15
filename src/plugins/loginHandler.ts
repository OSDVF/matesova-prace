import { CredentialResponse } from "google-one-tap";

export class LoginHandler {
    static callback(response: CredentialResponse) {
        console.log(response)
    }
}
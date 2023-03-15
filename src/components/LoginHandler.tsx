import { CredentialResponse } from "google-one-tap";
import { Component, ComponentChild } from "preact";
import jwt_decode from "jwt-decode";

import '../styles/icons.css'

type GoogleUser = {
    given_name: string,
    family_name: string,
}

type State = {
    currentUser: GoogleUser | null
}
export class LoginHandler extends Component<{}, State> {
    constructor() {
        super();
        this.state = {
            currentUser: null
        }
    }

    render({ }, state: State): ComponentChild {
        LoginHandler.instance = this;
        return <div class="user">
            <i class="gg-user"></i>&ensp;
            {state.currentUser?.given_name} {state.currentUser?.family_name ?? 'Not signed in'}
        </div>
    }

    static instance: LoginHandler;
    static callback(response: CredentialResponse) {
        LoginHandler.instance.setState({
            currentUser: jwt_decode(response.credential)
        });
    }

}
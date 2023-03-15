import { CredentialResponse } from "google-one-tap";
import { Component, ComponentChild } from "preact";
import jwt_decode from "jwt-decode";

import '../styles/icons.css'

type GoogleUser = {
    given_name: string,
    family_name: string,
    email: string
}

type State = {
    currentUser: GoogleUser | null,
    domainError: boolean
}

type Props = {
    onLoggedIn: () => void,
    logInPromptText: string,
    allowedDomain: string
}

export class LoginHandler extends Component<Props, State> {
    constructor(props?: Props) {
        super(props);
        this.state = {
            currentUser: null,
            domainError: false
        }
    }

    render(props: Props, state: State): ComponentChild {
        LoginHandler.instance = this;

        if (state.domainError) {
            return <div>
                Only accounts from the following domain are permitted: {props.allowedDomain}
                <button onClick={initLogin}>Retry</button>
            </div>;
        }

        if (!state.currentUser) {
            return <div>
                <div id="googleSignIn"></div>
                {props.logInPromptText}
            </div>;
        }

        return <div class="user">
            <i class="gg-user"></i>&ensp;
            {state.currentUser?.given_name} {state.currentUser?.family_name ?? 'Login error'}
            <br />
            <small>{state.currentUser?.email}</small>
        </div>
    }

    static instance: LoginHandler;
    static callback(response: CredentialResponse) {
        const decoded = jwt_decode(response.credential) as GoogleUser;
        if (decoded.email.endsWith(`@${LoginHandler.instance.props.allowedDomain}`)) {
            LoginHandler.instance.setState({
                currentUser: decoded,
                domainError: false
            });
            LoginHandler.instance.props.onLoggedIn();
        }
        else {
            LoginHandler.instance.setState({
                domainError: true
            });
        }
    }

}


function initLogin() {
    google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_ID,
        callback: LoginHandler.callback,
        cancel_on_tap_outside: false,
        ux_mode: "popup",
        state_cookie_domain: import.meta.env.VITE_DOMAIN,
        allowed_parent_origin: import.meta.env.VITE_DOMAIN_GLOB,
        itp_support: true
    });
    const button = document.getElementById('googleSignIn');
    if (button) {
        google.accounts.id.renderButton(button, {
            text: 'signin',
        });
    }
    google.accounts.id.prompt();
    window.removeEventListener('load', initLogin);
}

if (document.readyState === "complete") {
    initLogin();
}
else {
    window.addEventListener('load', initLogin);
}
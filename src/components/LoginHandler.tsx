import { CredentialResponse } from "google-one-tap";
import { Component, ComponentChild } from "preact";
import { createPortal } from 'preact/compat';
import jwt_decode from "jwt-decode";
import localforage from 'localforage'
import * as Sentry from '@sentry/react'


import '../styles/icons.css'
import { Menu } from "./Menu";

const CREDENTIAL_STORE_KEY = 'cred';

type GoogleUser = {
    given_name: string,
    family_name: string,
    email: string
}

type State = {
    domainError: boolean,
    toggleState: boolean,
    lastClick: {
        left: number,
        top: number
    }
}

type Props = {
    onLoggedIn: () => void,
    logInPromptText: string,
    allowedDomain: string,
}

let storedCredentialExists = false;
localforage.getItem(CREDENTIAL_STORE_KEY, (err, val) => {
    if (!err) {
        storedCredentialExists = true;
    }
})

export class LoginHandler extends Component<Props, State> {
    constructor(props?: Props) {
        super(props);
        this.state = {
            domainError: false,
            toggleState: false,
            lastClick: {
                left: 0,
                top: 0
            }
        }
    }

    componentDidMount(): void {
        LoginHandler.initLogin();
    }

    render(props: Props, state: State): ComponentChild {
        LoginHandler.instance = this;

        if (state.domainError) {
            return <div>
                Only accounts from the following domain are permitted: {props.allowedDomain}
                <button onClick={LoginHandler.initLogin}>Retry</button>
                {storedCredentialExists ?
                    <button onClick={LoginHandler.deleteCredential}>Delete stored login credential</button> : ''
                }
            </div>;
        }

        if (!LoginHandler.currentUser) {
            return <div>
                <div id="googleSignIn"></div>
                {props.logInPromptText}
            </div>;
        }

        return <button class="user" onClick={
            event => this.setState({
                toggleState: !state.toggleState,
                lastClick: {
                    left: event.pageX,
                    top: event.pageY
                }
            })}>
            <i class="gg-user"></i>&ensp;
            {LoginHandler.currentUser?.given_name} {LoginHandler.currentUser?.family_name ?? 'Login error'}
            <br />
            <small>{LoginHandler.currentUser?.email}</small>

            {state.toggleState && createPortal(
                <Menu {...state.lastClick} items={[{
                    text: 'Log Out',
                    onClick: (e) => {
                        this.setState({
                            toggleState: false
                        });
                        LoginHandler.deleteCredential();
                        LoginHandler.currentUser = null;
                    }
                }]} />,
                document.body)}
        </button>
    }

    static instance: LoginHandler | null;
    static currentUser: GoogleUser | null;
    static loginCallback(response: CredentialResponse) {
        const decoded = jwt_decode(response.credential) as GoogleUser;
        LoginHandler.currentUser = decoded;
        LoginHandler.instance?.setState({
            domainError: false
        });
        LoginHandler.instance?.props.onLoggedIn();
        LoginHandler.storeCredential(response);
    }
    static storeCredential(response: CredentialResponse) {
        localforage.setItem(CREDENTIAL_STORE_KEY, response, err => Sentry.captureException(err));
    }
    static initLogin() {
        // Check for stored credentials or start the login process
        localforage.getItem(CREDENTIAL_STORE_KEY, (err, credential) => {
            if (err) {
                Sentry.captureException(err);
            }

            if (credential) {
                LoginHandler.loginCallback(credential as CredentialResponse);
            }
            else {
                const loginPrompt = () => {
                    google.accounts.id.initialize({
                        client_id: import.meta.env.VITE_GOOGLE_ID,
                        callback: LoginHandler.loginCallback,
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
                };
                if (typeof google === 'undefined') {
                    document.getElementById('googleGsiScript')?.addEventListener('load', loginPrompt);
                }
                else {
                    loginPrompt();
                }
            }
        });
    }
    static deleteCredential() {
        localforage.removeItem(CREDENTIAL_STORE_KEY);
    }
}
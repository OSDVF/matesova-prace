import { Router, RouterProps } from "preact-router";
import { useContext, useErrorBoundary } from "preact/hooks";
import * as Sentry from '@sentry/react';
import { LoginHandler } from "./LoginHandler";
import { JSXInternal } from "preact/src/jsx";
import { Fragment } from "preact/jsx-runtime";
import { AppStateContext } from "../plugins/state";

export class SubfolderRouter extends Router {
    public static handler: JSXInternal.Element;
    private subscribed = false;

    constructor(props: RouterProps) {
        super(props)

        SubfolderRouter.handler = <LoginHandler
            allowedDomain='travna.cz'
            logInPromptText='Log in firstly using your @travna account'
            onLoggedIn={() => this.setState({ loggedIn: true })
            }
        />
    }

    showError(e: any) {
        this.setState({
            errorMessage: `Failed to fetch data. Details: ${JSON.stringify(e)}`
        })
        Sentry.captureException(e);
    }

    render(props: RouterProps, state: any) {
        const [error, resetError] = useErrorBoundary(error => {
            Sentry.captureException(error);
        });
        const globalState = useContext(AppStateContext);
        if(!this.subscribed)
        {
            this.subscribed = true;
            globalState.onChange = () => this.setState({});
        }

        if (error) {
            return (
                <Fragment>
                    <h1>Error</h1>
                    <p> An error occurred.</p>
                    <small> Reason: {error.message.toString()}
                        <details>Details: {JSON.stringify(error)} </details>
                    </small>
                    <button onClick={resetError}> Try again </button>
                </Fragment>
            );
        }

        try {
            if (globalState.selectedEventID != null && globalState.applications == null) {
                globalState.fetchApplications();
            }
            else {
                globalState.init().then(() => {
                    globalState.selectedEventID = globalState.selectedEventID ?? globalState.events.length == 1 ? globalState.events[0].eventID : null
                    globalState.onChange!();
                }
                );
            }
        }
        catch (e) {
            this.showError(e)
        }

        if (!state.loggedIn) {
            return <div>{SubfolderRouter.handler} </div>;
        }

        if (state.url.indexOf(import.meta.env.BASE_URL) == 0) {
            state = {
                ...state,
                url: state.url.substr(import.meta.env.BASE_URL.length),
            };
        }
        return <>{super.render(props, state)}
            {
                state.errorMessage != null ?
                    <output className="text-error">
                        {state.errorMessage}
                    </output> : ''
            }</>
    }
}
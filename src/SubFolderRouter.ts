import {Router, RouterProps} from "preact-router";

export class SubfolderRouter extends Router {

    render(props: RouterProps, state: any) {
        if (state.url.indexOf(import.meta.env.BASE_URL) == 0) {
            state = {
                ...state,
                url: state.url.substr(import.meta.env.BASE_URL.length),
            };
        }
        return super.render(props, state);
    }
}
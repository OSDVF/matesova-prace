import path from 'path-browserify'
import { route } from 'preact-router';

class Routes {
    static readonly Home = "/";
    static readonly Teams = "/teams/";
    static readonly Accommodation = "/accommodation/";

    static link(to: string) {
        return path.join(import.meta.env.BASE_URL, to);
    }

    static go(to: string, replace?: boolean) {
        const url = this.link(to);
        route(url, replace);
        if (import.meta.env.BASE_URL.length > 2) {
            window.history.pushState(null, '', location.origin + url);
        }
    }
};

export default Routes;
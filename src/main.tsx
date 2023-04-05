import { Route } from 'preact-router';

import { createContext, render } from 'preact';
import { Home } from './pages/home';
import { SubfolderRouter } from './components/SubFolderRouter';
import { AppState, AppStateContext } from './plugins/state';
import Teams from './pages/teams';
import Routes from './plugins/routes';


const Main = () => (
    <SubfolderRouter>
        <Route path={Routes.Home} component={Home} />
        <Route path={Routes.Teams} component={Teams} />
    </SubfolderRouter>
);

render(
    <AppStateContext.Provider value={new AppState()}>
        <Main />
    </AppStateContext.Provider>,
    document.getElementById('app') as HTMLElement
);

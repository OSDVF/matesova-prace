import { Route } from 'preact-router';

import { createContext, render } from 'preact';
import { Home } from './pages/home';
import { SubfolderRouter } from './components/SubFolderRouter';
import { AppState, AppStateContext } from './plugins/state';


const Main = () => (
    <SubfolderRouter>
        <Route path="/" component={Home} />
    </SubfolderRouter>
);

render(
    <AppStateContext.Provider value={new AppState()}>
        <Main />
    </AppStateContext.Provider>,
    document.getElementById('app') as HTMLElement
);

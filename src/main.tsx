import { Route } from 'preact-router';

import { render } from 'preact';
import { Home } from './pages/home';
import { SubfolderRouter } from './SubFolderRouter';

const Main = () => (
    <SubfolderRouter>
        <Route path="/" component={Home} />
    </SubfolderRouter>
);

render(<Main />, document.getElementById('app') as HTMLElement)

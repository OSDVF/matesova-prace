import { Route } from 'preact-router';

import { render } from 'preact';
import { Home } from './pages/home';
import { SubfolderRouter } from './components/SubFolderRouter';
import { LoginHandler } from './plugins/loginHandler';

google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_ID,
    callback: LoginHandler.callback
  });
  google.accounts.id.prompt();

const Main = () => (
    <SubfolderRouter>
        <Route path="/" component={Home} />
    </SubfolderRouter>
);

render(<Main />, document.getElementById('app') as HTMLElement)

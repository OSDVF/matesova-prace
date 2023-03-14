import { Router, Route } from 'preact-router';
import { render } from 'preact';
import './styles/index.css'
import { Home } from './pages/home';

const Main = () => (
    <Router>
        <Route path="/" component={Home} />
    </Router>
);

render(<Main />, document.getElementById('app') as HTMLElement)

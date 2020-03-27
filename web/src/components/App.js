import React from 'react';
import {
  BrowserRouter,
  Switch,
  Redirect,
  Route,
} from 'react-router-dom';
import Home from './Home';
import Room from './Room';

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/rooms/:id" component={Room} />
      <Route render={() => <Redirect to={{ pathname: '/' }} />} />
    </Switch>
  </BrowserRouter>
);

export default App;

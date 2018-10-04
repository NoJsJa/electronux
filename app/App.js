/**
 * Created by eatong on 17-3-13.
 */
import React, {Component}from 'react';
import {HashRouter, Route, Link} from 'react-router-dom';
import {Provider} from 'mobx-react';

import InstallState from './stores/Install';
import CleanState from './stores/Clean';
import InfoState from './stores/Info';
import StartupState from './stores/Startup';

import HomePage from './views/HomePage';
import InfoPage from './views/info/InfoPage';
import CleanPage from './views/clean/CleanPage';
import StartupPage from './views/startup/StartupPage';
import InstallPage from './views/install/InstallPage';

const stores = {
  install: new InstallState(),
  startup: new StartupState(),
  info: new InfoState(),
  clean: new CleanState()
};


export default  class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <HashRouter>
          <div>
            <Route exact path="/info" component={InfoPage}/>
            <Route exact path="/startup" component={StartupPage}/>
            <Route exact path="/clean" component={CleanPage}/>
            <Route exact path="/install" component={InstallPage}/>
            <Route exact path="/" component={HomePage}/>
          </div>
        </HashRouter>
      </Provider>
    )
  }
}

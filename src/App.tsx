import { Redirect, Route } from 'react-router-dom';
import {
  
  IonApp,
 
  IonRouterOutlet,
  
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';


import MainMenu from './pages/mainMenu/MainMenu';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './App.css';

import AppBarPopOver from './components/AppBarPopOver';
import AppBarMenu from './components/AppBarMenu';
import { dummyArticlesContent } from './pages/document/DocumentsData';
//import { useState } from 'react';

setupIonicReact();



const App: React.FC = () => ( 
  <IonApp>
      <AppBarPopOver></AppBarPopOver>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tab1">
              <Tab1/>
            </Route>
            <Route exact path="/tab2">
              <Tab2 />
            </Route>
            <Route path="/tab3">
              <Tab3 />
            </Route>
            <Route exact path='/Documents/:id'>
              <Documents />
            </Route>
            <Route exact path="/">
              <Redirect to="/tab1" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tab1">
              <IonLabel>APRENDE</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href="/tab2">
              <IonLabel>JUEGA</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tab3">
              <IonLabel>EVALU&Aacute;TE</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
  </IonApp>
);

export default App;

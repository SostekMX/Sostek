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


import LogIn from './pages/logIn/LogIn';
import SignUp from './pages/signUp/SignUp';
import Tab1 from './pages/tab1/Tab1';
import Tab2 from './pages/tab2/Tab2';
import Tab3 from './pages/tab3/Tab3';
import Profile from './pages/profile/Profile';
//import { useState } from 'react';

setupIonicReact();



const App: React.FC = () => ( 
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
          <Route exact path="/MainMenu">
            <MainMenu/>
          </Route>
          <Route exact path="/">
              <LogIn/>
          </Route>
          <Route exact path="/SignUp">
              <SignUp/>
          </Route>
          <Route exact path="/tab1">
              <Tab1/>
          </Route>
          <Route exact path="/tab2">
              <Tab2 />
          </Route>
          <Route path="/tab3">
              <Tab3 />
          </Route>
          <Route path="/Profile">
              <Profile />
          </Route>
      </IonRouterOutlet>
    </IonReactRouter>

  </IonApp>
);

export default App;

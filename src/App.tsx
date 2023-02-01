import { Route, Redirect } from 'react-router-dom';
import {
  IonContent,
  IonApp,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
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
import useInitialState from './hooks/useInitialState';
import Presentation from './pages/presentation/Presentation';
import Documents from './pages/document/Documents';
import AppContext, { AppProvider } from './context/AppContext';
import { useContext, useState } from 'react';
import Evaluation from './pages/evaluation/Evaluation';

setupIonicReact();

const App: React.FC = () => {
  const {changeSearch} = useContext(AppContext);

  return (
    <AppProvider>
    <IonApp>
      <IonContent>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
                <Route exact path="/MainMenu">
                  <Tab1/>
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
                <Route exact path='/Documents/:id'>
                            <Documents/>
                        </Route>
                <Route exact path="/presentation/:driveId">
                <Presentation />
                </Route>
                <Route exact path="/Evaluation/:name/:id" >
                  <Evaluation />
                </Route>

            </IonRouterOutlet>
              <IonTabBar className={window.location.pathname == '/' ? 'tab-bar--hidden' : 'tab-bar--visible'} slot="bottom"
                    onIonTabsWillChange={() => {
                        changeSearch! //no se si este bien -> changeSearch!("") //change
                    }}>
                <IonTabButton tab="tab1" href="/tab1">
                  <IonLabel className='tab-bar__label'><strong>APRENDE</strong></IonLabel>
                </IonTabButton>
                <IonTabButton tab="tab2" href="/tab2">
                  <IonLabel className='tab-bar__label'><b>JUEGA</b></IonLabel>
                </IonTabButton>              
                <IonTabButton tab="tab3" href="/tab3">
                  <IonLabel className='tab-bar__label'><strong>EVALU&Aacute;TE</strong></IonLabel>
                </IonTabButton>
              </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      </IonContent>
    </IonApp>
    </AppProvider>
  );
};

export default App;

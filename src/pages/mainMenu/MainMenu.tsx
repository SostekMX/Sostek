import { Redirect, Route } from 'react-router-dom';
import {
  IonContent,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Tab1 from '../../pages/tab1/Tab1';
import Tab2 from '../../pages/tab2/Tab2';
import Tab3 from '../../pages/tab3/Tab3';
import Documents from '../../pages/document/Documents';

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
import '../../theme/variables.css';
import '../../App.css';


import AppBarPopOver from '../../components/AppBarPopOver';
import AppBarMenu from '../../components/AppBarMenu';
import Profile from '../profile/Profile';

//import { useState } from 'react';

setupIonicReact();



const MainMenu: React.FC = () => {
    return(
        <IonContent>
            
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
                        <Documents/>
                    </Route>
                    <Route exact path='/MainMenu'>
                        <Redirect to ="/tab1"/>
                    </Route>
                    <Route path="/Profile">
                        <Profile />
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
        </IonContent>
    );

  
};

export default MainMenu;

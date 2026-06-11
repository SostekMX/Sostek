import { Route, useLocation } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import {
  IonContent,
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { bookOutline, gameControllerOutline, clipboardOutline } from 'ionicons/icons';
import { IonReactRouter } from '@ionic/react-router';
import { useContext } from 'react';

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
import Presentation from './pages/presentation/Presentation';
import Documents from './pages/document/Documents';
import AppContext, { AppProvider } from './context/AppContext';
import Evaluation from './pages/evaluation/Evaluation';
import FinalScoreEvaluation from './pages/finalScoreEvaluation/FinalScoreEvaluation';
import ForgotPassword from './pages/forgotPassword/ForgotPassword';
import ResetPassword from './pages/resetPassword/ResetPassword';
import Favorites from './pages/favorites/Favorites';

setupIonicReact();

const HIDE_TABBAR_PATHS = ['/', '/SignUp', '/ForgotPassword', '/ResetPassword'];

/* Las rutas de artículos/presentaciones y evaluación/puntaje son sub-pantallas
   de APRENDE y EVALÚATE respectivamente: el tab correspondiente debe seguir
   marcado como activo aunque la ruta no coincida exactamente con /tab1 o /tab3 */
const getActiveTab = (pathname: string): 'tab1' | 'tab2' | 'tab3' | null => {
  if (pathname.startsWith('/tab1') || pathname === '/MainMenu' || pathname.startsWith('/Documents') || pathname.startsWith('/presentation')) {
    return 'tab1';
  }
  if (pathname.startsWith('/tab2')) {
    return 'tab2';
  }
  if (pathname.startsWith('/tab3') || pathname.startsWith('/Evaluation') || pathname.startsWith('/score')) {
    return 'tab3';
  }
  return null;
};

/* Dentro del router para poder usar useLocation */
const MainTabs: React.FC = () => {
  const location = useLocation();
  const hidden = HIDE_TABBAR_PATHS.includes(location.pathname);
  const activeTab = getActiveTab(location.pathname);
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/MainMenu"><Tab1 /></Route>
        <Route exact path="/"><LogIn /></Route>
        <Route exact path="/SignUp"><SignUp /></Route>
        <Route exact path="/tab1"><Tab1 /></Route>
        <Route exact path="/tab2"><Tab2 /></Route>
        <Route path="/tab3"><Tab3 /></Route>
        <PrivateRoute path="/Profile"><Profile /></PrivateRoute>
        <Route exact path='/Documents/:id'><Documents /></Route>
        <Route exact path="/presentation/:driveId"><Presentation /></Route>
        <Route exact path="/Evaluation/:name/:id"><Evaluation /></Route>
        <Route path="/score/:name"><FinalScoreEvaluation /></Route>
        <Route exact path="/ForgotPassword"><ForgotPassword /></Route>
        <Route exact path="/ResetPassword"><ResetPassword /></Route>
        <PrivateRoute exact path="/Favorites"><Favorites /></PrivateRoute>
      </IonRouterOutlet>

      <IonTabBar className={hidden ? 'tab-bar--hidden' : 'tab-bar--visible'} slot="bottom">
        <IonTabButton tab="tab1" href="/tab1" className={activeTab === 'tab1' ? 'tab-bar__btn--active' : undefined}>
          <IonIcon icon={bookOutline} />
          <IonLabel className='tab-bar__label'>APRENDE</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab2" href="/tab2" className={activeTab === 'tab2' ? 'tab-bar__btn--active' : undefined}>
          <IonIcon icon={gameControllerOutline} />
          <IonLabel className='tab-bar__label'>JUEGA</IonLabel>
        </IonTabButton>
        <IonTabButton tab="tab3" href="/tab3" className={activeTab === 'tab3' ? 'tab-bar__btn--active' : undefined}>
          <IonIcon icon={clipboardOutline} />
          <IonLabel className='tab-bar__label'>EVALÚATE</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <IonApp>
        <IonContent>
          <IonReactRouter>
            <MainTabs />
          </IonReactRouter>
        </IonContent>
      </IonApp>
    </AppProvider>
  );
};

export default App;

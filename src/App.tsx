import { Route } from 'react-router-dom';
import { useLocation } from 'react-router';
import {
  IonApp,
  IonContent,
  IonRouterOutlet,
  IonSplitPane,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import PrivateRoute from './components/PrivateRoute';
import { AppProvider } from './context/AppContext';
import Tab1 from './pages/tab1/Tab1';
import Tab2 from './pages/tab2/Tab2';
import Tab3 from './pages/tab3/Tab3';
import Profile from './pages/profile/Profile';
import Documents from './pages/document/Documents';
import Presentation from './pages/presentation/Presentation';
import Evaluation from './pages/evaluation/Evaluation';
import FinalScoreEvaluation from './pages/finalScoreEvaluation/FinalScoreEvaluation';
import LogIn from './pages/logIn/LogIn';
import SignUp from './pages/signUp/SignUp';
import ForgotPassword from './pages/forgotPassword/ForgotPassword';
import ResetPassword from './pages/resetPassword/ResetPassword';
import Favorites from './pages/favorites/Favorites';
import SideNav from './components/layout/SideNav';
import GlassTabBar, { ActiveTab } from './components/layout/GlassTabBar';
import LanguageToggle from './components/layout/LanguageToggle';
import { DESKTOP_QUERY } from './hooks/useMediaQuery';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Theme variables */
import './theme/variables.css';
import './App.css';

setupIonicReact();

const HIDE_TABBAR_PATHS = ['/', '/SignUp', '/ForgotPassword', '/ResetPassword'];

/* Las rutas de articulos/presentaciones y evaluacion/puntaje son sub-pantallas de APRENDE y
   EVALUATE: su pestana sigue marcada aunque la ruta no coincida exactamente. */
const getActiveTab = (pathname: string): ActiveTab => {
  if (pathname.startsWith('/tab1') || pathname === '/MainMenu' || pathname.startsWith('/Documents') || pathname.startsWith('/presentation')) {
    return 'tab1';
  }
  if (pathname.startsWith('/tab2')) {
    return 'tab2';
  }
  if (pathname.startsWith('/tab3') || pathname.startsWith('/Evaluation') || pathname.startsWith('/score')) {
    return 'tab3';
  }
  if (pathname.startsWith('/Profile') || pathname.startsWith('/Favorites')) {
    return 'account';
  }
  return null;
};

/* Dentro del router para poder usar useLocation */
const MainTabs: React.FC = () => {
  const location = useLocation();
  const hidden = HIDE_TABBAR_PATHS.includes(location.pathname);
  const activeTab = getActiveTab(location.pathname);
  /* Desde 768px la barra flotante se esconde por CSS y navega la barra lateral del split
     pane. En las pantallas de acceso no hay navegacion: van a pantalla completa. */
  return (
    <IonSplitPane contentId="main" when={DESKTOP_QUERY} disabled={hidden}>
      <SideNav activeTab={activeTab} pathname={location.pathname} />
      <div id="main" className="main-pane">
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

          <GlassTabBar slot="bottom" hidden={hidden} activeTab={activeTab} />
        </IonTabs>
      </div>
    </IonSplitPane>
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
        <LanguageToggle />
      </IonApp>
    </AppProvider>
  );
};

export default App;

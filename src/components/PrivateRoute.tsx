import { Route, Redirect, RouteProps } from 'react-router-dom';

const PrivateRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const isLoggedIn = sessionStorage.getItem('login') === 'true';
  return (
    <Route {...rest}>
      {isLoggedIn ? children : <Redirect to="/" />}
    </Route>
  );
};

export default PrivateRoute;

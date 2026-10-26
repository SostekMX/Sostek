import { Route, Redirect, RouteProps } from 'react-router-dom';
import { isLoggedIn } from '../utils/session';

const PrivateRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  return (
    <Route {...rest}>
      {isLoggedIn() ? children : <Redirect to="/" />}
    </Route>
  );
};

export default PrivateRoute;

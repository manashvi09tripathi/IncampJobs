import logo from './logo.svg';
import './App.css';
import 'antd/dist/antd.css';
import { Button } from 'antd';
import Home from './pages/Home';
import JobInfo from './pages/JobInfo';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import AppliedJobs from './pages/AppliedJobs';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import { css } from '@emotion/react';
import FadeLoader from 'react-spinners/FadeLoader';
import { useDispatch, useSelector } from 'react-redux';
import { getAllJobs } from './redux/actions/jobActions.';
import { useEffect } from 'react';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPasswordScreen';
import Login from './pages/Login';
import PostedJobs from './pages/PostedJobs';
import EditJob from './pages/EditJob';
import ResetPasswordScreen from './pages/ResetPasswordScreen';
import { getAllUsers } from './redux/actions/userActions';
import UserInfo from './pages/UserInfo';
// import ProtectedRoute from './routing/ProtectedRoute';

function App() {
  const { loader } = useSelector((state) => state.loaderReducer);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllJobs());
    dispatch(getAllUsers());
  }, []);
  return (
    <div className="App">
      {loader && (
        <div className="sweet-loading text-center">
          <FadeLoader color={'#001529'} />
        </div>
      )}

      <BrowserRouter>
        <Switch>
          <Route path="/forgotpassword" exact component={ForgotPassword} />
          <Route
            path="/resetpassword/:resetToken"
            exact
            component={ResetPasswordScreen}
          />
        </Switch>
        <Route path="/login" exact component={Login} />
        <Route path="/register" exact component={Register} />

        <ProtectedRoute path="/" exact component={Home} />
        <ProtectedRoute path="/appliedjobs" exact component={AppliedJobs} />
        <ProtectedRoute path="/postjob" exact component={PostJob} />

        <ProtectedRoute path="/profile" exact component={Profile} />
        <ProtectedRoute path="/jobs/:id" exact component={JobInfo} />

        <ProtectedRoute path="/posted" exact component={PostedJobs} />

        <ProtectedRoute path="/editjob/:id" exact component={EditJob} />
        <ProtectedRoute path="/users/:id" exact component={UserInfo} />
      </BrowserRouter>
    </div>
  );
}

export default App;

export function ProtectedRoute(props) {
  const user = localStorage.getItem('user');

  if (!user) {
    return <Redirect to="/login" />;
  } else {
    return <Route {...props} />;
  }
}

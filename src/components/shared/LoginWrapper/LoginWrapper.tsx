import React from 'react';
import classes from './LoginWrapper.module.scss';
import SETTINGS, { LoggedLevel } from '../../../Settings';
import { RouteComponentProps, Link } from 'react-router-dom';
import { BigPreloader } from '../../../helpers';

export type AllowedLoginState = "none" | "progress" | "student" | "teacher" | "error";

export type GenericLoginWrapperProps = RouteComponentProps & { 
  component: React.ComponentType<RouteComponentProps> | React.ComponentType<{}>
};

type LWProps = RouteComponentProps & { 
  component: React.ComponentType<RouteComponentProps> | React.ComponentType<{}>;
  allowOn: AllowedLoginState | AllowedLoginState[];
  onInvalidCredentials?: JSX.Element | React.ComponentType;
  onNotLogged?: JSX.Element | React.ComponentType;
  onLogin?: JSX.Element | React.ComponentType;
  onError?: JSX.Element | React.ComponentType;
};

type LWState = {
  logged: AllowedLoginState;
};

export default class LoginWrapper extends React.Component<LWProps> {
  state: LWState;

  constructor(props: LWProps) {
    super(props);

    let is_logged: boolean | null = false;
    if (SETTINGS.logged) {
      is_logged = true;
    }
    else if (SETTINGS.login_pending) {
      is_logged = null;

      // Souscrit à la promesse d'attente
      SETTINGS.login_promise
        .then(() => {
          this.setState({ logged: SETTINGS.logged === LoggedLevel.teacher ? "teacher" : "student" });
        })
        .catch(() => {
          this.setState({ logged: "error" });
        });
    }

    this.state = {
      logged: is_logged ? 
        (SETTINGS.logged === LoggedLevel.teacher ? "teacher" : "student") : 
        (is_logged === null ? "progress" : "none"),
    };
  }

  renderInvalidCredentials() {
    if (this.props.onInvalidCredentials) {
      if (React.isValidElement(this.props.onInvalidCredentials))
        return this.props.onInvalidCredentials;
      else
        // @ts-ignore
        return <this.props.onInvalidCredentials />;
    }

    return (
      <div>
        You're not allowed to access this page
      </div>
    );
  }

  renderInLog() {
    if (this.props.onLogin) {
      if (React.isValidElement(this.props.onLogin))
        return this.props.onLogin;
      else
        // @ts-ignore
        return <this.props.onLogin />;
    }
    
    return (
      <BigPreloader style={{ height: '100vh' }} />
    );
  }

  renderNotLogged() {
    if (this.props.onNotLogged) {
      if (React.isValidElement(this.props.onNotLogged))
        return this.props.onNotLogged;
      else
        // @ts-ignore
        return <this.props.onNotLogged />;
    }

    return (
      <div>
        You're not logged. Please log-in.
      </div>
    );
  }

  renderError() {
    if (this.props.onError) {
      if (React.isValidElement(this.props.onError))
        return this.props.onError;
      else
        // @ts-ignore
        return <this.props.onError />;
    }

    return (
      <div>
        Unable to login. 
        It may be a server error, or your credentials aren't valid anymore.
        Try to <Link to="/login/">Login</Link> again.
      </div>
    );
  }

  render() {
    if (
      (typeof this.props.allowOn === 'string' && this.state.logged === this.props.allowOn) ||
      (Array.isArray(this.props.allowOn) && this.props.allowOn.includes(this.state.logged))
    ) {
      return <this.props.component {...this.props} />;
    }

    if (this.state.logged === "progress") {
      return this.renderInLog();
    }
    else if (this.state.logged === "student") {
      return this.renderInvalidCredentials();
    }
    else if (this.state.logged === "teacher") {
      return this.renderInvalidCredentials();
    }
    else if (this.state.logged === "error") {
      return this.renderError();
    }
    return this.renderNotLogged();
  }
}

export const GenericLoginWrapper: React.FC<GenericLoginWrapperProps> = props => {
  return <LoginWrapper {...props} allowOn={["teacher", "student"]} />
};
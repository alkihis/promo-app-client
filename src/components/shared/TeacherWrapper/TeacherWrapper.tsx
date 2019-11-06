import React from 'react';
import classes from './TeacherWrapper.module.scss';
import SETTINGS from '../../../Settings';
import { RouteComponentProps } from 'react-router-dom';

type TWProps = RouteComponentProps & { 
  component: React.ComponentType<RouteComponentProps> | React.ComponentType<{}>
};

// TODO should block if user is not logged / not a teacher, or show props.children instead
export default class TeacherWrapper extends React.Component<TWProps> {
  state = {};

  componentDidMount() {
    setTimeout(() => {
      SETTINGS.testlogin();
      this.setState({ logged: true });
    }, 500);
  }

  render() {
    // TODO check teacher
    if (!SETTINGS.logged) { return ""; }

    return <this.props.component {...this.props} />
  }
}

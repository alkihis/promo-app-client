import React from 'react';
import classes from './RouterWrapper.module.scss';
import { RouteComponentProps, withRouter } from 'react-router-dom';

// TODO Appbar ? voir quoi faire, mais nécessaire d'afficher au moins le titre de la page
class RouterWrapper extends React.Component<RouteComponentProps> {
  render() {
    return <></>;
  }
}

export default withRouter(RouterWrapper);

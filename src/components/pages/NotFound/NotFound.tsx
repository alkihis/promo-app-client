import React from 'react';
import classes from './NotFound.module.scss';
import { RouteComponentProps } from 'react-router-dom';

const NotFound: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  return (
    <div>
      You tried to show {props.location.pathname}, but it does not exists.
    </div>
  );
};

export default NotFound;

import React from 'react';
import classes from './NotFound.module.scss';
import { RouteComponentProps } from 'react-router-dom';
import { FullError } from '../../shared/EmbeddedError/EmbeddedError';

const NotFound: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  return <FullError 
    text={`Vous avez essayé d'afficher ${props.location.pathname}, mais cette page n'existe pas.`} 
    button={{
      link: "/",
      text: "Page d'accueil"
    }}
    />;
};

export default NotFound;

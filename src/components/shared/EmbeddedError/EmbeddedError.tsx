import React from 'react';
import { APIError } from '../../../APIHelper';
import { CenterComponent, errorToText } from '../../../helpers';
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import classes from './EmbeddedError.module.scss';
import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

type EEProp = {
  error?: APIError | number;
  text?: string;
};

const EmbeddedError: React.FC<EEProp> = props => {
  let t = props.text as string;

  if (props.error) {
    t = errorToText(props.error);
  }

  return (
    <CenterComponent className={classes.container}>
      <ErrorIcon className={classes.icon} />
      <Typography component="h5" className={classes.header}>
        Erreur
      </Typography>
      <Typography component="h6" className={classes.text}>
        {t ? t : "Erreur inconnue"}
      </Typography>
    </CenterComponent>
  )
};

export const EmbeddedInfo: React.FC<{text: string, link?: { internal?: boolean; to: string; text?: string; } | string}> = props => {
  let t = props.text as string;

  const link = props.link &&
    (typeof props.link === 'string' ? 
      <a className={classes.link} href={props.link} rel="noopener noreferrer" target="_blank">{props.link}</a> :
      (props.link?.internal ? 
        <Link className={classes.link} to={props.link.to}>
          {props.link?.text ?? props.link?.to}
        </Link> :
        <a className={classes.link} href={props.link?.to} rel="noopener noreferrer" target="_blank">{props.link?.text ?? props.link?.to}</a>)
      );

  return (
    <CenterComponent className={classes.container}>
      <InfoIcon className={classes.icon} />
      <Typography component="h6" className={classes.text}>
        {t}
      </Typography>
      {link}
    </CenterComponent>
  )
};

export default EmbeddedError;

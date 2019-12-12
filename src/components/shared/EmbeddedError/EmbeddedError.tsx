import React from 'react';
import { APIError } from '../../../APIHelper';
import { CenterComponent, errorToText } from '../../../helpers';
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import classes from './EmbeddedError.module.scss';
import { Typography, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

type EEProp = {
  error?: APIError | number;
  text?: string;
  in_container?: boolean;
};

type FEProp = {
  error?: APIError | number;
  text?: string;
  title?: string;
  custom_icon?: React.ComponentType<SvgIconProps>;
  button?: {
    link: string;
    text?: string;
  };
};

export const FullError: React.FC<FEProp> = props => {
  let t = props.text as string;

  if (props.error) {
    t = errorToText(props.error);
  }

  return (
    <CenterComponent style={{ height: '100vh', padding: '10px' }}>
      {props.custom_icon ? 
        <props.custom_icon className={classes.icon} /> : 
        <ErrorIcon className={classes.icon} />
      }
      <Typography component="h5" className={classes.header}>
        {props.title ?? "Erreur"}
      </Typography>
      <Typography component="h6" className={classes.text}>
        {t ?? "Erreur inconnue"}
      </Typography>
      {props.button && <Link className="link no-underline" to={props.button.link} style={{ marginTop: '15px' }}>
        <Button color="primary">
          {props.button.text ?? props.button.link}
        </Button>
      </Link>}
      {props.children}
    </CenterComponent>
  );
};

const EmbeddedError: React.FC<EEProp> = props => {
  let t = props.text as string;

  if (props.error) {
    t = errorToText(props.error);
  }

  let style: any = {};
  if (props.in_container !== false) {
    style['padding'] = "14px";
  }

  return (
    <CenterComponent className={classes.container} style={style}>
      <ErrorIcon className={classes.icon} />
      <Typography component="h5" className={classes.header}>
        Erreur
      </Typography>
      <Typography component="h6" className={classes.text} align="center">
        {t ? t : "Erreur inconnue"}
      </Typography>
      {props.children}
    </CenterComponent>
  )
};

export const EmbeddedInfo: React.FC<{
  text: string, 
  link?: { internal?: boolean; to: string; text?: string; } | string,
  in_container?: boolean,
}> = props => {
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

  let style: any = {};
  if (props.in_container !== false) {
    style['padding'] = "14px";
  }

  return (
    <CenterComponent className={classes.container} style={style}>
      <InfoIcon className={classes.icon} />
      <Typography component="h6" className={classes.text} align="center">
        {t}
      </Typography>
      {link}
      {props.children}
    </CenterComponent>
  )
};

export default EmbeddedError;
